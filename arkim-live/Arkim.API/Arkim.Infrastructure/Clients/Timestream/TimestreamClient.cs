using Amazon.TimestreamQuery;
using Amazon.TimestreamQuery.Model;
using Arkim.Infrastructure.Model.Timestream;
using System.Reflection;

namespace Arkim.Infrastructure.Clients.Timestream
{
	public class TimestreamClient : ITimestreamClient
	{
		private readonly IAmazonTimestreamQuery _client;

		public TimestreamClient(IAmazonTimestreamQuery client)
		{
			_client = client;
		}

		public async Task<T> ExecuteScalarAsync<T>(string queryTemplate, params object[] parameters)
			=> await ExecuteScalarAsync<T>(queryTemplate, ConvertParamsToDictionary(parameters));

		public async Task<T> ExecuteScalarAsync<T>(string queryTemplate, IDictionary<string, object> parameters)
		{
			string processedQuery = ReplaceParametersInQuery(queryTemplate, parameters);
			return await ExecuteScalarAsync<T>(processedQuery);
		}

		public async Task<T> ExecuteScalarAsync<T>(string query)
		{
			var response = await LoadAllPagesAsync(new QueryRequest
			{
				QueryString = query
			});
			if (response == null || response.Rows.Count == 0 || response.Rows[0].Data.Count == 0 || response.Rows[0].Data[0] == null)
			{
				return default(T);
			}
			var val = response.Rows[0].Data[0];
			return (T)Convert.ChangeType(val, typeof(T));
		}

		public async Task<(string NextToken, IEnumerable<T> Data)> ExecuteQuerySinglePageAsync<T>(string queryTemplate, int? maxRows, string nextToken, params object[] parameters)
			=> await ExecuteQuerySinglePageAsync<T>(queryTemplate, maxRows, nextToken, ConvertParamsToDictionary(parameters));

		public async Task<(string NextToken, IEnumerable<T> Data)> ExecuteQuerySinglePageAsync<T>(string queryTemplate, int? maxRows, string nextToken, IDictionary<string, object> parameters)
		{
			string processedQuery = ReplaceParametersInQuery(queryTemplate, parameters);
			if (string.IsNullOrWhiteSpace(nextToken))
			{
				var firstResult = await ExecuteQuerySinglePageAsync<T>(processedQuery, maxRows, nextToken);
				nextToken = firstResult.NextToken;
				if (string.IsNullOrWhiteSpace(nextToken))
				{
					return (null, firstResult.Data);
				}
			}
			return await ExecuteQuerySinglePageAsync<T>(processedQuery, maxRows, nextToken);
		}

		public async Task<(string NextToken, IEnumerable<T> Data)> ExecuteQuerySinglePageAsync<T>(string query, int? maxRows, string nextToken)
		{
			var request = new QueryRequest{	QueryString = query };
			if (maxRows.HasValue)
			{
				request.MaxRows = maxRows.Value;
			}
			if (!string.IsNullOrWhiteSpace(nextToken))
			{
				request.NextToken = nextToken;
			}
			var response = await _client.QueryAsync(request);
			return (nextToken: response.NextToken, result: ParseResponse<T>(response));
		}

		public async Task<IEnumerable<T>> ExecuteQueryCombinedAsync<T>(string queryTemplate, params object[] parameters)
			=> await ExecuteQueryCombinedAsync<T>(queryTemplate, ConvertParamsToDictionary(parameters));

		public async Task<IEnumerable<T>> ExecuteQueryCombinedAsync<T>(string queryTemplate, IDictionary<string, object> parameters)
		{
			string processedQuery = ReplaceParametersInQuery(queryTemplate, parameters);
			return await ExecuteQueryCombinedAsync<T>(processedQuery);
		}

		public async Task<IEnumerable<T>> ExecuteQueryCombinedAsync<T>(string query)
		{
			var response = await LoadAllPagesAsync(new QueryRequest
			{
				QueryString = query,
				
			});
			return ParseResponse<T>(response);
		}

		private IDictionary<string, object> ConvertParamsToDictionary(params object[] parameters)
		{
			var parameterMap = new Dictionary<string, object>();
			if (parameters == null || parameters.Length < 2)
				return parameterMap;
			for (int i = 0; i < parameters.Count(); i += 2)
			{
				var paramName = parameters[i].ToString();
				if (!parameterMap.ContainsKey(paramName))
				{
					parameterMap.Add(paramName, parameters[i + 1]);
				}
			}
			return parameterMap;
		}

