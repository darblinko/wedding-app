import { createContext, use, useContext, useEffect, useState } from "react";
import authService from "../../services/api/authService";
import UserContextDetails from "../../types/user/UserContextDetails";
import UserLoginDto from "../../types/auth/UserLoginDto";
import { getSessionId, setSessionId, clearSession } from "../../storage/authStorage";
import LoginResult from "../../types/auth/LoginResult";
import { useTranslation } from "react-i18next";
import { useTheme, ThemeMode } from "./ThemeContext";

interface AuthContextType {
	context: UserContextDetails | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	signIn: (loginDetails: UserLoginDto) => Promise<LoginResult>;
	refreshContext: () => Promise<void>;
	signOut: () => Promise<void>;
}

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};

export const useUserContext = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useUserContext must be used within an AuthProvider");
	}

	return context.context;
};

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [context, setContext] = useState<UserContextDetails | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { themeMode, setThemeMode } = useTheme();
	const { i18n } = useTranslation();

	// Set the theme and language based on user context
	useEffect(() => {
		setThemeMode((context?.user?.theme ?? "light") as ThemeMode);
		i18n.changeLanguage(context?.user?.language ?? "en");
	}, [context, setThemeMode, i18n]);

	useEffect(() => {
		const initAuth = async () => {
			setIsLoading(true);
			const sessionId = getSessionId();

			if (sessionId) {
				try {
					const userContext = await authService.getContext();
					if (userContext) {
						setContext(userContext);
					} else {
						clearSession();
					}
				} catch (error) {
					clearSession();
				}
			}
			setIsLoading(false);
		};

		initAuth();
	}, []);

	const signIn = async (loginDetails: UserLoginDto): Promise<LoginResult> => {
		setIsLoading(true);
		try {
			const result = await authService.signIn(loginDetails);
			if (result.isSuccess && result.sessionId && result.context) {
				setSessionId(result.sessionId, loginDetails.longLasting);
				setContext(result.context);
			}
			return result;
		} catch (error) {
			console.error("Sign in error:", error);
			return { isSuccess: false, message: "An unexpected error occurred" } as LoginResult;
		} finally {
			setIsLoading(false);
		}
	};

	const refreshContext = async () => {
		try {
			const userContext = await authService.getContext();
			if (userContext) {
				setContext(userContext);
			}
		} catch (error) {
			console.error("Error refreshing context:", error);
		}
	};

	const signOut = async () => {
		setIsLoading(true);
		try {
			const sessionId = getSessionId();
			if (sessionId) {
				const result = await authService.signOut();
			}
		} catch (error) {
			console.error("Sign out error:", error);
		} finally {
			clearSession();
			setContext(null);
			setIsLoading(false);
		}
	};

	const value = {
		context,
		isAuthenticated: !!context,
		isLoading,
		signIn,
		refreshContext,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
