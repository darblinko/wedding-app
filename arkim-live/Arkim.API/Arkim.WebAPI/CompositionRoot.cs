using Arkim.Application;
using Arkim.Application.Services;
using Arkim.Infrastructure;
using Arkim.WebAPI.Services;

namespace Arkim.WebAPI
{
	public static class CompositionRoot
	{
		public static void RegisterServices(WebApplicationBuilder builder)
		{
			var services = builder.Services;
			var configuration = builder.Configuration;

			ApplicationRoot.RegisterServices(services);
			InfrastructureRoot.RegisterServices(services, builder.Configuration);

			// Request pipeline
			services.AddTransient<IContextProvider, ContextProvider>();

			// Http Clients
		}
	}
}
