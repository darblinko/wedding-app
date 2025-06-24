using Arkim.Domain.Model.Authentication;
using Arkim.Domain.Model.Company;
using Arkim.Domain.Model.User;

namespace Arkim.Application.DTO.Auth
{
	public class SessionRecordDetails : SessionRecord
	{
		public CompanyDetails Company { get; set; }
		public UserDetails User { get; set; }

		public SessionRecordDetails()
		{

		}

		public SessionRecordDetails(SessionRecord session, CompanyDetails company, UserDetails user)
		{
			Id = session.Id;
			CreatedAtUtc = session.CreatedAtUtc;
			ExpiresAtUtc = session.ExpiresAtUtc;
			CompanyId = session.CompanyId;
			UserEmail = session.UserEmail;
			IsAdmin = session.IsAdmin;
			Company = company;
			User = user;
		}
	}
}
