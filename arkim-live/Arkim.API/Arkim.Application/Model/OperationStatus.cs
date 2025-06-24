namespace Arkim.Application.Model
{
	public static class OperationStatus
	{
		public const int IncompleteData = -406;
		public const int NotFound = -404;
		public const int AlreadyExists = -409;
		public const int BadRequest = -400;
		public const int Unauthorized = -401;
		public const int Forbidden = -403;
		public const int Expired = -410;
		public const int UnhandledException = -500;
	}
}
