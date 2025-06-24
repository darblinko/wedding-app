using Arkim.Domain.Model.User;

namespace Arkim.WebAPI.Model.Auth
{
	internal static class AuthorizationPolicies
	{
		public const string Admin = "Admin";

		public static string GetUserGroupName(string policyName)
		{
			switch (policyName)
			{
				case Admin:
					return UserGroup.Admin;
				default:
					throw new ArgumentOutOfRangeException("Not supported policy name for cognito groups mapping", policyName, null);
			}
		}
	}
}
