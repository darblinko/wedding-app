using System.Text.Json;

namespace Arkim.Application.Utils
{
	internal static class TypeUtils
	{
		internal static T CloneWithCast<T>(object obj) where T : class
		{
			if (obj is null)
			{
				return null!;
			}
			if (obj is T castedObj)
			{
				return castedObj;
			}
			return JsonSerializer.Deserialize<T>(JsonSerializer.Serialize(obj))!;
		}
	}
}
