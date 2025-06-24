import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import { getEnvironmentConfig } from "./utils";

export interface ArkimRepositoryStackProps extends cdk.StackProps {
	projectName: string;
}

export class ArkimRepositoryStack extends cdk.Stack {
	public readonly repositoryUri: string;
	public readonly deploymentRole: iam.Role;

	constructor(scope: Construct, id: string, props: ArkimRepositoryStackProps) {
		super(scope, id, props);

		const envConfig = getEnvironmentConfig();

		// Create ECR Repository for backend images
		const repository = new ecr.Repository(this, "ArkimBackendRepository", {
			repositoryName: `${props.projectName}-dashboard-backend`,
			removalPolicy: envConfig.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
			lifecycleRules: [
				{
					maxImageCount: 10,
					description: "Keep only the latest 10 images",
				},
			],
		});

		// Output the repository URI
		this.repositoryUri = repository.repositoryUri;

		// Create a role that App Runner will use for the automatic deployments from ECR
		this.deploymentRole = new iam.Role(this, "AppRunnerServiceRole", {
			assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
		});
		repository.grantPull(this.deploymentRole);

		// Store the repository ARN in the parameter store
		new cdk.aws_ssm.StringParameter(this, "RepositoryArnParameter", {
			parameterName: `/arkim/webapp/backend/repositoryName`,
			stringValue: repository.repositoryName,
			description: "ECR repository name for the backend",
			tier: cdk.aws_ssm.ParameterTier.STANDARD,
		});

		// Output the App Runner service role ARN
		new cdk.CfnOutput(this, "AppRunnerServiceRoleArn", {
			value: this.deploymentRole.roleArn,
			description: "The role that App Runner will use to pull images from ECR",
			exportName: `${props.projectName}-backend-deployment-role`,
		});

		// Output the repository URI
		new cdk.CfnOutput(this, "RepositoryUri", {
			value: this.repositoryUri,
			description: "The URI of the ECR repository",
			exportName: `${props.projectName}-backend-repository-uri`,
		});
	}
}
