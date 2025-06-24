import {
	SensorReadingsBrowserReport,
	SensorReadingsBrowserReportConfiguration,
	SensorReadingsBrowserReportParameters,
} from "../../types/reports/SensorReadingsBrowserReport";
import apiClient from "./apiClient";

const reportsService = {
	getReadingsBrowserReportConfiguration: async (): Promise<SensorReadingsBrowserReportConfiguration> => {
		const response = await apiClient.get<SensorReadingsBrowserReportConfiguration>(`/reports/readings/config`);
		return response.data;
	},

	getReadingsBrowserReport: async (params: SensorReadingsBrowserReportParameters): Promise<SensorReadingsBrowserReport> => {
		const response = await apiClient.post<SensorReadingsBrowserReport>(`/reports/readings`, params);
		return response.data;
	},
};

export default reportsService;
