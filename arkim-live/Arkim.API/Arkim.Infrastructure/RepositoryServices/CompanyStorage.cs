using Arkim.Application.Services.Company;
using Arkim.Domain.Model.Company;
using Arkim.Infrastructure.Clients.DDB;

namespace Arkim.Infrastructure.RepositoryServices
{
	public class CompanyStorage : ICompanyStorage
	{
		private const string TABLE_NAME = "Companies";

		private readonly IDynamoClient _ddb;

		public CompanyStorage(IDynamoClient ddb)
		{
			_ddb = ddb;
		}

		public async Task<CompanyDetails> GetCompanyAsync(string id)
			=> await _ddb.GetItemAsync<CompanyDetails>(TABLE_NAME, id);

		public async Task UpsertCompanyAsync(CompanyDetails company)
			=> await _ddb.PutItemAsync(TABLE_NAME, company);

		public async Task DeleteCompanyAsync(string id)
			=> await _ddb.DeleteItemAsync(TABLE_NAME, id);
	}
}
