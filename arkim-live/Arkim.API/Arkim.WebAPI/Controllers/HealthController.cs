using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        /// <summary>
        /// Health check endpoint for AWS App Runner
        /// </summary>
        /// <returns>Returns 200 OK with basic health information</returns>
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                version = typeof(HealthController).Assembly.GetName().Version?.ToString() ?? "unknown"
            });
        }
    }
}
