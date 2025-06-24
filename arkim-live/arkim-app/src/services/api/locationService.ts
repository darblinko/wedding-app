import LocationDetails from "../../types/locations/LocationDetails";
import OperationResult from "../../types/api/OperationResult";
import apiClient from "./apiClient";
import LocationBase from "../../types/locations/LocationBase";

const locationService = {
	list: async (search: string): Promise<LocationBase[]> => {
		const response = await apiClient.get<LocationBase[]>(`/locations/list?search=${search}`);
		return response.data;
	},

	listUserLocations: async (): Promise<LocationBase[]> => {
		const response = await apiClient.get<LocationBase[]>(`/locations/list/context`);
		return response.data;
	},

	getById: async (id: string): Promise<LocationDetails> => {
		const response = await apiClient.get<LocationDetails>(`/locations?id=${encodeURIComponent(id)}`);
		return response.data;
	},

	create: async (location: LocationDetails): Promise<OperationResult> => {
		const response = await apiClient.post<OperationResult>("/locations", location);
		return response.data;
	},

	update: async (location: LocationDetails): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>(`/locations`, location);
		return response.data;
	},

	delete: async (id: string): Promise<OperationResult> => {
		const response = await apiClient.delete<OperationResult>(`/locations?id=${encodeURIComponent(id)}`);
		return response.data;
	},
};

export default locationService;
