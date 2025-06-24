import * as fs from "fs";
import * as path from "path";

export interface EnvironmentConfig {
	name: string;
	isProd: boolean;
}

// Load account to environment mapping from environments.json file
let ACCOUNT_TO_ENV_MAP: Record<string, string> = {};

try {
	const environmentsFilePath = path.resolve(__dirname, "../../environments.json");
	const environmentsFileContent = fs.readFileSync(environmentsFilePath, "utf8");
	ACCOUNT_TO_ENV_MAP = JSON.parse(environmentsFileContent);
} catch (error) {
	console.error(`Failed to load environments.json: ${(error as Error).message}`);
	console.warn("Falling back to empty environments map. Make sure environments.json exists and is valid JSON.");
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
	const accountId = process.env.CDK_DEFAULT_ACCOUNT;

	if (!accountId) {
		throw new Error("Stack account ID is not available. Make sure to specify account in stack props.");
	}

	const environmentName = ACCOUNT_TO_ENV_MAP[accountId];

	if (!environmentName) {
		throw new Error(`Unknown account ID: ${accountId}. Please add mapping to ACCOUNT_TO_ENV_MAP.`);
	}

	return {
		name: environmentName,
		isProd: environmentName === "prod",
	};
};
