/**
 * Backend deployment module for Arkim Customer Dashboard
 * Handles Docker image building and pushing to AWS ECR
 */

import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { getFromSsm } from "./utils";
import { ECRClient, DescribeRepositoriesCommand, GetAuthorizationTokenCommand } from "@aws-sdk/client-ecr";
import { AppRunnerClient, StartDeploymentCommand } from "@aws-sdk/client-apprunner";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

/**
 * Deploy the backend application
 */
export async function deployBackend(awsProfile: string, awsAccountId: string, region: string): Promise<void> {
	const tag = "latest",
		projectFolderPath = path.resolve(__dirname, "../../../../Arkim.API/"),
		dockerfilePath = path.join(projectFolderPath, "Arkim.WebAPI/Dockerfile");

	console.log("\n=== BACKEND DEPLOYMENT ===");
	console.log(`Image tag: ${tag}`);
	console.log(`AWS Region: ${region}`);
	console.log(`Project Folder Path: ${projectFolderPath}`);

	try {
		// Get respository name from SSM parameter store
		const repositoryName = await getFromSsm("/arkim/webapp/backend/repositoryName", awsProfile);

		if (!repositoryName) {
			throw new Error("Repository name not found in SSM parameter store");
		}

		// Create AWS clients with profile credentials
		const appRunnerClient = new AppRunnerClient({ region, profile: awsProfile });

		// Check dependencies
		checkDocker();

		// Verify Dockerfile exists
		checkDockerfile(dockerfilePath);

		// Set ECR URI
		const ecrUri = `${awsAccountId}.dkr.ecr.${region}.amazonaws.com/${repositoryName}`;
		console.log(`ECR Repository URI: ${ecrUri}`);

		// Login to ECR
		await connectToEcr(region, ecrUri, awsProfile);

		// Build Docker image
		buildDockerImage(projectFolderPath, repositoryName, tag, ecrUri);

		// Push Docker image
		await pushDockerImage(ecrUri, tag, region, awsProfile);

		// Clean up local images
		removeLocalImages(repositoryName, tag, ecrUri);

		// Trigger App Runner service update
		await updateAppRunnerService(appRunnerClient, awsProfile, ecrUri, tag);

		console.log("\n✅ Backend deployment completed successfully!");
	} catch (error) {
		throw error;
	}
}

/**
 * Update AppRunner service using AWS SDK
 */
async function updateAppRunnerService(
	appRunnerClient: AppRunnerClient,
	awsProfile: string,
	imageUri: string,
	tag: string
): Promise<void> {
	try {
		console.log("Triggering App Runner service update...");

		let serviceArn: string;
		try {
			serviceArn = await getFromSsm("/arkim/webapp/backend/serviceArn", awsProfile);
			if (!serviceArn) {
				throw new Error("Service ARN not found in SSM parameter store, skipping update.");
			}
		} catch (error) {
			console.error("Failed to retrieve service ARN from SSM");
			console.log("Skipping App Runner service update.");
			return;
		}

		const startDeploymentCmd = new StartDeploymentCommand({
			ServiceArn: serviceArn,
		});

		const response = await appRunnerClient.send(startDeploymentCmd);
		console.log("✓ App Runner start deployment initiated successfully");
		console.log(`Deployment Operation ID: ${response.OperationId}`);
	} catch (error) {
		throw new Error(`Failed to start App Runner deployment: ${(error as Error).message}`);
	}
}

/**
 * Check if required dependencies are installed
 */
function checkDocker(): void {
	try {
		execSync("docker --version", { stdio: "ignore" });
	} catch (error) {
		throw new Error("Docker is not installed or not in PATH");
	}
}

/**
 * Check if Dockerfile exists in the project directory
 */
function checkDockerfile(dockerFilePath: string): void {
	if (!fs.existsSync(dockerFilePath)) {
		throw new Error(`Dockerfile not found at ${dockerFilePath}`);
	}
}

/**
 * Get AWS account ID using AWS SDK
 */
async function getAwsAccountIdSdk(stsClient: STSClient): Promise<string> {
	console.log("Getting AWS account ID...");

	try {
		const command = new GetCallerIdentityCommand({});
		const response = await stsClient.send(command);

		if (!response.Account) {
			throw new Error("Empty account ID returned");
		}

		console.log(`✓ AWS Account ID: ${response.Account}`);
		return response.Account;
	} catch (error) {
		throw new Error(`Failed to get AWS account ID: ${(error as Error).message}`);
	}
}

/**
 * Login to ECR using AWS SDK
 */
