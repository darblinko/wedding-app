namespace Arkim.Application.Model
{
	public class OperationResult
	{
		public bool IsSuccess { get; set; }
		public int ErrorCode { get; set; }
		public string Message { get; set; }
		
		public OperationResult()
		{
			IsSuccess = true;
		}

		public OperationResult(string message) : this()
		{
			Message = message;
		}

		public OperationResult(int errorCode, string message)
		{
			IsSuccess = false;
			ErrorCode = errorCode;
			Message = message;
		}

		public OperationResult(Exception ex) : this(OperationStatus.UnhandledException, ex.Message)
		{
		}
	}
}
