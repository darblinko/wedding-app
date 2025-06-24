import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { getEnvironmentConfig } from "./utils";

export interface ArkimFrontendStackProps extends cdk.StackProps {
	projectName: string;
	apiEndpoint: string;
}

export class ArkimFrontendStack extends cdk.Stack {
	public readonly websiteUrl: string;
	public readonly cloudfrontDistributionId: string;

	constructor(scope: Construct, id: string, props: ArkimFrontendStackProps) {
		super(scope, id, props);

		const envConfig = getEnvironmentConfig();
		const domainName = `dashboard${envConfig.isProd ? "" : "." + envConfig.name}.arkim.ai`;

		// Create S3 bucket to host static website
		const websiteBucket = new s3.Bucket(this, "ArkimWebsiteBucket", {
			bucketName: `${props.projectName}-dashboard-${envConfig.name}`,
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "error.html",
			removalPolicy: envConfig.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: !envConfig.isProd,
			publicReadAccess: false,
			encryption: s3.BucketEncryption.S3_MANAGED,
		});

		// Access limited for the CF distribution only
		const originAccessIdentity = new OriginAccessIdentity(this, "OAI", {
			comment: `OAI for ${domainName}`,
		});
		websiteBucket.grantRead(originAccessIdentity);

		// Function to reroute SPA URLs to index.html
		const rewriteToIndexFunction = new cloudfront.Function(this, "RewriteToIndexFunction", {
			comment: "Function to rewrite URLs for SPA",
			code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // Don't rewrite API requests - let them pass through to the API behavior
  if (uri.startsWith('/api/')) {
    return request;
  }
  
  // Check whether the URI is missing a file name.
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } 
  // Check whether the URI is for a file that doesn't exist (e.g. SPA routes)
  else if (!uri.includes('.')) {
    request.uri = '/index.html';
  }
  
  return request;
}
	  `)});

		// Grab the certificate ARN from the SMS parameter store
		const certificateArn = ssm.StringParameter.valueForStringParameter(this, "/arkim/webapp/certificateArn");
		const certificate = Certificate.fromCertificateArn(this, "SiteCertificate", certificateArn);

		// Create CloudFront distribution
		const distribution = new cloudfront.Distribution(this, "ArkimWebsiteDistribution", {
			// TODO: Consider doing better price class for prod
			priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
			comment: `${props.projectName} website distribution - ${envConfig.name}`,
			defaultRootObject: "index.html",
			defaultBehavior: {
				origin: origins.S3BucketOrigin.withOriginAccessIdentity(websiteBucket, {
					originAccessIdentity: originAccessIdentity,
				}),
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
				functionAssociations: [
					{
						function: rewriteToIndexFunction,
						eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
					},
				],
			},
			additionalBehaviors: {
				"/api/*": {
					origin: new origins.HttpOrigin(props.apiEndpoint.replace("https://", "")),
					cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
					allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
					viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
				},
			},
			errorResponses: [
				{
					httpStatus: 404,
					responseHttpStatus: 200,
					responsePagePath: "/index.html",
				},
			],
			certificate: certificate,
			domainNames: [domainName],
		});
		distribution.node.addDependency(websiteBucket);

		// Store the S3 bucket name in the parameter store
		new ssm.StringParameter(this, "WebsiteBucketNameParameter", {
			parameterName: `/arkim/webapp/frontend/websiteBucketName`,
			stringValue: websiteBucket.bucketName,
			description: "The name of the S3 bucket hosting the frontend website",
			tier: ssm.ParameterTier.STANDARD,
		});
		// Store the CloudFront distribution ID in the parameter store
		new ssm.StringParameter(this, "CloudFrontDistributionIdParameter", {
			parameterName: `/arkim/webapp/frontend/cloudfrontDistributionId`,
			stringValue: distribution.distributionId,
			description: "The ID of the CloudFront distribution for the frontend website",
			tier: ssm.ParameterTier.STANDARD,
		});

		// Store the website URL
		this.websiteUrl = `https://${distribution.distributionDomainName}`;
		this.cloudfrontDistributionId = distribution.distributionId;

		// Output frontend URL
		new cdk.CfnOutput(this, "WebsiteUrl", {
			value: this.websiteUrl,
			description: "The URL of the website",
			exportName: `${props.projectName}-${envConfig.name}-website-url`,
		});
	}
}
