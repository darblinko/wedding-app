using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Arkim.Infrastructure.Model.DDB;
using Microsoft.Extensions.Caching.Memory;
using System.Collections;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Arkim.Infrastructure.Clients.DDB
{
	public class DynamoClient : IDynamoClient
	{
		private const string TableNamePrefix = "arkim.";

		// We cache table schemas here
		private readonly IMemoryCache _cache;

		private readonly IAmazonDynamoDB _client;
		private readonly JsonSerializerOptions _jsonOptions;

		public DynamoClient(IAmazonDynamoDB client, IMemoryCache cache)
		{
			_cache = cache;
			_client = client;

			_jsonOptions = new JsonSerializerOptions
			{
				PropertyNamingPolicy = null,
				DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
			};
		}

		public async Task<IEnumerable<T>> ScanAsync<T>(
			string tableName,
			IEnumerable<FilterCondition> filterConditions = null
		)
		{
			if (string.IsNullOrEmpty(tableName))
			{
				throw new ArgumentException("Table name cannot be null or empty", nameof(tableName));
			}

			// Create a scan request
			var scanRequest = new ScanRequest
			{
				TableName = TableNamePrefix + tableName
			};

			// Apply filters if provided
			if (filterConditions != null && filterConditions.Count() > 0)
			{
				var expressionAttributeValues = new Dictionary<string, AttributeValue>();
				var expressionAttributeNames = new Dictionary<string, string>();
				var filterExpressions = new List<string>();

				for (int i = 0; i < filterConditions.Count(); i++)
				{
					var condition = filterConditions.ElementAt(i);

					if (string.IsNullOrEmpty(condition.AttributeName))
					{
						continue;
					}

					// Convert the filter value to AttributeValue
					var attributeValue = ConvertToAttributeValue(condition.Value);
					var valueToken = $":val{i}";
					expressionAttributeValues[valueToken] = attributeValue;

					// Handle attribute names that might be reserved keywords
					var attributeNameToken = $"#attr{i}";
					expressionAttributeNames[attributeNameToken] = condition.AttributeName;

					// Build individual filter expression
					string operatorExpression = GetOperatorExpression(condition.Operator);
					string singleExpression;

					if (condition.Operator == FilterOperator.BeginsWith ||
						condition.Operator == FilterOperator.Contains ||
						condition.Operator == FilterOperator.NotContains)
					{
						singleExpression = $"{operatorExpression}({attributeNameToken}, {valueToken})";
					}
					else
					{
						singleExpression = $"{attributeNameToken} {operatorExpression} {valueToken}";
					}

					filterExpressions.Add(singleExpression);
				}

				// Combine all expressions with AND
				if (filterExpressions.Count > 0)
				{
					scanRequest.FilterExpression = string.Join(" AND ", filterExpressions);
					scanRequest.ExpressionAttributeValues = expressionAttributeValues;
					scanRequest.ExpressionAttributeNames = expressionAttributeNames;
				}
			}

			var results = new List<T>();
			Dictionary<string, AttributeValue> lastEvaluatedKey = null;

			do
			{
				// Set the exclusive start key if we're paginating
				scanRequest.ExclusiveStartKey = lastEvaluatedKey;

				// Execute the scan
				var response = await _client.ScanAsync(scanRequest);
				results.AddRange(response.Items.Select(ParseItem<T>));

				// Update the pagination token
				lastEvaluatedKey = response.LastEvaluatedKey;
			} while (lastEvaluatedKey != null && lastEvaluatedKey.Count > 0);

			return results;
		}

		// Helper method to convert a value to DynamoDB AttributeValue
		private AttributeValue ConvertToAttributeValue(object value)
		{
			if (value == null)
			{
				return new AttributeValue { NULL = true };
			}
			else if (value is string stringValue)
			{
				return new AttributeValue { S = stringValue };
			}
			else if (value is int intValue || value is long longValue)
			{
				return new AttributeValue { N = value.ToString() };
			}
			else if (value is double doubleValue || value is decimal decimalValue)
			{
				return new AttributeValue { N = value.ToString() };
			}
			else if (value is bool boolValue)
			{
				return new AttributeValue { BOOL = boolValue };
			}
			else if (value is IEnumerable<string> stringList)
			{
				return new AttributeValue { SS = new List<string>(stringList) };
			}
			else if (value is IEnumerable<int> || value is IEnumerable<long> ||
					 value is IEnumerable<double> || value is IEnumerable<decimal>)
			{
				var numberList = ((IEnumerable)value).Cast<object>().Select(x => x.ToString()).ToList();
				return new AttributeValue { NS = numberList };
			}
			else
			{
				// For complex objects, serialize to JSON and store as string
				return new AttributeValue { S = JsonSerializer.Serialize(value, _jsonOptions) };
			}
		}

		private string GetOperatorExpression(FilterOperator op)
		{
			return op switch
			{
				FilterOperator.Equal => "=",
				FilterOperator.NotEqual => "<>",
				FilterOperator.LessThan => "<",
				FilterOperator.LessThanOrEqual => "<=",
				FilterOperator.GreaterThan => ">",
				FilterOperator.GreaterThanOrEqual => ">=",
				FilterOperator.BeginsWith => "begins_with",
				FilterOperator.Contains => "contains",
				FilterOperator.NotContains => "not_contains",
				FilterOperator.In => "in",
				_ => throw new ArgumentException($"Unsupported operator: {op}", nameof(op))
			};
		}

		public async Task<T> GetItemAsync<T>(string tableName, string key)
		{
			if (string.IsNullOrEmpty(tableName))
			{
				throw new ArgumentException("Table name cannot be null or empty", nameof(tableName));
			}

			if (string.IsNullOrEmpty(key))
			{
				throw new ArgumentException("Key cannot be null or empty", nameof(key));
			}

			// Create a GetItem request
			var keyNames = await GetTableKeyNamesAsync(tableName);
			var request = new GetItemRequest
			{
				TableName = TableNamePrefix + tableName,
				Key = new Dictionary<string, AttributeValue>
				{
					{ keyNames.PartitionKey, new AttributeValue { S = key } }
				}
			};

			var response = await _client.GetItemAsync(request);

			if (response.Item == null || response.Item.Count == 0)
			{
				return default;
			}

			return ParseItem<T>(response.Item);
		}

		public async Task<IEnumerable<T>> GetItemsAsync<T>(string tableName, string rangeKey)
		{
			if (string.IsNullOrEmpty(tableName))
			{
				throw new ArgumentException("Table name cannot be null or empty", nameof(tableName));
			}

			if (string.IsNullOrEmpty(rangeKey))
			{
				throw new ArgumentException("Range key cannot be null or empty", nameof(rangeKey));
			}

			// Query items by range key
			var keyNames = await GetTableKeyNamesAsync(tableName);
			var request = new QueryRequest
			{
				TableName = TableNamePrefix + tableName,
				KeyConditionExpression = $"{keyNames.PartitionKey} = :pk",
				ExpressionAttributeValues = new Dictionary<string, AttributeValue>
				{
					{ ":pk", new AttributeValue { S = rangeKey } }
				}
			};
			var results = new List<T>();
			Dictionary<string, AttributeValue> lastEvaluatedKey = null;
			do
			{
				// Set the exclusive start key if we're paginating
				request.ExclusiveStartKey = lastEvaluatedKey;
				// Execute the query
				var response = await _client.QueryAsync(request);
				results.AddRange(response.Items.Select(ParseItem<T>));
				// Update the pagination token
				lastEvaluatedKey = response.LastEvaluatedKey;
			} while (lastEvaluatedKey != null && lastEvaluatedKey.Count > 0);
			return results;
		}

		public async Task<T> GetItemAsync<T>(string tableName, string rangeKey, string sortKey)
		{
			if (string.IsNullOrEmpty(tableName))
			{
				throw new ArgumentException("Table name cannot be null or empty", nameof(tableName));
			}

			if (string.IsNullOrEmpty(rangeKey))
			{
				throw new ArgumentException("Range key cannot be null or empty", nameof(rangeKey));
			}

			if (string.IsNullOrEmpty(sortKey))
			{
				throw new ArgumentException("Sort key cannot be null or empty", nameof(sortKey));
			}

			// Create a GetItem request
			var keyNames = await GetTableKeyNamesAsync(tableName);
			var request = new GetItemRequest
			{
				TableName = TableNamePrefix + tableName,
				Key = new Dictionary<string, AttributeValue>
				{
					{ keyNames.PartitionKey, new AttributeValue { S = rangeKey } },
					{ keyNames.SortKey, new AttributeValue { S = sortKey } }
				}
			};

			var response = await _client.GetItemAsync(request);
			return ParseItem<T>(response.Item);
		}

		public async Task PutItemAsync<T>(string tableName, T item)
		{
			if (string.IsNullOrEmpty(tableName))
			{
				throw new ArgumentException("Table name cannot be null or empty", nameof(tableName));
			}

			if (item == null)
			{
				throw new ArgumentNullException(nameof(item));
			}

			// Convert the item to JSON
			string json = JsonSerializer.Serialize(item, _jsonOptions);

			// Parse the JSON to a Document
			var document = Document.FromJson(json);

			// Convert the document to an attribute map
			var itemAttributes = document.ToAttributeMap();

			// Create a PutItem request
			var request = new PutItemRequest
			{
				TableName = TableNamePrefix + tableName,
				Item = itemAttributes
			};

			await _client.PutItemAsync(request);
		}

		public async Task DeleteItemAsync(string tableName, string key)
		{
			if (string.IsNullOrEmpty(tableName))
			{
				throw new ArgumentException("Table name cannot be null or empty", nameof(tableName));
			}

			if (string.IsNullOrEmpty(key))
			{
				throw new ArgumentException("Key cannot be null or empty", nameof(key));
			}

			// Create a DeleteItem request
			var request = new DeleteItemRequest
			{
				TableName = TableNamePrefix + tableName,
				Key = new Dictionary<string, AttributeValue>
				{
					{ (await GetTableKeyNamesAsync(tableName)).PartitionKey, new AttributeValue { S = key } }
				}
			};

			await _client.DeleteItemAsync(request);
		}

		public async Task DeleteItemAsync(string tableName, string rangeKey, string sortKey)
		{
			if (string.IsNullOrEmpty(tableName))
			{
				throw new ArgumentException("Table name cannot be null or empty", nameof(tableName));
			}

			if (string.IsNullOrEmpty(rangeKey))
			{
				throw new ArgumentException("Range key cannot be null or empty", nameof(rangeKey));
			}
			if (string.IsNullOrEmpty(sortKey))
			{
				throw new ArgumentException("Sort key cannot be null or empty", nameof(sortKey));
			}

			// Create a DeleteItem request
			var keyNames = await GetTableKeyNamesAsync(tableName);
			var request = new DeleteItemRequest
			{
				TableName = TableNamePrefix + tableName,
				Key = new Dictionary<string, AttributeValue>
				{
					{ keyNames.PartitionKey, new AttributeValue { S = rangeKey } },
					{ keyNames.SortKey, new AttributeValue { S = sortKey } }
				}
			};

			await _client.DeleteItemAsync(request);
		}

		private async Task<TableKeyNames> GetTableKeyNamesAsync(string tableName)
		{
			var cacheKey = $"ddb.tableKeys.{tableName}";
			if (_cache.TryGetValue(cacheKey, out TableKeyNames names))
			{
				return names;
			}

			names = new TableKeyNames();
			var request = new DescribeTableRequest
			{
				TableName = TableNamePrefix + tableName
			};
			var response = await _client.DescribeTableAsync(request);
			names.PartitionKey = response.Table.KeySchema.First(k => k.KeyType == KeyType.HASH).AttributeName;
			names.SortKey = response.Table.KeySchema.FirstOrDefault(k => k.KeyType == KeyType.RANGE)?.AttributeName;

			_cache.Set(cacheKey, names, TimeSpan.FromHours(12));
			return names;
		}

		private T ParseItem<T>(Dictionary<string, AttributeValue> item)
		{
			if (item == null || item.Count == 0)
			{
				return default;
			}
			var document = Document.FromAttributeMap(item);
			string json = document.ToJson();
			return JsonSerializer.Deserialize<T>(json, _jsonOptions);

		}
	}
}
