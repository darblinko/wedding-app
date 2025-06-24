using System.Security.Cryptography;
using System.Text;

namespace Arkim.Application.Utils
{
	internal static class PasswordUtils
	{
		private const int saltBytesCount = 16;

		public static string GetSaltedHashString(string input)
		{
			var salt = GenerateSalt();
			var hash = GetHashBytes(input, salt);

			// Combine salt and hash for storage
			byte[] combinedBytes = new byte[salt.Length + hash.Length];
			Buffer.BlockCopy(salt, 0, combinedBytes, 0, salt.Length);
			Buffer.BlockCopy(hash, 0, combinedBytes, salt.Length, hash.Length);

			// Convert to Base64 string
			return Convert.ToBase64String(combinedBytes);
		}

		public static byte[] GetHashBytes(string input, byte[] salt)
		{
			byte[] hash;
			using (var pbkdf2 = new Rfc2898DeriveBytes(
				input,
				salt,
				10000,
				HashAlgorithmName.SHA256))
			{
				hash = pbkdf2.GetBytes(32);
			}
			return hash;
		}

		public static string GetHashedString(string input, byte[] salt)
		{
			var hash = GetHashBytes(input, salt);
			return Convert.ToBase64String(hash);
		}

		public static bool VerifyHash(string input, string saltedHash)
		{
			var (salt, hash) = SplitSaltAndHash(saltedHash);
			string newHash = GetHashedString(input, salt);
			return newHash == hash;
		}

		public static string GenerateRandomString(int length, bool useAllCharacters = false)
		{
			string validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			if (useAllCharacters)
			{
				validChars += "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
			}

			byte[] randomBytes = new byte[length];
			using (var rng = RandomNumberGenerator.Create())
			{
				rng.GetBytes(randomBytes);
			}

			StringBuilder result = new StringBuilder(length);
			foreach (byte b in randomBytes)
			{
				result.Append(validChars[b % validChars.Length]);
			}
			return result.ToString();
		}

		private static byte[] GenerateSalt()
		{
			byte[] salt = new byte[16];
			using (var rng = RandomNumberGenerator.Create())
			{
				rng.GetBytes(salt);
			}
			return salt;
		}

		private static (byte[] Salt, string Hash) SplitSaltAndHash(string hash)
		{
			byte[] combinedBytes = Convert.FromBase64String(hash);
			byte[] salt = new byte[saltBytesCount];
			Buffer.BlockCopy(combinedBytes, 0, salt, 0, salt.Length);
			byte[] hashBytes = new byte[combinedBytes.Length - salt.Length];
			Buffer.BlockCopy(combinedBytes, salt.Length, hashBytes, 0, hashBytes.Length);
			return (salt, Convert.ToBase64String(hashBytes));
		}
	}
}
