import OperationResult from "../../types/api/OperationResult";
import CompanySignupDto from "../../types/company/CompanySignupDto";
import CompanySettings from "../../types/company/CompanySettings";
import apiClient from "./apiClient";

/**
 * Service for company-related API operations
 */
const companyService = {
	/**
	 * Register a new company with an admin user
	 */
	signup: async (signupData: CompanySignupDto): Promise<OperationResult> => {
		const response = await apiClient.post<OperationResult>("/company/signup", signupData);
		return response.data;
	},

	/**
	 * Get company settings
	 */
	getSettings: async (): Promise<CompanySettings> => {
		const response = await apiClient.get<CompanySettings>('/company');
		return response.data;
	},

	/**
	 * Update company settings
	 */
	updateSettings: async (settings: CompanySettings): Promise<OperationResult> => {
		const response = await apiClient.put<OperationResult>('/company', settings);
		return response.data;
	},
};

export default companyService;
