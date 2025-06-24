namespace Arkim.Domain.Model.ApiKey
{
	public class ApiKeyBase
	{
		public string? AccessKey { get; set; }
		public string Description { get; set; }
		public bool IsActive { get; set; }
		public DateTime CreatedAtUtc { get; set; }
	}
}
