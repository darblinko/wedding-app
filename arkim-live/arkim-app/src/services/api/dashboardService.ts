import LocationOverview from "../../types/dashboard/LocationOverview";
import apiClient from "./apiClient";

const dashboardService = {
	getLocationOverview: async (locationId: string): Promise<LocationOverview> => {
		const response = await apiClient.get<LocationOverview>(`/dashboard/location?locationId=${locationId}`);
		return response.data;
	},
};

export default dashboardService;
