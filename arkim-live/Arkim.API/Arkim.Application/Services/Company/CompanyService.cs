using Arkim.Application.DTO;
using Arkim.Application.Model;
using Arkim.Application.Services.Location;
using Arkim.Application.Services.User;
using Arkim.Application.Utils;
using Arkim.Domain.Model.Company;

namespace Arkim.Application.Services.Company
{
	public class CompanyService : ICompanyService
	{
		private readonly ICompanyStorage _storage;
		private readonly IUserService _users;
		private readonly IContextProvider _context;
		private readonly ILocationService _location;

		public CompanyService(ICompanyStorage storage, IUserService users, ILocationService location, IContextProvider context)
		{
			_storage = storage;
			_users = users;
			_context = context;
			_location = location;
		}

		public async Task<OperationResult> SignUpAsync(CompanySignUpDto signUpDetails)
		{
			try
			{
				var company = signUpDetails.GetCompanyDetails();
				var companyValidationResult = await ValidateCompanyCreationAsync(company);
				if (!companyValidationResult.IsSuccess)
				{
					return companyValidationResult;
				}

				var user = signUpDetails.GetUserDetails();
				var userValidationResult = await _users.ValidateUserDataAsync(user);
				if (!userValidationResult.IsSuccess)
				{
					return userValidationResult;
				}


				// Checks passed, try to insert the company, the location and the user, if user fails to insert, rollback the company creation
				var mainLocation = signUpDetails.GetDefaultLocation();
				await _storage.UpsertCompanyAsync(company);
				await _location.CreateLocationAsync(mainLocation);
				user.AssignedLocations = [mainLocation.Id];
				user.DefaultLocation = mainLocation.Id;
				var userResults = await _users.CreateUserAsync(user, company.Id);
				if (!userResults.IsSuccess)
				{
					await _location.DeleteLocationAsync(mainLocation.Id);
					await _storage.DeleteCompanyAsync(company.Id);
				}
				return userResults;
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> ValidateCompanyCreationAsync(CompanyDetails company)
		{
			if (string.IsNullOrWhiteSpace(company.Id))
			{
				return new OperationResult(OperationStatus.IncompleteData, "companyPin");
			}
			if (string.IsNullOrWhiteSpace(company.Name))
			{
				return new OperationResult(OperationStatus.IncompleteData, "companyName");
			}
			if (await _storage.GetCompanyAsync(company.Id) != null)
			{
				return new OperationResult(OperationStatus.AlreadyExists, "company");
			}
			return new OperationResult();
		}

		public async Task<CompanyDetails> GetCompanyAsync()
		{
			var companyId = _context.GetCompanyId();
			return await _storage.GetCompanyAsync(companyId);
		} 

		public async Task<OperationResult> UpdateCompanyAsync(CompanyDetails company)
		{
			try
			{
				// Make sure the Id is always set to the current company Id
				company.Id = _context.GetCompanyId();
				await _storage.UpsertCompanyAsync(company);
				_context.Invalidate();
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}
	}
}
