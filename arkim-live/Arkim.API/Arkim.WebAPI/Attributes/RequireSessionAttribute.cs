namespace Arkim.WebAPI.Attributes
{
	[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
	public class RequireSessionAttribute : Attribute
	{
		public bool RequireAdmin { get; set; } = false;
	}
}
