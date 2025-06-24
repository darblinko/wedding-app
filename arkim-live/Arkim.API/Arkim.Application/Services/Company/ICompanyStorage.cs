using Arkim.Domain.Model.Company;

namespace Arkim.Application.Services.Company
{
	public interface ICompanyStorage
	{
		Task<CompanyDetails> GetCompanyAsync(string id);
		Task UpsertCompanyAsync(CompanyDetails company);
		Task DeleteCompanyAsync(string id);
	}
}
