import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "./AuthUI";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		// Show loading spinner or placeholder while checking auth
		return <LoadingSpinner/>;
	}

	return isAuthenticated ? (
		<>{children}</>
	) : (
		<Navigate
			to="/login"
			state={{ from: location }}
			replace
		/>
	);
};

export default ProtectedRoute;
