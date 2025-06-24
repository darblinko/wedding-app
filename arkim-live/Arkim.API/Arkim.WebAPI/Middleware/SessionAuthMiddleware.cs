using Arkim.Application.Model;
using Arkim.Application.Services.Authentication;
using Arkim.WebAPI.Attributes;
using Arkim.WebAPI.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;
using System.Reflection;

namespace Arkim.WebAPI.Middleware
{
	public class SessionAuthMiddleware
	{
		private readonly RequestDelegate _next;

		public SessionAuthMiddleware(RequestDelegate next)
		{
			_next = next;
		}

		public async Task InvokeAsync(HttpContext context)
		{
			// Check if we need to authenticate this endpoint
			var endpoint = context.GetEndpoint();
			var controllerActionDescriptor = endpoint?.Metadata.GetMetadata<ControllerActionDescriptor>();
			if (controllerActionDescriptor == null)
			{
				await _next(context);
				return;
			}

			// Check if the controller or action has the RequireSessionAuth attribute and the method is not allowed anonymous
			var controllerAttribute = controllerActionDescriptor.ControllerTypeInfo.GetCustomAttribute<RequireSessionAttribute>();
			var actionAttribute = controllerActionDescriptor.MethodInfo.GetCustomAttribute<RequireSessionAttribute>();
			var allowAnonymous = controllerActionDescriptor.MethodInfo.GetCustomAttribute<AllowAnonymousAttribute>() != null;
			var requireAuth = controllerAttribute != null || actionAttribute != null;
			if (allowAnonymous || !requireAuth)
			{
				await _next(context);
				return;
			}

			// TODO: Add logging here to properly log the error, users will only see 401/403 errors
			// Fetch the session ID from the headers
			if (!context.Request.Headers.TryGetValue(RequestHeaders.SessionId, out var sessionId))
			{
				context.Response.StatusCode = StatusCodes.Status401Unauthorized;
				return;
			}

			// Verify session
			var sessionService = context.RequestServices.GetRequiredService<ISessionService>();
			var validationResult = await sessionService.VerifySessionAsync(
				sessionId,
				actionAttribute?.RequireAdmin ?? controllerAttribute?.RequireAdmin ?? false
			);
			if (validationResult != null && !validationResult.IsSuccess)
			{
				context.Response.StatusCode = validationResult.ErrorCode == OperationStatus.Forbidden
					? StatusCodes.Status403Forbidden
					: StatusCodes.Status401Unauthorized;
				return;
			}

			// Set the session in the context
			context.Items["session"] = validationResult;

			// Continue with the pipeline
			await _next(context);
		}
	}
}
