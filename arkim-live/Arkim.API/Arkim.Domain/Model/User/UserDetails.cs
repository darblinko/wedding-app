namespace Arkim.Domain.Model.User
{
	public class UserDetails : UserBase
	{
		public string Theme { get; set; }
		public string Language { get; set; }
		public string? DefaultLocation { get; set; }
		public IEnumerable<string>? AssignedLocations { get; set; }
	}
}
