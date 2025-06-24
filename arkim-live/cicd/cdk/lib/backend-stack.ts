import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apprunner from "aws-cdk-lib/aws-apprunner";
import { getEnvironmentConfig } from "./utils";

export interface ArkimBackendStackProps extends cdk.StackProps {
	projectName: string;
	repositoryUri: string;
	deploymentRole: iam.Role;
	runtimeRole: iam.Role;
}

export class ArkimBackendStack extends cdk.Stack {
	public readonly apiEndpoint: string;

	constructor(scope: Construct, id: string, props: ArkimBackendStackProps) {
		super(scope, id, props);

		const envConfig = getEnvironmentConfig();

		// Create the App Runner service
		const appRunnerService = new apprunner.CfnService(this, "AppRunnerService", {
			serviceName: `${props.projectName}-api`,
			sourceConfiguration: {
				authenticationConfiguration: {
					accessRoleArn: props.deploymentRole.roleArn,
				},
				// The freaking service doesn't seem to properly update on the image push
				// So we will be better off by pushing the instance and triggering a redeploy via cli
				autoDeploymentsEnabled: false,
				imageRepository: {
					imageIdentifier: `${props.repositoryUri}:latest`,
					imageRepositoryType: "ECR",
					imageConfiguration: {
						port: "8080",
						runtimeEnvironmentVariables: [
							{
								name: "ASPNETCORE_ENVIRONMENT",
								value: envConfig.isProd ? "Production" : "Development",
							},
						],
						// For secrets, we'll use the App Runner service role to access the secret
						// and set them as environment variables at runtime
					},
				},
			},
			instanceConfiguration: {
				cpu: envConfig.isProd ? "1 vCPU" : "0.5 vCPU",
				memory: envConfig.isProd ? "2 GB" : "1 GB",
				instanceRoleArn: props.runtimeRole.roleArn,
			},
			healthCheckConfiguration: {
				path: "/health",
				protocol: "HTTP",
			},
			autoScalingConfigurationArn: new apprunner.CfnAutoScalingConfiguration(this, "AutoScaling", {
				autoScalingConfigurationName: `${props.projectName}-autoscaling`,
				maxConcurrency: envConfig.isProd ? 100 : 50,
				// TODO: Review the in memory cache to make sure it's not relying on the unsynced cache
				// TODO: Update the autoscaling accordingly
				minSize: 1,
				maxSize: envConfig.isProd ? 5 : 1,
			}).attrAutoScalingConfigurationArn,
		});

		// Store the App Runner service ARN in the parameter store
		new cdk.aws_ssm.StringParameter(this, "AppRunnerServiceArnParameter", {
			parameterName: `/arkim/webapp/backend/serviceArn`,
			stringValue: appRunnerService.attrServiceArn,
			description: "The ARN of the App Runner service for the backend",
			tier: cdk.aws_ssm.ParameterTier.STANDARD,
		});

		// Set the API endpoint
		this.apiEndpoint = `https://${appRunnerService.attrServiceUrl}`;

		// Output the App Runner service URL
		new cdk.CfnOutput(this, "ApiEndpoint", {
			value: this.apiEndpoint,
			description: "The endpoint URL of the API",
			exportName: `${props.projectName}-api-endpoint`,
		});
	}
}
