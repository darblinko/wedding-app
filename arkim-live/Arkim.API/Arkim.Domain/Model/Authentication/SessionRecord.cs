namespace Arkim.Domain.Model.Authentication
{
	public class SessionRecord
	{
		public string Id { get; set; }
		public string CompanyId { get; set; }
		public string UserEmail { get; set; }
		public bool IsAdmin { get; set; }
		public DateTime CreatedAtUtc { get; set; }
		public DateTime ExpiresAtUtc { get; set; }
	}
}
