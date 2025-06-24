// filepath: e:\Misc\ArkimRepos\dashboard\arkim-app\src\services\api\apiClient.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import { getApiConfig } from "../../config/environmentVariablesService";
import { getSessionId } from "../../storage/authStorage";

// Create an axios instance with default configuration
const apiConfig = getApiConfig();
const apiClient: AxiosInstance = axios.create({
	baseURL: apiConfig.baseUrl,
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding session ID
apiClient.interceptors.request.use(
	(config) => {
		const sessionId = getSessionId();
		if (sessionId) {
			config.headers["X-Arkim-SessionId"] = sessionId;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		// Handle different error status codes
		if (error.response) {
			const { status } = error.response;

			if (status === 401) {
				console.error("Unauthorized access, redirecting to login", error);
				// TODO: Implement a redirect to the login page and clear session from storage and state
			} else if (status === 403) {
				// Handle forbidden
				console.error("Forbidden resource", error);
			} else if (status === 404) {
				// Handle not found
				console.error("Resource not found", error);
			} else if (status >= 500) {
				// Handle server error
				console.error("Server error", error);
			}
		} else if (error.request) {
			// Network error (no response received)
			console.error("Network error", error);
		} else {
			// Request configuration error
			console.error("Request error", error);
		}
		
		return Promise.reject(error);
	}
);

export default apiClient;
