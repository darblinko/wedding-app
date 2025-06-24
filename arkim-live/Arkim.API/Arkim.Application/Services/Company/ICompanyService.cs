using Arkim.Application.DTO;
using Arkim.Application.Model;
using Arkim.Domain.Model.Company;

namespace Arkim.Application.Services.Company
{
	public interface ICompanyService
	{
		Task<OperationResult> SignUpAsync(CompanySignUpDto signUpDetails);
		Task<OperationResult> ValidateCompanyCreationAsync(CompanyDetails company);
		Task<CompanyDetails> GetCompanyAsync();
		Task<OperationResult> UpdateCompanyAsync(CompanyDetails company);
	}
}
