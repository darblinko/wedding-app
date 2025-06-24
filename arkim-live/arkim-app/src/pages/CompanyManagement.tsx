import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Box,
	Typography,
	IconButton,
	Tooltip,
	CircularProgress,
	Alert,
	Button,
	Paper,
	Tab,
	Tabs,
	TextField,
	FormControl,
	FormHelperText,
	Grid,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";

import CompanySettings from "../types/company/CompanySettings";
import companyService from "../services/api/companyService";
import Messenger from "../services/ui/messengerService";
import { useAuth } from "../components/contexts/AuthContext";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import UnitSystemSwitcher from "../components/ui/UnitSystemSwitcher";
import TabPanel from "../components/ui/TabPanel";
import { ThemeMode } from "../components/contexts/ThemeContext";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import InfoIcon from "@mui/icons-material/Info";

const CompanyManagement: React.FC = () => {
	const { t } = useTranslation();
	const auth = useAuth();

	const [settings, setSettings] = useState<CompanySettings | null>(null);
	const [formData, setFormData] = useState<CompanySettings | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [tabValue, setTabValue] = useState(0);

	// Fetch company settings when component mounts
	useEffect(() => {
		fetchCompanySettings();
	}, []);

	// Update formData when settings are fetched
	useEffect(() => {
		if (settings) {
			setFormData(settings);
		}
	}, [settings]);

	// Fetch company settings from the API
	const fetchCompanySettings = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await companyService.getSettings();
			setSettings(data);
		} catch (err: any) {
			console.error("Failed to fetch company settings:", err);
			setError(err.message || "Failed to fetch company settings");
			Messenger.error("Failed to fetch company settings");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle form field changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		if (!formData) return;

		setFormData({ ...formData, [name]: value });

		// Clear validation error when field is modified
		if (errors[name]) {
			const newErrors = { ...errors };
			delete newErrors[name];
			setErrors(newErrors);
		}
	};

	// Handle unit system change
	const handleUnitSystemChange = (useMetric: boolean) => {
		if (!formData) return;
		setFormData({ ...formData, useMetricSystem: useMetric });
	};

	// Handle theme change
	const handleThemeChange = (theme: ThemeMode) => {
		if (!formData) return;
		setFormData({ ...formData, defaultTheme: theme });
	};

	// Handle language change
	const handleLanguageChange = (language: string) => {
		if (!formData) return;
		setFormData({ ...formData, defaultLanguage: language });
	};

	// Handle tab changes
	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	// Validate form data
	const validateForm = (): boolean => {
		if (!formData) return false;

		const newErrors: Record<string, string> = {};

		if (!formData.name?.trim()) {
			newErrors.name = t("validation.companyNameRequired");
		}

		if (!formData.email?.trim()) {
			newErrors.email = t("validation.emailRequired");
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = t("validation.emailInvalid");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const saveSettings = async () => {
		if (!formData) return;

		setIsSaving(true);

		try {
			// Submit the form data to the API
			const result = await companyService.updateSettings(formData);

			if (result.isSuccess) {
				Messenger.success(t("company.settingsSaved"));

				// Refresh the context with the new company settings
				auth.refreshContext();

				// Update the original settings with the saved data
				setSettings(formData);
			} else {
				Messenger.error(result.message || t("company.saveFailed"));
			}
		} catch (err: any) {
			console.error("Failed to save company settings:", err);
			Messenger.error(`${t("company.saveFailed")}: ${err.message}`);
		} finally {
			setIsSaving(false);
		}
	};

	// Handle save button click
	const handleSave = async () => {
		// Validate the form
		if (!validateForm()) {
			// Switch to the first tab if there are validation errors
			setTabValue(0);
			return;
		}

		Messenger.confirm(
			t("company.saveConfirmation"),
			t("common.confirmationTitle"),
			async () => {
				await saveSettings();
			},
			undefined,
			t("common.save"),
			t("common.cancel")
		);
	};

	return (
		<Box sx={{ p: 3, mx: "auto" }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
				{/* Header with title and icon */}
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<BusinessIcon sx={{ fontSize: 28, mr: 2, color: "primary.main" }} />
					<Typography
						variant="h5"
						component="h1"
					>
						{t("company.companySettings")}
					</Typography>
				</Box>

				{/* Form Actions */}
				<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
					<Tooltip title={t("common.refresh")}>
						<IconButton
							onClick={fetchCompanySettings}
							disabled={isLoading || isSaving}
						>
							{isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
						</IconButton>
					</Tooltip>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSave}
						startIcon={
							isSaving ? (
								<CircularProgress
									size={20}
									color="inherit"
								/>
							) : (
								<SaveIcon />
							)
						}
						disabled={isLoading || isSaving || !formData}
					>
						{isSaving ? t("common.saving") : t("common.save")}
					</Button>
				</Box>
			</Box>

			{/* Content area */}
			{isLoading && !formData ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress size={40} />
				</Box>
			) : error ? (
				<Alert
					severity="error"
					sx={{ mb: 3 }}
				>
					{error}
				</Alert>
			) : formData ? (
				<Box
					component="form"
					onSubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
					sx={{ mb: 3 }}
				>
					{/* Tabs for organizing form fields */}
					<Paper sx={{ width: "100%", mb: 3 }}>
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							variant="scrollable"
							scrollButtons="auto"
						>
							<Tab
								label={t("company.basicInformation")}
								icon={<InfoIcon />}
								iconPosition="start"
							/>
							<Tab
								label={t("company.preferences")}
								icon={<ManageAccountsIcon />}
								iconPosition="start"
							/>
						</Tabs>

						{/* Company Information Tab */}
						<TabPanel
							value={tabValue}
							index={0}
						>
							<Box sx={{ p: 2 }}>
								<Grid
									container
									spacing={3}
								>
									<TextField
										name="id"
										label={t("company.companyId")}
										fullWidth
										value={formData.id || ""}
										disabled
									/>
									<TextField
										name="name"
										label={t("company.companyName")}
										fullWidth
										value={formData.name || ""}
										onChange={handleChange}
										error={!!errors.name}
										helperText={errors.name}
										required
										disabled={isSaving}
									/>
									<TextField
										name="address"
										label={t("company.address")}
										fullWidth
										value={formData.address || ""}
										onChange={handleChange}
										disabled={isSaving}
									/>
									<TextField
										name="email"
										label={t("company.email")}
										fullWidth
										value={formData.email || ""}
										onChange={handleChange}
										error={!!errors.email}
										helperText={errors.email}
										required
										disabled={isSaving}
									/>
								</Grid>
							</Box>
						</TabPanel>

						{/* Preferences Tab */}
						<TabPanel
							value={tabValue}
							index={1}
						>
							<Box sx={{ p: 2 }}>
								<Grid
									container
									spacing={3}
								>
									<Typography
										variant="subtitle1"
										gutterBottom
									>
										{t("company.unitSystem")}
									</Typography>
									<UnitSystemSwitcher
										useMetricSystem={formData.useMetricSystem}
										onChange={handleUnitSystemChange}
										disabled={isSaving}
									/>

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
											themeMode={formData.defaultTheme}
											onThemeChange={handleThemeChange}
											disabled={isSaving}
										/>
										<FormHelperText>{t("company.defaultThemeDescription")}</FormHelperText>
									</FormControl>

									<FormControl
										component="fieldset"
										sx={{ width: "100%" }}
									>
										<Typography
											variant="subtitle1"
											gutterBottom
										>
											{t("company.defaultLanguage")}
										</Typography>
										<LanguageSwitcher
											language={formData.defaultLanguage}
											onLanguageChange={handleLanguageChange}
											width="15rem"
											disabled={isSaving}
										/>
										<FormHelperText>{t("company.defaultLanguageDescription")}</FormHelperText>
									</FormControl>
								</Grid>
							</Box>
						</TabPanel>
					</Paper>
				</Box>
			) : (
				<Alert severity="warning">{t("company.noSettingsFound")}</Alert>
			)}
		</Box>
	);
};

export default CompanyManagement;
