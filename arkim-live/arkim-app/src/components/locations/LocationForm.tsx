import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, TextField, Grid, Typography, CircularProgress, Alert, Paper } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationDetails from "../../types/locations/LocationDetails";
import locationService from "../../services/api/locationService";
import Messenger from "../../services/ui/messengerService";
import { useUserContext } from "../contexts/AuthContext";
import UnitSystemSwitcher from "../ui/UnitSystemSwitcher";
import LocationBase from "../../types/locations/LocationBase";

interface LocationFormProps {
	location: LocationBase | undefined;
	refreshList: () => Promise<void>;
	onClose?: () => void;
}

// Interface for form validation errors
interface LocationFormErrors {
	name?: string;
	email?: string;
}

// Validation function for location form
const validateLocationForm = (formData: LocationDetails, t: (key: string) => string): LocationFormErrors => {
	const errors: LocationFormErrors = {};

	// Name is required
	if (!formData.name?.trim()) {
		errors.name = t("validation.locationNameRequired") || "Location name is required";
	}

	// Email validation if provided
	if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
		errors.email = t("validation.emailInvalid") || "Email is not valid";
	}

	return errors;
};

const LocationForm: React.FC<LocationFormProps> = ({ location, refreshList, onClose }) => {
	const { t } = useTranslation();
	const userContextDetails = useUserContext();
	const [formErrors, setFormErrors] = useState<LocationFormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [locationData, setLocationData] = useState<LocationDetails | null>(null);
	const id = location?.id;
	const isNew = !id;

	const [formData, setFormData] = useState<LocationDetails>({
		name: "",
		description: "",
		useMetricSystem: userContextDetails?.useMetricSystem || false,
		email: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Load location data when id changes
	useEffect(() => {
		if (id) {
			loadLocationData(id);
		} else {
			// Reset form for new location and inherit metric system setting from company
			setLocationData(null);
			setFormData({
				name: "",
				description: "",
				useMetricSystem: userContextDetails?.useMetricSystem || false,
				email: "",
			});
		}
		setFormErrors({});
	}, [id, userContextDetails]);

	// Load location data from API
	const loadLocationData = async (locationId: string) => {
		setIsLoading(true);
		try {
			const data = await locationService.getById(locationId);
			setLocationData(data);
			setFormData({
				id: data.id,
				name: data.name,
				description: data.description,
				useMetricSystem: data.useMetricSystem,
				email: data.email || "",
			});
		} catch (err: any) {
			setError(`Failed to load location details: ${err.message}`);
			Messenger.error(`Failed to load location details: ${err.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle form field changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	// Handle unit system change
	const handleUnitSystemChange = (useMetric: boolean) => {
		setFormData((prev) => ({
			...prev,
			useMetricSystem: useMetric,
		}));
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate form before submission
		const validationErrors = validateLocationForm(formData, t);
		setFormErrors(validationErrors);

		// Don't proceed if there are validation errors
		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		Messenger.confirm(
			isNew ? t("locations.confirmations.create") : t("locations.confirmations.update"),
			t("common.confirmationTitle"),
			async () => {
				try {
					setIsSubmitting(true);
					let result;
					if (isNew) {
						result = await locationService.create(formData);
						if (result && result.isSuccess) {
							Messenger.success(t("locations.messages.locationCreated"));
							if (refreshList) await refreshList();
							if (onClose) onClose();
						}
					} else if (id) {
						result = await locationService.update(formData);
						if (result && result.isSuccess) {
							Messenger.success(t("locations.messages.locationUpdated"));
							if (refreshList) await refreshList();
						}
					}

					if (!result || !result.isSuccess) {
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

	// Handle location deletion
	const handleDelete = async () => {
		if (!id) return;

		Messenger.confirm(t("locations.confirmations.delete"), t("common.confirmationTitle"), async () => {
			setIsSubmitting(true);
			try {
				const result = await locationService.delete(id);
				if (result && result.isSuccess) {
					Messenger.success("Location deleted successfully");
					if (refreshList) await refreshList();
					if (onClose) onClose();
				} else {
					throw new Error(result?.message || "Delete operation failed");
				}
			} catch (err: any) {
				setError(err.message);
			} finally {
				setIsSubmitting(false);
			}
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
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
					borderBottom: 1,
					borderColor: "divider",
					pb: 2,
				}}
			>
				<Typography variant="h6">{isNew ? t("locations.form.createNewLocation") : t("locations.form.editLocation")}</Typography>
				<Box>
					{!isNew && (
						<Button
							color="error"
							startIcon={<DeleteIcon />}
							onClick={handleDelete}
							disabled={isSubmitting}
							sx={{ mr: 1 }}
						>
							{t("common.delete")}
						</Button>
					)}
					<Button
						variant="contained"
						color="primary"
						startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? t("common.saving") : t("common.save")}
					</Button>
				</Box>
			</Box>

			{/* Main form */}
			<form onSubmit={handleSubmit}>
				{error && (
					<Alert
						severity="error"
						sx={{ mb: 2 }}
					>
						{error}
					</Alert>
				)}

				<Paper sx={{ p: 3 }}>
					<Grid
						container
						spacing={3}
					>
						<TextField
							fullWidth
							label={t("locations.form.locationName")}
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							disabled={isSubmitting}
							error={!!formErrors.name}
							helperText={formErrors.name || ""}
						/>
						<TextField
							fullWidth
							label={t("locations.form.description")}
							name="description"
							value={formData.description}
							onChange={handleChange}
							multiline
							rows={3}
							disabled={isSubmitting}
						/>
						<TextField
							fullWidth
							label={t("locations.form.email")}
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							disabled={isSubmitting}
							error={!!formErrors.email}
							helperText={formErrors.email || ""}
						/>
						<Typography variant="subtitle1">{t("company.unitSystem")}</Typography>
						<UnitSystemSwitcher
							useMetricSystem={formData.useMetricSystem}
							disabled={isSubmitting}
							onChange={handleUnitSystemChange}
							showHelperText={false}
						/>
					</Grid>
				</Paper>
			</form>
		</Box>
	);
};

export default LocationForm;
