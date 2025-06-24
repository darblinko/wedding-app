# Arkim Customer Dashboard

## Overview

Arkim Customer Dashboard is a web application that provides customer management capabilities including company management, equipment management, location management, user management, and API key management.

## Architecture

The application consists of two main components:

1. **Frontend**: React-based Single Page Application (SPA)
2. **Backend**: .NET API

## Local startup info

The repository has files for both: frontend and backend. Here is the details of how to launch local dev environment.

1. **Frontend**: the files are stored in the arkim-app folder. To start the app you should have the npm installed. It's a normal react TS app, so the starting procedure is the same. Just navigate to the root of the app and run `npm start`. This will start the dev server and open the app in the browser. Default configuration of the backend is pointing to the localhost api as it's configured in the backend config (https://localhost:9012/api). To fully start the dev landscape you would need to start the backend first. Alternatively, if you are only working on the frontend part of the app you can point the app to the deployed version in the dev environment. To do so go to '.env.development' file and change 'REACT_APP_API_BASE_URL=https://localhost:9012/api' -> 'REACT_APP_API_BASE_URL=https://dashboard.dev.arkim.ai/api'. **Make sure this change is not commited to the repo!** You can either assume this file unchanged in git or do this change in .env.development.local file that is git ignored by default.
2. **Backend**: the files are stored in the Arkim.API folder. This is a dockerized app and the development is done in VS 2022 with docker desktop, so those 2 programs are prerequisites. To start the app open Arkim.API.sln in VS 2022. Visual Studio should take care of the docker configuration and will prompt you to start docker desktop if it's not running yet. The databse for this app is sitting in AWS, so you will need to configure user secrets to connect to the database. Right click on the Arkim.WebAPI project -> Manage user secrets. Add "AWS:AccessKey" and "AWS:Secret" values there, pointing to your environment. User secrets don't get commited to git, so no worries about that. Once you have the secrets in place you can simply run your app from the VS using the start button. Make sure the startup type in the start drop down is set to Container (Dockerfile). Once the container is running you can see the openapi documentation at https://localhost:9012/openapi/v1.json and the swagger UI at https://localhost:9012/swagger

## AWS Deployment Architecture

The application is deployed to AWS using the following services:

- **Frontend**: Amazon S3 + CloudFront for static hosting
- **Backend**: AWS App Runner for containerized API deployment
- **Database**:
  - Amazon DynamoDB for document storage (Companies, Locations, Assets, etc.)
  - Amazon Timestream for time series data (Sensor readings)

Phase 1: Initially there is no much value to implement centralized BB pipelines, free BB tier only gives 50 mins of build time and it will be used up in like 15 deployments. Once we have BB paid account and find it handy to automate the CI/CD we can move to the phase 2. For now it will be just script based local build + push to AWS

Phase 2: For the automated deployment we use BitBucket pipelines + AWS CDK project.
We deploy the software to the selected environment (prod/test), where the environments are implemented as separate AWS accounts.
The pipeline is triggered by a tag push in GIT to BitBucket. Tag contains environment and version in it, so test-1.2.3 is v1.2.3 deployed to test environment and prod-1.2.3 is the same, but to the prod environment.

## Environment Configuration

Environments are mapped to the AWS accounts, and the mapping is stored in the cicd/environments.json file. This way the environments can't be mixed up and deployed to wrong accounts. Make sure you update the file if provision a new environment in AWS

## Deployment Prerequisites

This document outlines what have to be done before the BB pipeline can successfully execute the deployment.

### Manual Operations in the AWS Console (1 time configuration to provision the user and the certificate)

1. Create IAM policies from cicd/IAM folder.
2. Create an IAM user and attach those policies to it. Create the access key for the user.
3. Configure locally aws profile with the CLI command `aws configure --profile <environment>`. Input the credentials there from the previously created access key. Make sure you use us-west-2 as the default region.
4. Bootstrap the CDK project by doing `cdk bootstrap --profile <environment>`
5. Detach bootstrap policy from the deployment user
6. Create a wildcarded certificate in ACM, verify it in godaddy. This certificate will be used later for the CF of the web-site and AppRunner for the backend. The certificate must be in us-east-1 AZ, so it can be used by the cloudfront!
7. Once the certificate is verified (godaddy part), add the certificate arn to the SSM -> Parameters Store. Create a new parameter /arkim/webapp/certificateArn with the newly created and verified certificate in the us-west-2 region

### Manual Operations in Godaddy

1. Create a CNAME record to verify the domain ownership after you created the certificate. Make sure you don't add the arkim.ai to the name, godaddy does that behind the scenes.
2. Grab the CF distribution URL from the output of the CDK deploy operation and create a CNAME to map dashboard.<environment>.arkim.ai to the cloudfront URL

## Deployment Overview (Phase 1)

IMPORTANT: The CDK project fails and rolls back if you try to create the app runner before you put something in the connected ECR repository. So first run just ECR stack, push an image to the repo and then you can do `cdk deploy --all`. First 2 steps are for the first execution only on an account

1. Deploy the ECR repository: `cdk deploy arkim-repository --profile <environment>`
2. Push the image to ECR by running using the deployment project `cd cicd/deploy` -> `npm run deploy <environment> backend`
3. Push the services changes via `cdk deploy --all --profile <environment>`. Output of the database stack is the user group, that has all the necessary permissions to work with the application database objects. You can use this group to create the dev users. Users will have to be created manually
4. Navigate to the cicd/deploy project and run it using `npm run deploy <environment> [all|backend|frontend]`
