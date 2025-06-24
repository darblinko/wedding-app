import apiClient from "./apiClient";
import OperationResult from "../../types/api/OperationResult";
import AssetBase from "../../types/equipment/AssetBase";
import AssetDetails from "../../types/equipment/AssetDetails";

const equipmentService = {
	list: async (search: string): Promise<AssetBase[]> => {
		const response = await apiClient.get<AssetBase[]>(`/equipment/list?search=${search}`);
		return response.data;
	},

	getById: async (id: string): Promise<AssetDetails> => {
		const response = await apiClient.get<AssetDetails>(`/equipment?id=${encodeURIComponent(id)}`);
		return response.data;
	},

	create: async (asset: AssetDetails): Promise<OperationResult> => {
		const response = await apiClient.post<OperationResult>("/equipment", asset);
		return response.data;
	},

	update: async (asset: AssetDetails): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>(`/equipment`, asset);
		return response.data;
	},

	delete: async (id: string): Promise<OperationResult> => {
		const response = await apiClient.delete<OperationResult>(`/equipment?id=${encodeURIComponent(id)}`);
		return response.data;
	},
};

export default equipmentService;
