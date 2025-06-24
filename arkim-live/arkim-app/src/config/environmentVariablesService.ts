/**
 * Application configuration
 *
 * This file centralizes all configuration variables from environment variables
 */

export interface ApiConfig {
	baseUrl: string;
}

export interface AppConfig {
	appName: string;
	appVersion: string;
}

const getEnvironmentVariable = (variableName: string) => {
	const variable = process.env[variableName];
	if (!variable) {
		const errorMessage = `Environment variable ${variableName} is not defined`;
		console.error(errorMessage);
	}
	return variable;
};

// API configuration
export const getApiConfig = () => {
	// Make sure to set the REACT_APP_API_BASE_URL in your .env file
	// In production, this should be just api, since it's mounted on the same domain
	// In development, use .env.development to set the API base URL, but it has to end with /api
	return {
		baseUrl: getEnvironmentVariable("REACT_APP_API_BASE_URL"),
	};
};

export const getAppConfig = () => {
	return {
		appName: getEnvironmentVariable("REACT_APP_NAME"),
		appVersion: getEnvironmentVariable("REACT_APP_VERSION"),
	};
};
