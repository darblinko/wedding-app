using Arkim.Application.Model;
using Arkim.Application.Services.Location;
using Arkim.Domain.Model.Location;
using Arkim.WebAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
	[RequireSession(RequireAdmin = false)]
	[ApiController]
	[Route("api/locations")]
	public class LocationsController : ControllerBase
	{
		private readonly ILocationService _locationService;

		public LocationsController(ILocationService locationService)
		{
			_locationService = locationService;
		}

		[HttpGet]
		[Route("list/context")]
		public async Task<IEnumerable<LocationBase>> ListCurrentUserLocationsAsync()
			=> await _locationService.ListCurrentUserLocationsAsync();

		[HttpGet]
		[Route("list")]
		[RequireSession(RequireAdmin = true)]
		public async Task<IEnumerable<LocationBase>> ListCompanyLocationsAsync([FromQuery] string search = "")
			=> await _locationService.ListLocationsAsync(search);

		[HttpGet]
		[RequireSession(RequireAdmin = true)]
		public async Task<LocationDetails> GetLocationDetailsAsync([FromQuery] string id)
			=> await _locationService.GetLocationDetailsAsync(id);

		[HttpPost]
		[RequireSession(RequireAdmin = true)]
		public async Task<OperationResult> CreateLocationAsync([FromBody] LocationDetails location)
			=> await _locationService.CreateLocationAsync(location);

		[HttpPatch]
		[RequireSession(RequireAdmin = true)]
		public async Task<OperationResult> UpdateLocationAsync([FromBody] LocationDetails location)
			=> await _locationService.UpdateLocationAsync(location);

		[HttpDelete]
		[RequireSession(RequireAdmin = true)]
		public async Task<OperationResult> DeleteLocationAsync([FromQuery] string id)
			=> await _locationService.DeleteLocationAsync(id);
	}
}
