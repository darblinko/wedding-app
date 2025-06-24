/**
 * Frontend deployment module for Arkim Customer Dashboard
 * Handles building React app, syncing to S3, and invalidating CloudFront
 */

import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { getFromSsm } from "./utils";
import { S3Client } from "@aws-sdk/client-s3";
import { S3SyncClient } from "s3-sync-client";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { v4 as uuidv4 } from "uuid";
import mime from 'mime-types';

/**
 * Deploy the frontend application
 */
export async function deployFrontend(awsProfile: string, region: string): Promise<void> {
	const frontendPath = path.resolve("../../arkim-app/");

	console.log("\n=== FRONTEND DEPLOYMENT ===");
	console.log(`AWS Region: ${region}`);
	console.log(`Frontend path: ${frontendPath}`);

	try {
		// Get respository name from SSM parameter store
		const bucketName = await getFromSsm("/arkim/webapp/frontend/websiteBucketName", awsProfile);
		const distributionId = await getFromSsm("/arkim/webapp/frontend/cloudfrontDistributionId", awsProfile);

		if (!bucketName) {
			throw new Error("Bucket name not found in SSM parameter store");
		}
		if (!distributionId) {
			throw new Error("Distribution ID not found in SSM parameter store");
		}

		// Build React app
		buildReactApp(frontendPath);

		// Sync to S3
		await syncToS3(frontendPath, bucketName, awsProfile);

		// Invalidate CloudFront
		await invalidateCloudFront(distributionId, awsProfile);

		console.log("\n✅ Frontend deployment completed successfully!");
	} catch (error) {
		console.error(`\n❌ Frontend deployment failed: ${(error as Error).message}`);
		if ((error as any).stderr) {
			console.error(`Error details: ${(error as any).stderr.toString()}`);
		}
		throw error;
	}
}

/**
 * Build React app
 */
function buildReactApp(frontendPath: string): void {
	console.log("Building React app...");

	try {
		process.chdir(frontendPath);

		// Install dependencies if needed
		if (!fs.existsSync(path.join(frontendPath, "node_modules"))) {
			console.log("Installing dependencies...");
			execSync("npm ci", { stdio: "inherit" });
		}

		// Build the app
		console.log("Running build command...");
		execSync("npm run build", { stdio: "inherit" });

		console.log("✓ React app built successfully");
	} catch (error) {
		throw new Error(`Failed to build React app: ${(error as Error).message}`);
	}
}

/**
 * Sync build files to S3 using S3SyncClient
 */
async function syncToS3(frontendPath: string, bucketName: string, awsProfile: string): Promise<void> {
	console.log("Syncing files to S3...");

	try {
		const buildPath = path.join(frontendPath, "build");

		if (!fs.existsSync(buildPath)) {
			throw new Error(`Build directory not found at ${buildPath}`);
		}

		console.log(`Syncing ${buildPath} to S3 bucket ${bucketName}...`);

		// Create S3 client with profile credentials
		const s3Client = new S3Client({ profile: awsProfile }),
			{ sync } = new S3SyncClient({ client: s3Client });

		// Sync to S3 with appropriate cache settings
		const diff = await sync(buildPath, `s3://${bucketName}`, {
			del: true,
			commandInput: (input: any) => ({
				ContentType: mime.lookup(input.Key) || 'text/html',
			}),

		});
    console.log(`Created: ${diff.created?.length ?? 0}; Updated ${diff.updated?.length ?? 0}; Deleted ${diff.deleted?.length ?? 0}`);

		console.log("✓ Files synced to S3 successfully");
	} catch (error) {
		throw new Error(`Failed to sync files to S3: ${(error as Error).message}`);
	}
}

/**
 * Invalidate CloudFront cache using AWS SDK
 */
async function invalidateCloudFront(distributionId: string, awsProfile: string): Promise<void> {
	console.log("Invalidating CloudFront cache...");

	try {
		// Create CloudFront client with profile credentials
		const cloudFrontClient = new CloudFrontClient({ profile: awsProfile });

		// Create a unique caller reference for this invalidation
		const callerReference = `invalidation-${uuidv4()}`;

		// Create invalidation command
		const invalidationCommand = new CreateInvalidationCommand({
			DistributionId: distributionId,
			InvalidationBatch: {
				CallerReference: callerReference,
				Paths: {
					Quantity: 1,
					Items: ["/*"],
				},
			},
		});

		// Send the invalidation request
		const response = await cloudFrontClient.send(invalidationCommand);

		console.log(`✓ CloudFront invalidation created successfully with ID: ${response.Invalidation?.Id || "unknown"}`);
	} catch (error) {
		throw new Error(`Failed to invalidate CloudFront: ${(error as Error).message}`);
	}
}
