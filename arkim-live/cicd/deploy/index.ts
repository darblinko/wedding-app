import * as path from "path";
import { deployBackend } from "./src/backend";
import { deployFrontend } from "./src/frontend";
import * as fs from "fs";
import * as readline from "readline";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

/**
 * Arkim Customer Dashboard Deployment Tool
 *
 * A unified tool to handle deployment of both backend and frontend components
 *
 * Usage:
 *   npm run deploy [profile] all| backend| frontend
 *
 * Additional options:
 *   force: Force deployment without prompts
 */

interface DeploymentOptions {
	deployBackend: boolean;
	deployFrontend: boolean;
	awsProfile: string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: DeploymentOptions = {
	deployBackend: false,
	deployFrontend: false,
	awsProfile: "",
};

// Set debug mode if specified
let forceDeployment = false;
const region = "us-west-2"; // Default region, can be changed if needed

// Parse arguments
console.log("Parsing command line arguments:", args);
if (args.length === 0) {
	console.error("Error: No AWS profile specified. The first argument must be profile name.");
	process.exit(1);
}
options.awsProfile = args[0];
for (let i = 1; i < args.length; i++) {
	const arg = args[i];

	switch (arg) {
		case "backend":
		case "be":
			options.deployBackend = true;
			break;
		case "frontend":
		case "fe":
			options.deployFrontend = true;
			break;
		case "all":
			options.deployBackend = true;
			options.deployFrontend = true;
			break;
		case "force":
			forceDeployment = true;
			break;
		default:
			console.error(`Unknown option: ${arg}`);
			process.exit(1);
	}
}

// Validate arguments
if (!options.deployBackend && !options.deployFrontend) {
	console.error("Error: You must specify at least one deployment target: backend, frontend or all");
	process.exit(1);
}

// We'll get the AWS Account ID before running the main application
async function initializeAndRun() {
	try {
		// Get AWS Account ID using AWS SDK
		const stsClient = new STSClient({ region, profile: options.awsProfile });

		const command = new GetCallerIdentityCommand({});
		const response = await stsClient.send(command);

		const awsAccountId = response.Account || "";
		if (!awsAccountId) {
			throw new Error("Empty account ID returned");
		}
		console.log(`AWS Account ID: ${awsAccountId}`);

		// Get the environment name from the AWS account ID
		let environmentName = "";
		try {
			const environmentsFilePath = path.resolve(__dirname, "../../environments.json");
			const environmentsFileContent = fs.readFileSync(environmentsFilePath, "utf8");
			const environments = JSON.parse(environmentsFileContent);
			if (!environments[awsAccountId]) {
				throw new Error(`No environment mapping found for account ID: ${awsAccountId}`);
			}
			environmentName = environments[awsAccountId];
		} catch (error) {
			console.error(`Failed to load environments.json: ${(error as Error).message}`);
			process.exit(1);
		}

		// Run the main application
		await runMain(awsAccountId, environmentName);
	} catch (error) {
		console.error(`Error during initialization: ${(error as Error).message}`);
		process.exit(1);
	}
}

// Main execution function
async function runMain(awsAccountId: string, environmentName: string): Promise<void> {
	console.log("=== ARKIM DASHBOARD DEPLOYMENT TOOL ===");
	console.log(`Starting deployment with the following options:`);
	console.log(`  Deployment targets: ${options.deployBackend ? "Backend " : ""}${options.deployFrontend ? "Frontend" : ""}`);
	console.log(`  AWS Profile: ${options.awsProfile}`);
	console.log(`  AWS Region: ${region}`);
	console.log(`  AWS Account ID: ${awsAccountId}`);
	console.log(`  AWS Environment: ${environmentName}`);
	if (forceDeployment) {
		console.log(`  Force Mode: Enabled (prompts will be auto-confirmed)`);
	}

	console.log("\nStarting deployment process...\n");

	try {
		if (options.deployBackend) {
			const confirmBackend = await confirmAction(`Do you want to deploy the backend to ${environmentName}?`);
			if (confirmBackend) {
				await deployBackend(options.awsProfile, awsAccountId, region);
			} else {
				console.log("Backend deployment skipped.");
			}
		}

		if (options.deployFrontend) {
			const confirmFrontend = await confirmAction(`Do you want to deploy the frontend to ${environmentName}?`);
			if (confirmFrontend) {
				await deployFrontend(options.awsProfile, region);
			} else {
				console.log("Frontend deployment skipped.");
			}
		}

		console.log("\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===");
	} catch (error) {
		console.error("\n=== DEPLOYMENT FAILED ===");
		console.error(`Error: ${(error as Error).message}`);
		process.exit(1);
	}
}

// Function to handle user confirmation with timeout and debug support
async function confirmAction(prompt: string, timeoutMs = 30000): Promise<boolean> {
	if (forceDeployment) {
		console.log(`[FORCE MODE] Auto-confirming: ${prompt} (y)`);
		return true;
	}

	return new Promise<boolean>((resolve) => {
		// Create readline interface for better input handling
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		// Set timeout to prevent hanging
		const timeout = setTimeout(() => {
			console.log("\nInput timeout reached. Defaulting to 'n'");
			rl.close();
			resolve(false);
		}, timeoutMs);

		rl.question(`${prompt} (y/n): `, (answer) => {
			clearTimeout(timeout);
			rl.close();
			resolve(answer.trim().toLowerCase() === "y");
		});
	});
}

initializeAndRun();
