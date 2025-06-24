import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	Box,
	Button,
	FormControlLabel,
	Switch,
	Typography,
	CircularProgress,
	Alert,
	Paper,
	Tabs,
	Tab,
	FormControl,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UserDetails from "../../types/user/UserDetails";
import userService from "../../services/api/userService";
import locationService from "../../services/api/locationService";
import Messenger from "../../services/ui/messengerService";
import UserBase from "../../types/user/UserBase";
import LocationBase from "../../types/locations/LocationBase";
import { useUserContext } from "../contexts/AuthContext";
import { ThemeMode } from "../contexts/ThemeContext";
import ThemeSwitcher from "../ui/ThemeSwitcher";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import TabPanel from "../ui/TabPanel";
import LocationAllocations from "./LocationAllocations";
import RequiredDetailsForm, {
	RequiredUserFormData,
	RequiredUserFormErrors,
	validateRequiredUserDetails,
} from "./RequiredDetailsForm";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PlaceIcon from "@mui/icons-material/Place";
import InfoIcon from "@mui/icons-material/Info";

interface UserFormProps {
	selectedUser: UserBase | undefined;
	refreshList: () => Promise<void>;
}

const UserForm: React.FC<UserFormProps> = (props: UserFormProps) => {
	const { t } = useTranslation();
	const userContextDetails = useUserContext();
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState<UserDetails | null>(null);
	const userName = props.selectedUser?.userName;
	const isNew = !props.selectedUser;
	const isCurrentUser = !isNew && userContextDetails?.user?.userName === userName;

	// Add state for locations
	const [locations, setLocations] = useState<LocationBase[]>([]);
	const [loadingLocations, setLoadingLocations] = useState(false);

	const [formData, setFormData] = useState<UserDetails & RequiredUserFormData>({
		userName: "",
		email: "",
		firstName: "",
		lastName: "",
		isAdmin: false,
		isActive: true,
		theme: userContextDetails?.user?.theme || "light",
		language: userContextDetails?.user?.language || "en",
		assignedLocations: [],
		defaultLocation: "",
	});

	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [tabValue, setTabValue] = useState(0);

	// Direct field update function to pass to RequiredDetailsForm
	const updateField = (name: string, value: string | boolean) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear validation errors when a field is updated
		if (formErrors[name]) {
			setFormErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	// Load user data from API - defined before it's used in useEffect
	const loadUserData = useCallback(
		async (userName: string) => {
			setIsLoading(true);
			try {
				const userData = await userService.getByName(userName);
				setUser(userData);
				setFormData({
					userName: userData.userName,
					email: userData.email,
					firstName: userData.firstName,
					lastName: userData.lastName,
					isAdmin: userData.isAdmin,
					isActive: userData.isActive,
					theme: userData.theme || userContextDetails?.user?.theme || "light",
					language: userData.language || userContextDetails?.user?.language || "en",
					assignedLocations: userData.assignedLocations || [],
					defaultLocation: userData.defaultLocation || "",
					// Password fields are not populated for existing users
				});
				setError(null);
			} catch (err: any) {
				setError(`Failed to load user details: ${err.message}`);
				Messenger.error(`Failed to load user details: ${err.message}`);
			} finally {
				setIsLoading(false);
			}
		},
		[userContextDetails]
	);

	// Load locations once when component mounts
	useEffect(() => {
		const fetchLocations = async () => {
			if (locations.length === 0 && !loadingLocations) {
				setLoadingLocations(true);
				try {
					const data = await locationService.list("");
					setLocations(data);

					// If it's a new user, auto-assign all locations and set first as default
					if (isNew && data.length > 0) {
						const allLocationIds = data.map((loc) => loc.id || "").filter((id) => id !== "");
						if (allLocationIds.length > 0) {
							setFormData((prev) => ({
								...prev,
								assignedLocations: allLocationIds,
								defaultLocation: allLocationIds[0],
							}));
						}
					}
				} catch (error) {
					console.error("Failed to load locations:", error);
					setError(t("locations.messages.failedToLoad"));
				} finally {
					setLoadingLocations(false);
				}
			}
		};

		fetchLocations();
	}, [isNew]);

	// Load user data when userName changes
	useEffect(() => {
		if (userName) {
			loadUserData(userName);
		} else {
			// Reset form for new user
			setUser(null);
			setFormData({
				userName: "",
				email: "",
				firstName: "",
				lastName: "",
				isAdmin: false,
				isActive: true,
				password: "",
				confirmPassword: "",
				theme: userContextDetails?.defaultTheme || "light",
				language: userContextDetails?.defaultLanguage || "en",
				assignedLocations: locations.map((loc) => loc.id || ""),
				defaultLocation: locations.length > 0 ? locations[0].id : "",
			});
			setFormErrors({});
		}
	}, [userName, userContextDetails, loadUserData]);

	// Handle form field changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		updateField(name, type === "checkbox" ? checked : value);
	};

	// Handle tab changes
	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	// Handle validation errors from the RequiredDetailsForm component
	const handleValidationErrors = (errors: RequiredUserFormErrors) => {
		setFormErrors(errors as Record<string, string>);
	};

	// Form validation now uses the centralized validation logic
	const validateForm = () => {
		// Use the centralized validation for required user details
		const userErrors = validateRequiredUserDetails(formData, isNew, false, t);

		// Set the errors and return validation result
		setFormErrors(userErrors as Record<string, string>);
		return Object.keys(userErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		// Use the centralized validation
		if (!validateForm()) {
			setTabValue(0);
			return;
		}

		Messenger.confirm(
			isNew ? t("users.confirmations.createUser") : t("users.confirmations.updateUser"),
			isNew ? t("users.confirmations.createUserTitle") : t("users.confirmations.updateUserTitle"),
			async () => {
				setIsSubmitting(true);
				setError(null);

				try {
					let result;
					if (isNew) {
						result = await userService.create(formData);
					} else if (userName) {
						result = await userService.update(formData);
					}

					if (result && result.isSuccess) {
						Messenger.success(isNew ? t("users.messages.userCreated") : t("users.messages.userUpdated"));
						await props.refreshList();
					} else {
						throw new Error(result?.message || "Operation failed");
					}
				} catch (err: any) {
					setError(err.message);
				} finally {
					setIsSubmitting(false);
				}
			}
		);
	};

	// Handle user activation/deactivation
	const handleToggleActive = async () => {
		if (!user || isNew) return;

		Messenger.confirm(
			t("users.confirmations.toggleActiveStatus", {
				action: formData.isActive ? t("users.form.deactivate").toLowerCase() : t("users.form.activate").toLowerCase(),
			}),
			t("users.confirmations.toggleActiveStatusTitle"),
			async () => {
				setIsSubmitting(true);
				setError(null);

				try {
					const newStatus = !formData.isActive;
					const result = await userService.setActiveStatus(formData.userName, newStatus);

					if (result && result.isSuccess) {
						Messenger.success(newStatus ? t("users.messages.userActivated") : t("users.messages.userDeactivated"));
						setFormData({
							...formData,
							isActive: newStatus,
						});
						await props.refreshList();
					} else {
						throw new Error(result?.message || t("users.messages.failedToUpdateStatus"));
					}
				} catch (err: any) {
					setError(err.message);
				} finally {
					setIsSubmitting(false);
				}
			}
		);
	};

	// Handle location assignment change
	const handleLocationAssignmentChanged = (locationId: string, isAssigned: boolean) => {
		setFormData((prev) => {
			// Update assigned locations
			let newAssignedLocations = !prev.assignedLocations ? [] : [...prev.assignedLocations];

			if (isAssigned && !newAssignedLocations.includes(locationId)) {
				newAssignedLocations.push(locationId);
			} else if (!isAssigned) {
				newAssignedLocations = newAssignedLocations.filter((id) => id !== locationId);
			}

			// Handle default location change if needed
			let newDefaultLocation = prev.defaultLocation;

			// If we're removing the location that was the default, pick a new default
			if (!isAssigned && locationId === prev.defaultLocation) {
				newDefaultLocation = newAssignedLocations.length > 0 ? newAssignedLocations[0] : "";
			}

			// If there's no default but we have locations, set the first as default
			if (!newDefaultLocation && newAssignedLocations.length > 0) {
				newDefaultLocation = newAssignedLocations[0];
			}

			return {
				...prev,
				assignedLocations: newAssignedLocations,
				defaultLocation: newDefaultLocation,
			};
		});
	};

	// Handle default location change
	const handleDefaultLocationChanged = (locationId: string) => {
		setFormData((prev) => {
			// Make sure the location is assigned before setting as default
			let newAssignedLocations = !prev.assignedLocations ? [] : [...prev.assignedLocations];

			if (!newAssignedLocations.includes(locationId)) {
				newAssignedLocations.push(locationId);
			}

			return {
				...prev,
				assignedLocations: newAssignedLocations,
				defaultLocation: locationId,
			};
		});
	};

	// Show loading state
	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			{/* Main form */}
			<form
				onSubmit={handleSubmit}
				noValidate
			>
				{error && (
					<Alert
						severity="error"
						sx={{ mb: 2 }}
					>
						{error}
					</Alert>
				)}

				{/* Header with action buttons */}
				<Paper sx={{ mb: 3, p: 2 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography
							variant="subtitle1"
							sx={{ fontWeight: "medium" }}
						>
							{isNew ? t("users.form.createNewUser") : t("users.form.editUser", { userName: formData.userName })}
							{!isNew && (
								<Box
									component="span"
									sx={{
										color: formData.isActive ? "success.main" : "error.main",
										ml: 1,
									}}
								>
									({formData.isActive ? t("users.form.active") : t("users.form.inactive")})
								</Box>
							)}
						</Typography>
						<Box>
							{!isNew && !isCurrentUser && (
								<>
									<Button
										sx={{ marginRight: 1 }}
										color={formData.isActive ? "error" : "success"}
										variant="outlined"
										onClick={handleToggleActive}
										disabled={isSubmitting}
										startIcon={formData.isActive ? <BlockIcon /> : <CheckCircleIcon />}
									>
										{formData.isActive ? t("users.form.deactivate") : t("users.form.activate")}
									</Button>
								</>
							)}
							<Button
								type="submit"
								variant="contained"
								color="primary"
								disabled={isCurrentUser || isSubmitting || isSubmitting}
								startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
							>
								{isSubmitting ? t("common.saving") : t("common.save")}
							</Button>
						</Box>
					</Box>
				</Paper>

				{/* Tabs for organizing form fields */}
				<Paper sx={{ width: "100%", mb: 3 }}>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						variant="scrollable"
						scrollButtons="auto"
					>
						<Tab
							label={t("users.form.tabs.basicInfo")}
							icon={<InfoIcon />}
							iconPosition="start"
						/>
						<Tab
							label={t("users.form.tabs.preferences")}
							icon={<ManageAccountsIcon />}
							iconPosition="start"
						/>
						<Tab
							label={t("users.form.tabs.locations")}
							icon={<PlaceIcon />}
							iconPosition="start"
						/>
					</Tabs>

					{/* Basic Info Tab */}
					<TabPanel
						value={tabValue}
						index={0}
					>
						<Box sx={{ p: 2 }}>
							{/* Using our shared RequiredDetailsForm component with onValidationErrors callback */}
							<RequiredDetailsForm
								formData={formData}
								formErrors={formErrors}
								handleChange={handleChange}
								updateField={updateField}
								isNew={isNew}
								disabled={isSubmitting || isCurrentUser}
								onValidationErrors={handleValidationErrors}
							/>

							{/* Admin status toggle */}
							<FormControlLabel
								control={
									<Switch
										checked={formData.isAdmin || false}
										onChange={handleChange}
										name="isAdmin"
										disabled={isSubmitting || isCurrentUser}
									/>
								}
								label={t("users.form.administrator")}
								sx={{ mt: 2 }}
							/>
						</Box>
					</TabPanel>

					{/* Preferences Tab */}
					<TabPanel
						value={tabValue}
						index={1}
					>
						<Box sx={{ p: 2 }}>
							<Box>
								<FormControl
									component="fieldset"
									sx={{ width: "100%" }}
								>
									<Typography
										variant="subtitle1"
										gutterBottom
									>
										{t("company.defaultTheme")}
									</Typography>
									<ThemeSwitcher
										themeMode={(formData.theme as ThemeMode) || "light"}
										disabled={isSubmitting || isCurrentUser}
										onThemeChange={(theme) => updateField("theme", theme)}
									/>
								</FormControl>

								<FormControl
									component="fieldset"
									sx={{ width: "100%", mt: 1 }}
								>
									<Typography
										variant="subtitle1"
										gutterBottom
									>
										{t("company.defaultLanguage")}
									</Typography>
									<LanguageSwitcher
										language={formData.language}
										disabled={isSubmitting || isCurrentUser}
										onLanguageChange={(language) => updateField("language", language)}
										width="15rem"
									/>
								</FormControl>
							</Box>
						</Box>
					</TabPanel>

					{/* Locations Tab */}
					<TabPanel
						value={tabValue}
						index={2}
					>
						<LocationAllocations
							locations={locations}
							assignedLocations={formData.assignedLocations || []}
							defaultLocation={formData.defaultLocation}
							disabled={isSubmitting || isCurrentUser}
							isLoading={loadingLocations}
							onLocationAssignmentChanged={handleLocationAssignmentChanged}
							onDefaultLocationChanged={handleDefaultLocationChanged}
						/>
					</TabPanel>
				</Paper>
			</form>
		</Box>
	);
};

export default UserForm;
