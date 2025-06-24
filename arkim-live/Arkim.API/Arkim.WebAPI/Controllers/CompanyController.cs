using Arkim.Application.DTO;
using Arkim.Application.Model;
using Arkim.Application.Services.Company;
using Arkim.Domain.Model.Company;
using Arkim.WebAPI.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
	[RequireSession(RequireAdmin = true)]
	[ApiController]
	[Route("api/company")]
	public class CompanyController : ControllerBase
	{
		private readonly ICompanyService _companyService;

		public CompanyController(ICompanyService companyService)
		{
			_companyService = companyService;
		}

		[AllowAnonymous]
		[HttpPost]
		[Route("signup")]
		public async Task<OperationResult> SignUpAsync([FromBody] CompanySignUpDto signUpDetails)
			=> await _companyService.SignUpAsync(signUpDetails);

		[HttpGet]
		public async Task<CompanyDetails> GetCompanyAsync()
			=> await _companyService.GetCompanyAsync();

		[HttpPut]
		public async Task<OperationResult> UpdateCompanyAsync([FromBody] CompanyDetails company)
			=> await _companyService.UpdateCompanyAsync(company);
	}
}
