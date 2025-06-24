import UserBase from "../../types/user/UserBase";
import UserDetails from "../../types/user/UserDetails";
import OperationResult from "../../types/api/OperationResult";
import apiClient from "./apiClient";

const userService = {

	setTheme: async (theme: string): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>("/users/preferences/theme?theme=" + theme, {});
		return response.data;
	},

	setLanguage: async (language: string): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>("/users/preferences/language?language=" + language, {});
		return response.data;
	},

	setDefaultLocation: async (locationId: string): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>("/users/preferences/location?locationId=" + locationId, {});
		return response.data;
	},

	resetPassword: async (oldPassword: string, newPassword: string): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>("/users/preferences/password", { oldPassword, newPassword });
		return response.data;
	},

	list: async (search: string, showInactive: boolean): Promise<UserBase[]> => {
		const response = await apiClient.get<UserDetails[]>(`/users/list?search=${search}&showInactive=${showInactive}`);
		return response.data;
	},

	getByName: async (userName: string): Promise<UserDetails> => {
		const response = await apiClient.get<UserDetails>(`/users?userName=${encodeURIComponent(userName)}`);
		return response.data;
	},

	create: async (user: UserDetails): Promise<OperationResult> => {
		const response = await apiClient.post<OperationResult>("/users", user);
		return response.data;
	},

	update: async (user: UserDetails): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>(`/users`, user);
		return response.data;
	},

	setActiveStatus: async (userName: string, isActive: boolean): Promise<OperationResult> => {
		const response = await apiClient.patch<OperationResult>(`/users/set/active?userName=${userName}&active=${isActive}`, {});
		return response.data;
	},
};

export default userService;
