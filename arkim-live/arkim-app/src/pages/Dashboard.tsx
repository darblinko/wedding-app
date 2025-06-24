import React, { useState, useEffect, SyntheticEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	Container,
	Grid,
	Typography,
	Box,
	Paper,
	Tabs,
	Tab,
	Skeleton,
	Chip,
	CircularProgress,
	Snackbar,
	Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useUserContext } from "../components/contexts/AuthContext";
import LocationOverview from "../types/dashboard/LocationOverview";

// Import dashboard components
import AssetCard from "../components/dashboard/AssetCard";

// Import dashboard data service
import dashboardService from "../services/api/dashboardService";
import locationService from "../services/api/locationService";
import LocationBase from "../types/locations/LocationBase";
import { useTheme } from "@mui/material/styles";
import TemperatureChart from "../components/dashboard/TemperatureChart";
import LocationStatusCard from "../components/dashboard/LocationStatusCard";
import HumidityChart from "../components/dashboard/HumidityChart";

const Dashboard: React.FC = () => {
	const { t } = useTranslation();
	const userContextDetails = useUserContext();
	const theme = useTheme();

	const [locations, setLocations] = useState<LocationBase[]>([]);
	const [locationData, setLocationData] = useState<LocationOverview | null>(null);
	const [activeTab, setActiveTab] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [showError, setShowError] = useState<boolean>(false);

	// Handler for tab changes
	const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
		// Clear existing location data
		setLocationData(null);
		// Fetch data for the newly selected location
		fetchLocationData(locations[newValue].id!);
	};
	// Fetch data for a specific location
	const fetchLocationData = useCallback(
		async (locationId: string) => {
			try {
				setRefreshing(true);
				const result = await dashboardService.getLocationOverview(locationId);

				if (result) {
					setLocationData(result);
				} else {
					setError(t("error.failedToFetch"));
					setShowError(true);
				}
			} catch (err) {
				console.error("Error fetching location data:", err);
				setError(t("error.failedToFetch"));
				setShowError(true);
			} finally {
				setRefreshing(false);
			}
		},
		[t, setLocationData, setRefreshing, setError, setShowError]
	);
	// Load user's accessible locations
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				setLoading(true);
				const userLocationsList = await locationService.listUserLocations();

				// Sort locations alphabetically by name
				userLocationsList.sort((a, b) => a.name.localeCompare(b.name));

				if (userLocationsList.length > 0) {
					setLocations(userLocationsList);

					// Determine which location to show first
					let defaultLocationIndex = 0;

					// If user has a default location, use that
					if (userContextDetails?.user?.defaultLocation) {
						const preferredIndex = userLocationsList.findIndex((loc) => loc.id === userContextDetails.user?.defaultLocation);
						if (preferredIndex >= 0) {
							defaultLocationIndex = preferredIndex;
						}
					}

					setActiveTab(defaultLocationIndex);

					// Fetch data for the default location
					await fetchLocationData(userLocationsList[defaultLocationIndex].id!);
				}
			} catch (err) {
				console.error("Error fetching locations:", err);
				setError(t("error.failedToFetch"));
				setShowError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchLocations();
	}, [userContextDetails?.user?.defaultLocation, fetchLocationData, t]); // Refresh data for the current location
	const handleRefresh = useCallback(async () => {
		if (locations.length === 0) return;

		const locationId = locations[activeTab].id;
		await fetchLocationData(locationId!);
	}, [locations, activeTab, fetchLocationData]);
	// Set up auto-refresh timer (every 5 minutes)
	useEffect(() => {
		// Only set up the timer if we have location data
		if (!locationData || locations.length === 0) return;

		// Auto-refresh interval in milliseconds (5 minutes)
		const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

		// Set up the timer
		const timer = setInterval(() => {
			handleRefresh();
		}, AUTO_REFRESH_INTERVAL);

		// Clean up the timer when the component unmounts or when dependencies change
		return () => {
			clearInterval(timer);
		};
	}, [locationData, locations, activeTab, handleRefresh]); // Include handleRefresh in the dependencies

	// Handle error snackbar close
	const handleCloseError = () => {
		setShowError(false);
	};

	// Loading skeleton for dashboard
	if (loading) {
		return (
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					bgcolor: "background.default",
					p: 3,
					overflow: "auto",
				}}
			>
				<Typography
					variant="h5"
					component="h1"
					sx={{ mb: 4 }}
				>
					{t("dashboard.title")}
				</Typography>

				<Container maxWidth="xl">
					<Grid
						container
						spacing={3}
						sx={{ mb: 3 }}
					>
						<Skeleton
							variant="rectangular"
							height={100}
						/>
					</Grid>

					<Grid
						container
						spacing={3}
					>
						<Skeleton
							variant="rectangular"
							height={300}
						/>
					</Grid>

					<Grid
						container
						spacing={3}
						sx={{ mt: 2 }}
					>
						{[...Array(4)].map((_, i) => (
							<Skeleton
								variant="rectangular"
								height={180}
							/>
						))}
					</Grid>
				</Container>

				<Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
					<Skeleton
						variant="rectangular"
						height={48}
					/>
				</Paper>
			</Box>
		);
	}

	// No locations view
	if (locations.length === 0) {
		return (
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					bgcolor: "background.default",
					p: 3,
					overflow: "auto",
				}}
			>
				<Typography
					variant="h5"
					component="h1"
					sx={{ mb: 4 }}
				>
					{t("dashboard.title")}
				</Typography>

				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						p: 5,
						textAlign: "center",
					}}
				>
					<Typography
						variant="h6"
						color="text.secondary"
						gutterBottom
					>
						{t("dashboard.noLocationsTitle")}
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
					>
						{t("dashboard.noLocationsDescription")}
					</Typography>
				</Box>
			</Box>
		);
	}

	return (
		<Box
			component="main"
			sx={{
				flexGrow: 1,
				bgcolor: "background.default",
				p: 3,
				overflow: "auto",
				paddingBottom: "60px", // Add padding to accommodate the bottom tabs
			}}
		>
			{/* Header */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
				<Typography
					variant="h5"
					component="h1"
				>
					{t("dashboard.title")}
				</Typography>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					{refreshing ? (
						<CircularProgress
							size={24}
							sx={{ mr: 1 }}
						/>
					) : (
						<Chip
							icon={<RefreshIcon />}
							label={t("common.refresh")}
							onClick={handleRefresh}
							clickable
							color="primary"
							variant="outlined"
							size="small"
						/>
					)}
				</Box>
			</Box>

			{/* Dashboard Content */}
			<Container maxWidth="xl">
				{!locationData ? (
					<Box sx={{ textAlign: "center", py: 5 }}>
						<CircularProgress size={40} />
						<Typography
							variant="body1"
							sx={{ mt: 2 }}
						>
							{t("dashboard.locationsLoading")}
						</Typography>
					</Box>
				) : (
					<>
						{" "}
						{/* Overall Status Tile */}
						<Grid
							container
							spacing={3}
							sx={{ mb: 3 }}
						>
							<LocationStatusCard locationData={locationData} />
						</Grid>
						{/* Asset Cards */}
						<Typography
							variant="h6"
							sx={{
								mb: 2,
								fontWeight: 600,
								color: theme.palette.text.primary,
							}}
						>
							{t("dashboard.equipmentStatus")}
						</Typography>{" "}
						<Grid
							container
							spacing={3}
							justifyContent={"space-around"}
						>
							{[...locationData.assets]
								.sort((a, b) => {
									// First sort by issues (assets with issues first)
									const aHasIssues = a.issues && typeof a.issues === "object" && Object.keys(a.issues).length > 0;
									const bHasIssues = b.issues && typeof b.issues === "object" && Object.keys(b.issues).length > 0;

									if (aHasIssues && !bHasIssues) return -1;
									if (!aHasIssues && bHasIssues) return 1;

									// Then sort alphabetically by asset name
									return a.asset.name.localeCompare(b.asset.name);
								})
								.map((assetStatus, index) => (
									<AssetCard
										key={assetStatus.asset.id || index}
										assetStatus={assetStatus}
										useMetricSystem={locationData?.location.useMetricSystem}
									/>
								))}
						</Grid>
						<Grid
							container
							spacing={3}
							sx={{ mt: 3 }}
						>
							<TemperatureChart locationOverview={locationData} />
							<HumidityChart locationOverview={locationData} />
						</Grid>
					</>
				)}
			</Container>

			{/* Bottom Location Tabs */}
			<Paper
				sx={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 2,
					boxShadow: 3,
				}}
				elevation={3}
			>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					variant="scrollable"
					scrollButtons="auto"
					textColor="primary"
					indicatorColor="primary"
					aria-label="location tabs"
					centered
					sx={{ width: "100%" }}
				>
					{locations.map((location) => (
						<Tab
							key={location.id}
							label={location.name}
							id={`location-tab-${location.id}`}
							aria-controls={`location-tabpanel-${location.id}`}
						/>
					))}
				</Tabs>
			</Paper>

			{/* Error Snackbar */}
			<Snackbar
				open={showError}
				autoHideDuration={6000}
				onClose={handleCloseError}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseError}
					severity="error"
					sx={{ width: "100%" }}
				>
					{error}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default Dashboard;
