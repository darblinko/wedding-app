import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	Divider,
	Button,
	FormControl,
	Select,
	MenuItem,
	SelectChangeEvent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import ThemeSwitcher from "../ui/ThemeSwitcher";
import Messenger from "../../services/ui/messengerService";
import { useUserContext, useAuth } from "../contexts/AuthContext";
import { useTheme, ThemeMode } from "../contexts/ThemeContext";
import PasswordResetForm from "./PasswordResetForm";
import LocationBase from "../../types/locations/LocationBase";
import locationService from "../../services/api/locationService";
import userService from "../../services/api/userService";
import OperationResult from "../../types/api/OperationResult";

interface UserPreferencesProps {
	isOpen: boolean;
	onClose: () => void;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ isOpen, onClose }) => {
	const auth = useAuth();
	const { t } = useTranslation();
	const userContextDetails = useUserContext();
	const userDetails = userContextDetails?.user;
	const { themeMode, setThemeMode } = useTheme();
	const [loading, setLoading] = useState(false);
	const [locations, setLocations] = useState<LocationBase[]>([]);

	const updatePreferences = async (updateHandler: () => Promise<OperationResult>) => {
		setLoading(true);
		try {
			const result = await updateHandler();
			if (result.isSuccess) {
				Messenger.success(t("layout.preferences.updateSuccess"));
				auth.refreshContext();
			}
		} catch (error) {
			console.error("Failed to update preferences:", error);
			Messenger.error(t("layout.preferences.updateError"));
		} finally {
			setLoading(false);
		}
	};

	// Handler for theme change - now persists to backend
	const handleThemeChange = (theme: string) => {
		updatePreferences(async () => await userService.setTheme(theme));
	};

	// Handler for language change - now persists to backend
	const handleLanguageChange = (language: string) => {
		updatePreferences(async () => await userService.setLanguage(language));
	};

	// Handler for default location change
	const handleLocationChange = (event: SelectChangeEvent) => {
		const locationId = event.target.value;
		updatePreferences(async () => await userService.setDefaultLocation(locationId));
	};

	// Load available locations that the user has access to
	useEffect(() => {
		if (isOpen && userDetails?.assignedLocations && userDetails.assignedLocations.length > 0) {
			const fetchLocations = async () => {
				try {
					const userLocations = await locationService.listUserLocations();
					setLocations(userLocations);
				} catch (error) {
					console.error("Failed to fetch locations:", error);
					Messenger.error("Failed to load location information");
				}
			};
			fetchLocations();
		}
	}, [isOpen, userDetails?.assignedLocations]);

	// Get navigation hook for redirecting after sign out
	const navigate = useNavigate();

	// Sign out handler using global Messenger
	const openSignOutConfirmation = () => {
		Messenger.confirm(
			t("auth.signOutConfirmation"),
			t("auth.signOut"),
			async () => {
				await auth.signOut();
				navigate("/signedout", { replace: true });
			},
			undefined,
			t("auth.signOut"),
			t("common.cancel")
		);
	};

	return (
		<Drawer
			anchor="right"
			open={isOpen}
			onClose={onClose}
			sx={{
				width: 320,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: 320,
					boxSizing: "border-box",
				},
			}}
		>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					px: 1,
					pt: 9,
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Typography variant="h6">{t("layout.preferences.title")}</Typography>
				<IconButton
					onClick={onClose}
					size="small"
				>
					<CloseIcon />
				</IconButton>
			</Box>

			{/* User Profile Section */}
			<Box
				sx={{
					p: 3,
					display: "flex",
					alignItems: "center",
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Box sx={{ ml: 2 }}>
					<Typography variant="h6">
						{userDetails?.userName || ""}
						{userDetails?.isAdmin && (
							<Box
								component="span"
								sx={{ ml: 1, color: "primary.main", fontWeight: "medium" }}
							>
								{t("layout.preferences.admin")}
							</Box>
						)}
					</Typography>
					<Typography variant="body1">{`${userDetails?.firstName || ""} ${userDetails?.lastName || ""}`}</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						{userDetails?.email || ""}
					</Typography>
				</Box>
			</Box>

			{/* Preferences Content */}
			<Box sx={{ overflow: "auto", flexGrow: 1, p: 2 }}>
				{/* Theme Selection */}
				<Box sx={{ mb: 3 }}>
					<Typography
						variant="subtitle1"
						sx={{
							textTransform: "uppercase",
							fontWeight: "bold",
							mb: 1,
						}}
					>
						{t("layout.preferences.theme.title")}
					</Typography>
					<ThemeSwitcher
						themeMode={themeMode}
						onThemeChange={handleThemeChange}
						disabled={loading}
					/>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* Language Settings */}
				<Box sx={{ mb: 3 }}>
					<Typography
						variant="subtitle1"
						sx={{
							textTransform: "uppercase",
							fontWeight: "bold",
							mb: 1,
						}}
					>
						{t("layout.preferences.language")}
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
						<LanguageSwitcher
							disabled={loading}
							language={userDetails?.language}
							onLanguageChange={handleLanguageChange}
						/>
					</Box>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* Default Location Settings */}
				<Box sx={{ mb: 3 }}>
					<Typography
						variant="subtitle1"
						sx={{
							textTransform: "uppercase",
							fontWeight: "bold",
							mb: 1,
						}}
					>
						{t("layout.preferences.defaultLocation")}
					</Typography>
					<FormControl fullWidth>
						<Select
							id="location-select"
							value={userDetails?.defaultLocation || ""}
							onChange={handleLocationChange}
							disabled={loading}
						>
							{locations.map((location) => (
								<MenuItem
									key={location.id}
									value={location.id}
								>
									{location.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* Password Reset Section */}
				<Box sx={{ mb: 3 }}>
					<Typography
						variant="subtitle1"
						sx={{
							textTransform: "uppercase",
							fontWeight: "bold",
							mb: 1,
						}}
					>
						{t("layout.preferences.security")}
					</Typography>
					<PasswordResetForm />
				</Box>
			</Box>

			{/* Footer with sign out */}
			<Box
				sx={{
					p: 2,
					borderTop: 1,
					borderColor: "divider",
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<Button
					fullWidth
					variant="outlined"
					color="error"
					startIcon={<LogoutIcon />}
					onClick={openSignOutConfirmation}
					sx={{ mb: 2 }}
				>
					{t("auth.signOut")}
				</Button>
			</Box>
		</Drawer>
	);
};

export default UserPreferences;