async function connectToEcr(region: string, ecrUri: string, awsProfile: string): Promise<void> {
	console.log("Logging in to AWS ECR...");

	try {
		// Get ECR auth token using AWS SDK
		const password = await getEcrAuthToken(region, awsProfile);

		// Login to Docker directly with the password
		execSync(`echo ${password} | docker login --username AWS --password-stdin ${ecrUri}`, {
			shell: "powershell.exe",
		});

		console.log("✓ Successfully logged in to ECR");
	} catch (error) {
		throw new Error(`Failed to login to ECR: ${(error as Error).message}`);
	}
}

/**
 * Check if ECR repository exists
 */
async function checkEcrRepository(ecrClient: ECRClient, repositoryName: string): Promise<void> {
	console.log("Checking if ECR repository exists...");

	try {
		const command = new DescribeRepositoriesCommand({
			repositoryNames: [repositoryName],
		});

		const response = await ecrClient.send(command);

		if (response.repositories && response.repositories.length > 0) {
			console.log("✓ Repository exists");
		} else {
			throw new Error("Repository not found in response");
		}
	} catch (error) {
		throw new Error(`Repository check failed: ${(error as Error).message}`);
	}
}

/**
 * Build Docker image
 */
function buildDockerImage(projectFolderPath: string, repositoryName: string, tag: string, ecrUri: string): void {
	console.log("Building Docker image...");

	try {
		const dockerfilePath = path.join(projectFolderPath, "Arkim.WebAPI/Dockerfile");
		const absolutePath = path.resolve(projectFolderPath);

		console.log(`Docker build context: ${absolutePath}`);
		console.log(`Using Dockerfile: ${dockerfilePath}`);

		// Build Docker image
		execSync(`docker build -t "${repositoryName}:${tag}" -t "${ecrUri}:${tag}" -f "${dockerfilePath}" "${absolutePath}"`, {
			stdio: "inherit",
		});

		console.log("✓ Docker image built successfully");
	} catch (error) {
		throw new Error(`Failed to build Docker image: ${(error as Error).message}`);
	}
}

/**
 * Push Docker image to ECR
 */
async function pushDockerImage(ecrUri: string, tag: string, region: string, awsProfile: string): Promise<void> {
	console.log("Pushing image to ECR...");

	try {
		// Refresh ECR credentials
		console.log("Refreshing ECR credentials...");

		// Get ECR auth token using AWS SDK
		const password = await getEcrAuthToken(region, awsProfile);

		// Login to Docker directly with the password
		execSync(`echo ${password} | docker login --username AWS --password-stdin ${ecrUri}`, {
			shell: "powershell.exe",
		});

		// Push Docker image
		execSync(`docker push "${ecrUri}:${tag}"`, { stdio: "inherit" });

		console.log("✓ Image pushed successfully to ECR");
		console.log(`Image URI: ${ecrUri}:${tag}`);
	} catch (error) {
		throw new Error(`Failed to push image to ECR: ${(error as Error).message}`);
	}
}

/**
 * Remove local Docker images
 */
function removeLocalImages(repositoryName: string, tag: string, ecrUri: string): void {
	console.log("Cleaning up local images...");

	try {
		execSync(`docker rmi "${repositoryName}:${tag}" "${ecrUri}:${tag}"`, { stdio: "ignore" });
	} catch (error) {
		// Ignore errors during cleanup
	}

	console.log("✓ Cleanup completed");
}

/**
 * Get ECR authentication token using AWS SDK
 */
async function getEcrAuthToken(region: string, awsProfile: string): Promise<string> {
	try {
		// Create ECR client with profile credentials
		const ecrClient = new ECRClient({ region, profile: awsProfile });

		// Get ECR authorization token using SDK
		const command = new GetAuthorizationTokenCommand({});
		const response = await ecrClient.send(command);

		if (!response.authorizationData || response.authorizationData.length === 0) {
			throw new Error("No authorization data received from ECR");
		}

		// Get the authorization token
		const authData = response.authorizationData[0];
		const authToken = authData.authorizationToken;

		if (!authToken) {
			throw new Error("Empty authorization token received from ECR");
		}

		// Decode the authorization token (Base64)
		const decoded = Buffer.from(authToken, "base64").toString("utf-8");
		// The decoded token is in the format "AWS:password"
		const password = decoded.substring(decoded.indexOf(":") + 1);

		return password;
	} catch (error) {
		throw new Error(`Failed to get ECR auth token: ${(error as Error).message}`);
	}
}
