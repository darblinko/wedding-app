import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";

// Import our components - fixed relative paths
import TopNavBar from "../components/layout/TopNavBar";
import SideMenu from "../components/layout/SideMenu";
import UserPreferences from "../components/layout/UserPreferences";
import AlertsDrawer from "../components/layout/AlertsDrawer";
import alertService from "../services/api/alertService";

const MainLayout: React.FC = () => {
	// State for controlling the visibility of side panels
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
	const [isAlertsOpen, setIsAlertsOpen] = useState(false);
	const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

	// Handlers for the side panels
	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
	const togglePreferences = () => setIsPreferencesOpen(!isPreferencesOpen);
	const closeMenu = () => setIsMenuOpen(false);
	const closePreferences = () => setIsPreferencesOpen(false);
	const toggleAlerts = () => setIsAlertsOpen((prev) => !prev);
	const closeAlerts = () => setIsAlertsOpen(false);

	// Fetch unread notification count every 30 seconds
	useEffect(() => {
		const fetchUnreadCount = async () => {
			try {
				const count = await alertService.countUnhandled();
				setUnreadAlertsCount(count);
			} catch (error) {
				console.error("Failed to fetch unread notification count:", error);
			}
		};

		// Fetch immediately
		fetchUnreadCount();

		// Set up interval
		const intervalId = setInterval(fetchUnreadCount, 30000); // 30 seconds

		return () => clearInterval(intervalId);
	}, []);

	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<CssBaseline />

			{/* Top Navigation Bar */}
			<TopNavBar
				toggleMenu={toggleMenu}
				togglePreferences={togglePreferences}
				toggleAlerts={toggleAlerts}
				unreadAlertsCount={unreadAlertsCount}
			/>

			<Box sx={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
				{/* Left Side Menu - slides in from left */}
				<SideMenu
					isOpen={isMenuOpen}
					onClose={closeMenu}
				/>

				{/* Main Content Area */}
				<Box
					component="main"
					sx={{
						flexGrow: 1,
						overflow: "auto",
						backgroundColor: (theme) => theme.palette.background.default,
					}}
				>
					<Outlet />
				</Box>

				{/* User Preferences Panel - slides in from right */}
				<UserPreferences
					isOpen={isPreferencesOpen}
					onClose={closePreferences}
				/>

				{/* Notifications Panel - slides in from right */}
				<AlertsDrawer
					isOpen={isAlertsOpen}
					onClose={closeAlerts}
				/>
			</Box>
		</Box>
	);
};

export default MainLayout;
