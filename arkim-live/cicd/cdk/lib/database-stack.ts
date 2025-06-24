import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as timestream from "aws-cdk-lib/aws-timestream";
import * as iam from "aws-cdk-lib/aws-iam";
import { Attribute } from "aws-cdk-lib/aws-dynamodb";
import { getEnvironmentConfig } from "./utils";

export interface DatabaseStackProps extends cdk.StackProps {
	projectName: string;
}

const DDB_TABLES = {
	ApiKeys: [["AccessKey", dynamodb.AttributeType.STRING]],
	Assets: [
		["CompanyId", dynamodb.AttributeType.STRING],
		["Id", dynamodb.AttributeType.STRING],
	],
	Companies: [["Id", dynamodb.AttributeType.STRING]],
	Locations: [
		["CompanyId", dynamodb.AttributeType.STRING],
		["Id", dynamodb.AttributeType.STRING],
	],
	SensorsAllocation: [["SensorId", dynamodb.AttributeType.STRING]],
	Sessions: [["Id", dynamodb.AttributeType.STRING]],
	Users: [
		["CompanyId", dynamodb.AttributeType.STRING],
		["Email", dynamodb.AttributeType.STRING],
	],
};
const TIMESTREAM_TABLES = {
	SensorReadings: {
		PartitionKey: "SensorId",
	},
};

/**
 * Stack that creates and manages all database resources for the Arkim application
 * - DynamoDB tables for various application data
 * - Timestream database and table for sensor readings
 * - IAM role that will be exported and attached to AppRunner service
 */
export class ArkimDatabaseStack extends cdk.Stack {
	/**
	 * IAM role that provides access to the database resources
	 * This role needs to be attached to the AppRunner service
	 */
	public readonly runtimeRole: iam.Role;

	constructor(scope: Construct, id: string, props: DatabaseStackProps) {
		super(scope, id, props);

		const envConfig = getEnvironmentConfig();

		// Runtime user group for developers
		const runtimeUserGroup = new iam.Group(this, "WebAppRuntimeUserGroup", {
			groupName: `${props.projectName}-webapp-runtime-users`,
		});

		// Create IAM role for database access
		this.runtimeRole = new iam.Role(this, "WebAppRuntimeRole", {
			assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
			description: "Runtime role for the arkim web application backend",
		});

		// Create DynamoDB tables
		for (const [tableName, attributes] of Object.entries(DDB_TABLES)) {
			const [partitionKey, partitionType] = attributes[0];
			const sortKey = attributes.length > 1 ? attributes[1] : undefined;

			// Create the DynamoDB table
			const table = new dynamodb.Table(this, `${tableName}Table`, {
				tableName: `${props.projectName}.${tableName}`,
				partitionKey: { name: partitionKey, type: partitionType } as Attribute,
				sortKey: sortKey ? ({ name: sortKey[0], type: sortKey[1] } as Attribute) : undefined,
				billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
				removalPolicy: envConfig.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
				pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: envConfig.isProd },
			});

			// Grant permissions to the role and user group
			table.grantReadWriteData(this.runtimeRole);
			table.grantReadWriteData(runtimeUserGroup);
		}

		// Create Timestream database and tables
		const timestreamDatabase = new timestream.CfnDatabase(this, "SensorReadingsDatabase", {
			databaseName: props.projectName,
		});

		for (const [tableName, partitionKeyComponents] of Object.entries(TIMESTREAM_TABLES)) {
			const table = new timestream.CfnTable(this, `${tableName}Table`, {
				databaseName: timestreamDatabase.databaseName!,
				tableName: tableName,
				retentionProperties: {
					memoryStoreRetentionPeriodInHours: "24",
					magneticStoreRetentionPeriodInDays: envConfig.isProd ? "365" : "30",
				},
				schema: {
					// Only 1 partition keys can be specified
					compositePartitionKey: [
						{
							name: partitionKeyComponents.PartitionKey,
							type: "DIMENSION",
							enforcementInRecord: "REQUIRED",
						},
					],
				},
			});

			// Add dependency to ensure database is created first
			table.addDependency(timestreamDatabase);

			// Grant permissions to the role and user group
			const tableReadPolicy = new iam.PolicyStatement({
				effect: iam.Effect.ALLOW,
				actions: ["timestream:Select", "timestream:DescribeTable", "timestream:ListTables", "timestream:ListDatabases"],
				resources: [
					`arn:aws:timestream:${this.region}:${this.account}:database/${timestreamDatabase.databaseName}`,
					`arn:aws:timestream:${this.region}:${this.account}:database/${timestreamDatabase.databaseName}/table/${table.tableName}`,
				],
			});
			this.runtimeRole.addToPolicy(tableReadPolicy);
			runtimeUserGroup.addToPolicy(tableReadPolicy);
		}

		// Grant generic timestream DescribeEndpoints permission
		const timestreamDescribePolicy = new iam.PolicyStatement({
			effect: iam.Effect.ALLOW,
			actions: ["timestream:DescribeEndpoints"],
			resources: ["*"],
		});
		this.runtimeRole.addToPolicy(timestreamDescribePolicy);
		runtimeUserGroup.addToPolicy(timestreamDescribePolicy);

		// Add the missing permissions for the runtime group
		const runtimeGroupPolicy = new iam.PolicyStatement({
			effect: iam.Effect.ALLOW,
			actions: ["dynamodb:ListTables"],
			resources: [`arn:aws:dynamodb:${this.region}:${this.account}:table/*`],
		});
		runtimeUserGroup.addToPolicy(runtimeGroupPolicy);

		// Export only the runtime role for use in the backend stack
		new cdk.CfnOutput(this, "RuntimeUserGroupArn", {
			value: this.runtimeRole.roleArn,
			description: "The ARN of the user group to access database resources",
			exportName: `${props.projectName}-runtime-user-group-arn`,
		});
	}
}