		private string ReplaceParametersInQuery(string queryTemplate, IDictionary<string, object> parameters)
		{
			// Seems like Timestream doesn't support parameterized queries, so we have to replace them manually
			// TODO: Make sure it's safe and doesn't allow SQL injection
			string result = queryTemplate;

			foreach (var param in parameters)
			{
				string paramName = param.Key;
				string paramValue = GetSanitizedParameterValue(param.Value);

				result = result.Replace(paramName, paramValue);
			}

			return result;
		}

		private string GetSanitizedParameterValue(object value)
		{
			if (value == null)
				return "NULL";

			switch (value)
			{
				case string strValue:
					return $"'{SanitizeString(strValue)}'";

				case DateTime dateTime:
					return $"FROM_ISO8601_TIMESTAMP('{dateTime:o}')";

				case IEnumerable<string> stringList:
					var sanitizedItems = stringList.Select(s => $"'{SanitizeString(s)}'");
					return string.Join(",", sanitizedItems);

				case bool boolValue:
					return boolValue ? "TRUE" : "FALSE";

				case TimeParameter timeParam:
					return $"{timeParam.Value}{timeParam.TimeUnit}";

				default:
					return value.ToString();
			}
		}

		private string SanitizeString(string input)
		{
			if (string.IsNullOrEmpty(input))
				return string.Empty;

			return input.Replace("'", "''");
		}

		private async Task<QueryResponse?> LoadAllPagesAsync(QueryRequest request)
		{
			var initialResponse = await _client.QueryAsync(request);
			var combinedResponse = initialResponse;

			// Continue paginating if there's a next token
			string nextToken = initialResponse.NextToken;
			while (!string.IsNullOrEmpty(nextToken))
			{
				request.NextToken = nextToken;
				var nextPageResponse = await _client.QueryAsync(request);

				// Merge the data
				combinedResponse.Rows.AddRange(nextPageResponse.Rows);
				nextToken = nextPageResponse.NextToken;
			}
			return combinedResponse;
		}

		private IEnumerable<T> ParseResponse<T>(QueryResponse response)
		{
			var type = typeof(T);
			// Handle simple types (primitives, string, DateTime, etc.)
			if (type.IsPrimitive || type == typeof(string) || type == typeof(DateTime) ||
				type == typeof(decimal) || type == typeof(Guid) ||
				(type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>)))
				return ParseResponseToPrimitive<T>(response);
			else
				return ParseResponseToObject<T>(response);
		}

		private IEnumerable<T> ParseResponseToPrimitive<T>(QueryResponse response)
		{
			var results = new List<T>();
			var type = typeof(T);
			foreach (var row in response.Rows)
			{
				var data = row.Data;
				if (data.Count > 0)
				{
					var val = data[0].ScalarValue;
					if (val != null)
					{
						T converted = (T)Convert.ChangeType(val, Nullable.GetUnderlyingType(type) ?? type);
						results.Add(converted);
					}
					else if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>))
					{
						results.Add(default(T)); // null for nullable types
					}
				}
			}
			return results;
		}

		private IEnumerable<T> ParseResponseToObject<T>(QueryResponse response)
		{
			var results = new List<T>();

			// TODO: Reflection is slow, so we should consider caching the properties
			var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance)
									  .ToDictionary(p => p.Name.ToLowerInvariant());

			var columnNames = response.ColumnInfo.Select(c => c.Name.ToLowerInvariant()).ToArray();

			foreach (var row in response.Rows)
			{
				var data = row.Data;
				var obj = Activator.CreateInstance<T>();

				for (int i = 0; i < data.Count; i++)
				{
					var colName = columnNames[i];
					if (!properties.TryGetValue(colName, out var prop) || !prop.CanWrite)
						continue;

					var val = data[i].ScalarValue;

					if (val != null)
					{
						object converted = Convert.ChangeType(val, prop.PropertyType);
						prop.SetValue(obj, converted);
					}
				}

				results.Add(obj);
			}

			return results;
		}
	}
}
