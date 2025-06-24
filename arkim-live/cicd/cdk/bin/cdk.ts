#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ArkimRepositoryStack } from "../lib/repository-stack";
import { ArkimDatabaseStack } from "../lib/database-stack";
import { ArkimBackendStack } from "../lib/backend-stack";
import { ArkimFrontendStack } from "../lib/frontend-stack";
import { getEnvironmentConfig } from "../lib/utils";

const projectName = "arkim";

// Environment configuration
// Timestream is not available in us-west-1, so we use us-west-2 as the default region
const env = {
	// Now we use the account from the profile with cdk deploy --profile <profile>
	//account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
	region: "us-west-2",
};

const app = new cdk.App();
const environmentConfig = getEnvironmentConfig();

// ECR Repository
const repositoryStack = new ArkimRepositoryStack(app, `${projectName}-repository`, {
	env,
	projectName: projectName,
});

// DBs
const databaseStack = new ArkimDatabaseStack(app, `${projectName}-database`, {
	env,
	projectName: projectName,
});

// Backend App
// Important: Don't use this stack before you have created the ECR repository
// and uploaded the Docker image to it
// It will fail on the deployment and rollback the whole thing
const backendStack = new ArkimBackendStack(app, `${projectName}-backend`, {
	env,
	projectName: projectName,
	repositoryUri: repositoryStack.repositoryUri,
	deploymentRole: repositoryStack.deploymentRole,
	runtimeRole: databaseStack.runtimeRole,
});

// Frontend App
new ArkimFrontendStack(app, `${projectName}-frontend`, {
	env,
	projectName: projectName,
	apiEndpoint: backendStack.apiEndpoint,
});

// Tag all resources
cdk.Tags.of(app).add("project", "monitoring");
cdk.Tags.of(app).add("environment", environmentConfig.name);
