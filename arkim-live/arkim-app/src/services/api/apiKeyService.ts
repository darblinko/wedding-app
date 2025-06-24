import OperationResult from "../../types/api/OperationResult";
import apiClient from "./apiClient";
import ApiKeyBase from "../../types/apiKeys/ApiKeyBase";
import ApiKeyDetails from "../../types/apiKeys/ApiKeyDetails";

const apiKeyService = {
	list: async (search: string): Promise<ApiKeyBase[]> => {
		const response = await apiClient.get<ApiKeyBase[]>(`/api_keys/list?search=${search}`);
		return response.data;
	},

	generate: async (description: string): Promise<ApiKeyDetails> => {
		const response = await apiClient.post<ApiKeyDetails>("/api_keys/generate", description);
		return response.data;
	},

	revertActiveStatus: async (accessKey: string): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>(`/api_keys/revert_active?accessKey=${accessKey}`, {});
		return response.data;
	},

	delete: async (accessKey: string): Promise<OperationResult> => {
		const response = await apiClient.delete<OperationResult>(`/api_keys?accessKey=${accessKey}`, {});
		return response.data;
	},
};

export default apiKeyService;
