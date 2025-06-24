using Arkim.Domain.Model.Location;

namespace Arkim.Application.DTO.Location
{
	public class LocationRecordDto : LocationDetails
	{
		public string CompanyId { get; set; }
	}
}
