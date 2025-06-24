import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./i18n/i18n";

// Import our components
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import NotFound from "./components/NotFound";
import MainLayout from "./pages/MainLayout";
import { MessengerProvider } from "./components/contexts/MessengerContext";
import { ThemeProvider } from "./components/contexts/ThemeContext";
import { AuthProvider } from "./components/contexts/AuthContext";
import CompanyManagement from "./pages/CompanyManagement";
import LocationManagement from "./pages/LocationManagement";
import EquipmentManagement from "./pages/EquipmentManagement";
import ApiKeyManagement from "./pages/ApiKeyManagement";
import ReadingsReport from "./pages/ReadingsReport";

function App() {
	return (
		<MessengerProvider>
			<ThemeProvider>
				<AuthProvider>
					<Routes>
						{/* Public Routes */}
						<Route
							path="/login"
							element={<SignIn />}
						/>
						<Route
							path="/signup"
							element={<SignUp />}
						/>

						{/* Protected routes inside the main layout */}
						<Route
							element={
								<ProtectedRoute>
									<MainLayout />
								</ProtectedRoute>
							}
						>
							{/* Default route redirects to dashboard */}
							<Route
								path="/"
								element={
									<Navigate
										to="/dashboard"
										replace
									/>
								}
							/>

							{/* Fallback route for 404 */}
							<Route
								path="*"
								element={<NotFound />}
							/>

							{/* Dashboard */}
							<Route
								path="/dashboard/*"
								element={<Dashboard />}
							/>

							{/* Readings Report */}
							<Route
								path="/readings"
								element={<ReadingsReport />}
							/>

							{/* Admin-only routes */}
							<Route
								path="/company"
								element={
									<AdminRoute>
										<CompanyManagement />
									</AdminRoute>
								}
							/>
							<Route
								path="/locations"
								element={
									<AdminRoute>
										<LocationManagement />
									</AdminRoute>
								}
							/>
							<Route
								path="/users"
								element={
									<AdminRoute>
										<UserManagement />
									</AdminRoute>
								}
							/>
							<Route
								path="/equipment"
								element={
									<AdminRoute>
										<EquipmentManagement />
									</AdminRoute>
								}
							/>
							<Route
								path="/api-keys"
								element={
									<AdminRoute>
										<ApiKeyManagement />
									</AdminRoute>
								}
							/>
						</Route>
					</Routes>
				</AuthProvider>
			</ThemeProvider>
		</MessengerProvider>
	);
}

export default App;
