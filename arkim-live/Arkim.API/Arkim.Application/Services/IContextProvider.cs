using Arkim.Application.DTO.Auth;
using Arkim.Domain.Model.Company;
using Arkim.Domain.Model.User;

namespace Arkim.Application.Services
{
	public interface IContextProvider
	{
		SessionRecordDetails? GetSession();
		string GetSessionId();
		string GetUserEmail();
		UserDetails GetUserDetails();
		string GetCompanyId();
		CompanyDetails GetCompany();
		void Invalidate();
	}
}
