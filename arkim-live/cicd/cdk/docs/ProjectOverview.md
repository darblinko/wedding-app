# AWS Entities To Deploy

This document specifies the list of required AWS services to use in deployment and what objects should be created there. We use us-west-1 by default, where it's available

## CDK Project Overview

Following is the order of deployment and what each individual stack is responsible for

1. DatabaseStack - creates the storage structures (full list is below) for the application and fulfills an IAM policy along the way. This IAM policy is exported to be attached to the backend stack, so the app in AppRunner can pick up required runtime permissions
2. BackendStack - creates an ECR repo and an AppRunner instance, attaches the policy from the previous stack to the instance. Exports the AppRunner service URL, so it can be used in the front end stack to create a BFF redirect.
3. FrontendStack - creates an S3 static website hosting bucket, CF distribution for it for https, CDN and custom domain mapping and creates an addtional behavior to redirect */api/* requests to the AppRunner URL provided in the previous step

## Database

Our app uses DDB for master data and AWS Timestream for time series data from the sensors

### DDB Tables

Arkim.ApiKeys:
  Partition Key: AccessKey (S)
Arkim.Assets:
  Partition Key: CompanyId (S)
  Sort Key: Id (S)
Arkim.Companies:
  Partition Key: Id (S)
Arkim.Locations:
  Partition Key: CompanyId (S)
  Sort Key: Id (S)
Arkim.SensorsAllocation:
  Partition Key: SensorId (S)
Arkim.Sessions:
  Partition Key: Id (S)
Arkim.Users:
  Partition Key: CompanyId (S)
  Sort Key: Email (S)

### Timestream Tables

It uses us-west-2 because us-west-1 is not available for it

Database: 
  Arkim
Tables:
  SensorReadings: Composite partition key
    Attribute type: Dimension
    Attribute name: SensorId
    Required

## IAM users

We need a user that will be setup in AppRunner environment variables in order to communicate with our DB and infra from the application. This user will be created/updated as a part of the pipeline CDK deployment

## Backend

1. We create an ECR repo to push the built images to
2. We create an AppRunner instance that will be used as our backend hosting

## Frontend

1. We create the S3 bucket for the static web-site
2. We create the CloudFront distribution to provide https, custom domain and CDN for our application