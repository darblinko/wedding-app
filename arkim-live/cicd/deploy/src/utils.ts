import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const getFromSsm = async (key: string, awsProfile: string): Promise<string> => {
	const ssm = new SSMClient({ region: "us-west-2", profile: awsProfile });
	const command = new GetParameterCommand({
		Name: key,
		WithDecryption: true,
	});

	try {
		const response = await ssm.send(command);
		if (response.Parameter && response.Parameter.Value) {
			return response.Parameter.Value;
		} else {
			throw new Error(`Parameter ${key} not found`);
		}
	} catch (error) {
		console.error(`Error retrieving parameter ${key}: ${(error as Error).message}`);
		throw error;
	}
};

export { getFromSsm };
