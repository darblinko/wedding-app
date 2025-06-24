export interface SensorReading {
	companyId: string;
	assetId: string;
	sensorId: string;
	metricName: string;
	timeUtc: string;
	value: number;
}
