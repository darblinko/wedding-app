namespace Arkim.Infrastructure.Model.DDB
{
	public class FilterCondition
	{
		public string AttributeName { get; set; }
		public FilterOperator Operator { get; set; }
		public object Value { get; set; }
	}
}
