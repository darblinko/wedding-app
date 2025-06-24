using Arkim.Infrastructure.Model.DDB;

namespace Arkim.Infrastructure.Clients.DDB
{
	public interface IDynamoClient
	{
		Task<IEnumerable<T>> ScanAsync<T>(string tableName, IEnumerable<FilterCondition> filters = null);
		Task<T> GetItemAsync<T>(string tableName, string key);
		Task<IEnumerable<T>> GetItemsAsync<T>(string tableName, string rangeKey);
		Task<T> GetItemAsync<T>(string tableName, string rangeKey, string sortKey);
		Task PutItemAsync<T>(string tableName, T item);
		Task DeleteItemAsync(string tableName, string key);
		Task DeleteItemAsync(string tableName, string rangeKey, string sortKey);
	}
}
