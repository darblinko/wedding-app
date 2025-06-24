using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arkim.Infrastructure.Model.DDB
{
	internal class TableKeyNames
	{
		public string PartitionKey { get; set; }
		public string? SortKey { get; set; }
	}
}
