using Arkim.Application.Model;
using Arkim.Application.Services.Equipment;
using Arkim.Domain.Model.Equipment;
using Arkim.WebAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
	[RequireSession(RequireAdmin = true)]
	[ApiController]
	[Route("api/equipment")]
	public class EquipmentController : ControllerBase
	{
		private readonly IEquipmentService _equipmentService;

		public EquipmentController(IEquipmentService equipmentService)
		{
			_equipmentService = equipmentService;
		}

		[HttpGet]
		[Route("list")]
		public async Task<IEnumerable<AssetBase>> ListCompanyAssetsAsync([FromQuery] string search = "")
			=> await _equipmentService.ListAssetsAsync(search);

		[HttpGet]
		public async Task<AssetDetails> GetAssetDetailsAsync([FromQuery] string id)
			=> await _equipmentService.GetAssetDetailsAsync(id);

		[HttpPost]
		public async Task<OperationResult> CreateAssetAsync([FromBody] AssetDetails asset)
			=> await _equipmentService.CreateAssetAsync(asset);

		[HttpPatch]
		public async Task<OperationResult> UpdateAssetAsync([FromBody] AssetDetails asset)
			=> await _equipmentService.UpdateAssetAsync(asset);

		[HttpDelete]
		public async Task<OperationResult> DeleteAssetAsync([FromQuery] string id)
			=> await _equipmentService.DeleteAssetAsync(id);
	}
}
