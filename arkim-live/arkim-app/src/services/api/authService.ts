import apiClient from "./apiClient";
import OperationResult from "../../types/api/OperationResult";
import UserLoginDto from "../../types/auth/UserLoginDto";
import UserContextDetails from "../../types/user/UserContextDetails";
import LoginResult from "../../types/auth/LoginResult";

const authService = {
	signIn: async (loginData: UserLoginDto): Promise<LoginResult> => {
		const response = await apiClient.post<LoginResult>("/auth/signin", loginData);
		return response.data;
	},

	getContext: async (): Promise<UserContextDetails> => {
		const response = await apiClient.get<UserContextDetails>("/auth/context");
		return response.data;
	},

	signOut: async (): Promise<OperationResult> => {
		const response = await apiClient.delete<OperationResult>("/auth/signoff");
		return response.data;
	},
};

export default authService;