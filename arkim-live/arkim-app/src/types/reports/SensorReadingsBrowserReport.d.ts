import { SensorReading } from "../readings/SensorReading";

export interface SensorReadingsBrowserReport {
	rows: SensorReading[];
	nextToken?: string;
}

export interface SensorReadingsBrowserReportParameters {
	assetIds?: string[];
	sensorIds?: string[];
	metricTypes?: string[];
	nextToken?: string;
}

export interface SensorReadingsFilter {
	assetId: string;
	assetName: string;
	assetDescription: string;
	sensorId: string;
	sensorType: string;
	sensorDescription: string;
}

export interface SensorReadingsBrowserReportConfiguration {
	sensorFilters: SensorReadingsFilter[];
	metricTypes: string[];
}
