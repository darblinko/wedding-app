namespace Arkim.Infrastructure.Model.Timestream
{
	internal class TimeParameter
	{
		public int Value { get; set; }
		public string TimeUnit { get; set; }

		public TimeParameter()
		{

		}

		public TimeParameter(int value, string unit)
		{
			Value = value;
			TimeUnit = unit;
		}
	}
}
