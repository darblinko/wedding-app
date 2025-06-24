using Arkim.Domain.Model.Equipment;

namespace Arkim.Application.DTO.Equipment
{
	public class AssetRecordDto : AssetDetails
	{
		public string CompanyId { get; set; }
		public string OriginalName { get; set; }
	}
}
