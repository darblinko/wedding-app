namespace Arkim.Infrastructure.Clients.Timestream
{

	public interface ITimestreamClient
	{
		Task<T> ExecuteScalarAsync<T>(string query);
		Task<T> ExecuteScalarAsync<T>(string queryTemplate, IDictionary<string, object> parameters);
		Task<T> ExecuteScalarAsync<T>(string queryTemplate, params object[] parameters);
		Task<(string NextToken, IEnumerable<T> Data)> ExecuteQuerySinglePageAsync<T>(string query, int? maxRows, string nextToken);
		Task<(string NextToken, IEnumerable<T> Data)> ExecuteQuerySinglePageAsync<T>(string queryTemplate, int? maxRows, string nextToken, IDictionary<string, object> parameters);
		Task<(string NextToken, IEnumerable<T> Data)> ExecuteQuerySinglePageAsync<T>(string queryTemplate, int? maxRows, string nextToken, params object[] parameters);
		Task<IEnumerable<T>> ExecuteQueryCombinedAsync<T>(string query);
		Task<IEnumerable<T>> ExecuteQueryCombinedAsync<T>(string queryTemplate, IDictionary<string, object> parameters);
		Task<IEnumerable<T>> ExecuteQueryCombinedAsync<T>(string queryTemplate, params object[] parameters);
	}
}
