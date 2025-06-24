using Amazon;

namespace Arkim.Infrastructure.Model.Credentials
{
	public class AwsCredentials
	{
		public string AccessKey { get; set; }
		public string Secret { get; set; }
		public RegionEndpoint Region { get; set; }
	}
}
