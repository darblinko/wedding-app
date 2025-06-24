import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Box,
	Button,
	TextField,
	Grid,
	Typography,
	CircularProgress,
	Alert,
	Paper,
	MenuItem,
	Tabs,
	Tab,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SensorsIcon from "@mui/icons-material/Sensors";
import InfoIcon from "@mui/icons-material/Info";
import DevicesIcon from "@mui/icons-material/Devices";
import SettingsIcon from "@mui/icons-material/Settings";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AssetDetails from "../../types/equipment/AssetDetails";
import AssetBase from "../../types/equipment/AssetBase";
import equipmentService from "../../services/api/equipmentService";
import locationService from "../../services/api/locationService";
import LocationBase from "../../types/locations/LocationBase";
import Messenger from "../../services/ui/messengerService";
import TabPanel from "../ui/TabPanel";
import SensorDetails from "../../types/equipment/SensorDetails";

interface EquipmentFormProps {
	equipment: AssetBase | undefined;
	refreshList: () => Promise<void>;
	onClose?: () => void;
}

// Interface for form validation errors
interface EquipmentFormErrors {
	name?: string;
	locationId?: string;
	manufacturer?: string;
	model?: string;
	serialNumber?: string;
	minOperatingTemperatureC?: string;
	maxOperatingTemperatureC?: string;
	maxOperatingHumidityPercent?: string;
}

// Interface for sensor form validation errors
interface SensorFormErrors {
	id?: string;
}

// Validation function for equipment form
const validateEquipmentForm = (formData: AssetDetails, t: (key: string) => string): EquipmentFormErrors => {
	const errors: EquipmentFormErrors = {};

	// Name is required
	if (!formData.name?.trim()) {
		errors.name = t("validation.equipmentNameRequired");
	}

	// Location is required
	if (!formData.locationId) {
		errors.locationId = t("validation.locationRequired");
	}
	// Validate minimum operating temperature
	if (formData.minOperatingTemperatureC === undefined || formData.minOperatingTemperatureC === null) {
		errors.minOperatingTemperatureC = t("validation.minTempRequired");
	}

	// Validate maximum operating temperature
	if (!formData.maxOperatingTemperatureC) {
		errors.maxOperatingTemperatureC = t("validation.maxTempRequired");
	}

	// Validate temperature range if both values are provided
	if (
		formData.minOperatingTemperatureC !== undefined && 
		formData.maxOperatingTemperatureC !== undefined && 
		parseFloat(String(formData.minOperatingTemperatureC)) >= parseFloat(formData.maxOperatingTemperatureC)
	) {
		errors.maxOperatingTemperatureC = t("validation.tempRangeInvalid");
	}

	// Validate humidity range if both values are provided
	if (
		formData.minOperatingHumidityPercent !== undefined && 
		formData.maxOperatingHumidityPercent !== undefined && 
		parseFloat(String(formData.minOperatingHumidityPercent)) >= parseFloat(formData.maxOperatingHumidityPercent)
	) {
		errors.maxOperatingHumidityPercent = t("validation.humidityRangeInvalid");
	}

	return errors;
};

const emptyAsset: AssetDetails = {
	id: "",
	name: "",
	description: "",
	type: "",
	locationId: "",
	manufacturer: "",
	model: "",
	serialNumber: "",
	sensors: [],
	minOperatingTemperatureC: undefined,
	maxOperatingTemperatureC: undefined,
	minOperatingHumidityPercent: undefined,
	maxOperatingHumidityPercent: undefined,
};

const EquipmentForm: React.FC<EquipmentFormProps> = ({ equipment, refreshList, onClose }) => {	const { t } = useTranslation();
	const [formErrors, setFormErrors] = useState<EquipmentFormErrors>({});
	const [sensorFormErrors, setSensorFormErrors] = useState<SensorFormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const id = equipment?.id;
	const isNew = !id;
	const [locations, setLocations] = useState<LocationBase[]>([]);
	const [loadingLocations, setLoadingLocations] = useState(false);
	const [tabValue, setTabValue] = useState(0);
	const [newSensor, setNewSensor] = useState<SensorDetails>({
		id: "",
		description: "",
		type: "",
	});	const [formData, setFormData] = useState<AssetDetails>(emptyAsset);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Handle tab change
	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};
	// Load equipment data when id changes
	useEffect(() => {
		if (id) {
			loadEquipmentData(id);
		} else {			// Reset form for new equipment
			setFormData(emptyAsset);
		}
		setFormErrors({});
		setTabValue(0);
	}, [id]);

	// Load locations for dropdown
	useEffect(() => {
		loadLocations();
	}, []);
	// Load equipment data from API
	const loadEquipmentData = async (equipmentId: string) => {
		setIsLoading(true);
		try {
			const data = await equipmentService.getById(equipmentId);
			setFormData({
				id: data.id,
				name: data.name,
				description: data.description || "",
				type: data.type || "",
				locationId: data.locationId,
				manufacturer: data.manufacturer,
				model: data.model || "",
				serialNumber: data.serialNumber || "",
				sensors: data.sensors || [],
				minOperatingTemperatureC: data.minOperatingTemperatureC,
				maxOperatingTemperatureC: data.maxOperatingTemperatureC,
				minOperatingHumidityPercent: data.minOperatingHumidityPercent ,
				maxOperatingHumidityPercent: data.maxOperatingHumidityPercent,
			});
		} catch (err: any) {
			setError(`Failed to load equipment details: ${err.message}`);
			Messenger.error(`Failed to load equipment details: ${err.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	// Load locations
	const loadLocations = async () => {
		setLoadingLocations(true);
		try {
			const data = await locationService.list("");
			setLocations(data);
		} catch (err: any) {
			Messenger.error(`Failed to load locations: ${err.message}`);
		} finally {
			setLoadingLocations(false);
		}
	};

	// Handle form field changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Handle new sensor form changes
	const handleSensorFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewSensor((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Validate if sensor ID is unique
	const validateSensorId = (sensorId: string): string | undefined => {
		if (!sensorId.trim()) {
			return t("validation.sensorIdRequired");
		}

		// Check if ID is unique among existing sensors
		if (formData.sensors?.some((sensor) => sensor.id === sensorId)) {
			return t("validation.sensorIdMustBeUnique");
		}

		return undefined;
	};

	// Add new sensor to the list
	const handleAddSensor = () => {
		// Validate sensor ID
		const idError = validateSensorId(newSensor.id);
		if (idError) {
			setSensorFormErrors({ id: idError });
			return;
		}

		setFormData((prev) => ({
			...prev,
			sensors: [
				...(prev.sensors || []),
				{
					id: newSensor.id,
					description: newSensor.description,
					type: newSensor.type || "",
				},
			],
		}));

		// Reset form errors and sensor form
		setSensorFormErrors({});
		setNewSensor({
			id: "",
			description: "",
			type: "",
		});
	};

	// Remove a sensor from the list
	const handleRemoveSensor = (sensorId: string) => {
		Messenger.confirm(t("equipment.confirmations.removeSensor"), t("common.confirmationTitle"), () => {
			setFormData((prev) => ({
				...prev,
				sensors: (prev.sensors || []).filter((sensor) => sensor.id !== sensorId),
			}));
		});
	};
	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate form before submission
		const validationErrors = validateEquipmentForm(formData, t);
		setFormErrors(validationErrors);

		// Don't proceed if there are validation errors
		if (Object.keys(validationErrors).length > 0) {			// Determine which tab has errors and select it
			if (validationErrors.name || validationErrors.locationId) {
				setTabValue(0); // Basic info tab
			} else if (validationErrors.manufacturer || validationErrors.model || validationErrors.serialNumber) {
				setTabValue(1); // Device details tab
			} else if (validationErrors.minOperatingTemperatureC || validationErrors.maxOperatingTemperatureC ||
					  validationErrors.maxOperatingHumidityPercent) {
				setTabValue(2); // Technical specification tab
			} else {
				setTabValue(3); // Sensors tab
			}
			return;
		}

		Messenger.confirm(
			isNew ? t("equipment.confirmations.create") : t("equipment.confirmations.update"),
			t("common.confirmationTitle"),
			async () => {
				try {
					setIsSubmitting(true);
					let result;
					if (isNew) {
						result = await equipmentService.create(formData);
						if (result && result.isSuccess) {
							Messenger.success(t("equipment.messages.equipmentCreated"));
							if (refreshList) await refreshList();
							if (onClose) onClose();
						}
					} else if (id) {
						result = await equipmentService.update(formData);
						if (result && result.isSuccess) {
							Messenger.success(t("equipment.messages.equipmentUpdated"));
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

	// Handle equipment deletion
	const handleDelete = async () => {
		if (!id) return;

		Messenger.confirm(t("equipment.confirmations.delete"), t("common.confirmationTitle"), async () => {
			setIsSubmitting(true);
			try {
				const result = await equipmentService.delete(id);
				if (result && result.isSuccess) {
					Messenger.success(t("equipment.messages.equipmentDeleted"));
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
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Typography variant="h6">
						{isNew ? t("equipment.form.createNewEquipment") : t("equipment.form.editEquipment")}
					</Typography>
				</Box>
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

				{/* Tabs */}
				<Paper sx={{ width: "100%", mb: 3 }}>					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						variant="scrollable"
						scrollButtons="auto"
						sx={{ borderBottom: 1, borderColor: "divider" }}
					>
						<Tab
							label={t("equipment.form.tabs.basicInfo")}
							icon={<InfoIcon />}
							iconPosition="start"
						/>
						<Tab
							label={t("equipment.form.tabs.deviceDetails")}
							icon={<DevicesIcon />}
							iconPosition="start"
						/>
						<Tab
							label={t("equipment.form.tabs.specification")}
							icon={<SettingsIcon />}
							iconPosition="start"
						/>
						<Tab
							label={t("equipment.form.tabs.sensors")}
							icon={<SensorsIcon />}
							iconPosition="start"
						/>
					</Tabs>{/* Basic Info Tab */}
					<TabPanel
						value={tabValue}
						index={0}
					>
						<Box sx={{ p: 3 }}>
							<Box sx={{ mb: 2 }}>
								<Typography variant="subtitle1" gutterBottom>
									{t("equipment.form.basicInfo")}
								</Typography>
								<Grid
									container
									spacing={2}
								>
									<TextField
										fullWidth
										label={t("equipment.form.equipmentName")}
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
										label={t("equipment.form.type")}
										name="type"
										value={formData.type || ""}
										onChange={handleChange}
										disabled={isSubmitting}
									/>
									<TextField
										fullWidth
										select
										label={t("equipment.form.location")}
										name="locationId"
										value={formData.locationId}
										onChange={handleChange}
										required
										disabled={isSubmitting || loadingLocations}
										error={!!formErrors.locationId}
										helperText={formErrors.locationId || ""}
									>
										{locations.map((location) => (
											<MenuItem
												key={location.id}
												value={location.id}
											>
												{location.name}
											</MenuItem>
										))}
									</TextField>
									<TextField
										fullWidth
										label={t("equipment.form.description")}
										name="description"
										value={formData.description || ""}
										onChange={handleChange}
										multiline
										rows={3}
										disabled={isSubmitting}
									/>
								</Grid>
							</Box>
						</Box>
					</TabPanel>{/* Device Details Tab */}
					<TabPanel
						value={tabValue}
						index={1}
					>
						<Box sx={{ p: 3 }}>
							<Box sx={{ mb: 3 }}>
								<Typography variant="subtitle1" gutterBottom>
									{t("equipment.form.deviceDetails")}
								</Typography>
								<Grid
									container
									spacing={2}
								>
									<TextField
										fullWidth
										label={t("equipment.form.manufacturer")}
										name="manufacturer"
										value={formData.manufacturer}
										onChange={handleChange}
										disabled={isSubmitting}
									/>
									<TextField
										fullWidth
										label={t("equipment.form.model")}
										name="model"
										value={formData.model || ""}
										onChange={handleChange}
										disabled={isSubmitting}
									/>
									<TextField
										fullWidth
										label={t("equipment.form.serialNumber")}
										name="serialNumber"
										value={formData.serialNumber || ""}
										onChange={handleChange}
										disabled={isSubmitting}
									/>
								</Grid>
							</Box>
						</Box>
					</TabPanel>

					{/* Technical Specification Tab */}
					<TabPanel
						value={tabValue}
						index={2}
					>
						<Box sx={{ p: 3 }}>
							<Box sx={{ mb: 3 }}>
								<Typography variant="subtitle1" gutterBottom>
									{t("equipment.form.operationalLimits")}
								</Typography>
								<Grid
									container
									spacing={2}
								>
									{/* Temperature Range */}
									<TextField
										fullWidth
										type="number"
										label={t("equipment.form.minOperatingTemperatureC")}
										name="minOperatingTemperatureC"
										value={formData.minOperatingTemperatureC}
										onChange={handleChange}
										disabled={isSubmitting}
										required
										error={!!formErrors.minOperatingTemperatureC}
										helperText={formErrors.minOperatingTemperatureC || ""}
										slotProps={{input:{
											endAdornment: <Typography variant="caption">°C</Typography>,
										}}}
									/>
									<TextField
										fullWidth
										type="number"
										label={t("equipment.form.maxOperatingTemperatureC")}
										name="maxOperatingTemperatureC"
										value={formData.maxOperatingTemperatureC}
										onChange={handleChange}
										disabled={isSubmitting}
										required
										error={!!formErrors.maxOperatingTemperatureC}
										helperText={formErrors.maxOperatingTemperatureC || ""}
										slotProps={{input:{
											endAdornment: <Typography variant="caption">°C</Typography>,
										}}}
									/>
									
									{/* Humidity Range */}									<TextField
										fullWidth
										type="number"
										label={t("equipment.form.minOperatingHumidityPercent")}
										name="minOperatingHumidityPercent"
										value={formData.minOperatingHumidityPercent}
										onChange={handleChange}
										disabled={isSubmitting}
										slotProps={{input:{
											endAdornment: <Typography variant="caption">%</Typography>,
										}}}
									/>
									<TextField
										fullWidth
										type="number"
										label={t("equipment.form.maxOperatingHumidityPercent")}
										name="maxOperatingHumidityPercent"
										value={formData.maxOperatingHumidityPercent}
										onChange={handleChange}
										disabled={isSubmitting}
										error={!!formErrors.maxOperatingHumidityPercent}
										helperText={formErrors.maxOperatingHumidityPercent || ""}
										slotProps={{input:{
											endAdornment: <Typography variant="caption">%</Typography>,
										}}}
									/>
								</Grid>
							</Box>
						</Box>
					</TabPanel>					{/* Sensors Tab */}
					<TabPanel
						value={tabValue}
						index={3}
					>
						<Box sx={{ p: 3 }}>
							<Alert
								severity="info"
								sx={{ mb: 2 }}
							>
								{t("equipment.form.saveReminder")}
							</Alert>

							{/* Current Sensors List */}
							<Paper
								variant="outlined"
								sx={{ mb: 3, maxHeight: 300, overflow: "auto" }}
							>
								{formData.sensors && formData.sensors.length > 0 ? (
									<List>
										{formData.sensors.map((sensor, index) => {
											return (
												<React.Fragment key={sensor.id}>
													<ListItem
														secondaryAction={
															<IconButton
																edge="end"
																color="error"
																onClick={() => handleRemoveSensor(sensor.id)}
																disabled={isSubmitting}
															>
																<RemoveCircleOutlineIcon />
															</IconButton>
														}
													>
														<ListItemText
															primary={<Typography variant="subtitle2">{sensor.id}</Typography>}
															secondary={
																<Box>
																	<Typography
																		variant="body2"
																		color="text.secondary"
																	>
																		{t("equipment.form.sensorDescription")}: {sensor.description || "-"}
																	</Typography>
																	<Typography
																		variant="body2"
																		color="text.secondary"
																	>
																		{t("equipment.form.sensorType")}: {sensor.type || "-"}
																	</Typography>
																</Box>
															}
														/>
													</ListItem>
													{index < (formData.sensors?.length ?? 0) - 1 && <Divider />}
												</React.Fragment>
											);
										})}
									</List>
								) : (
									<Box sx={{ p: 2, textAlign: "center" }}>
										<Typography color="text.secondary">{t("equipment.form.noSensors")}</Typography>
									</Box>
								)}
							</Paper>

							{/* Add New Sensor Form */}
							<Paper
								variant="outlined"
								sx={{ p: 2 }}
							>
								<Typography
									variant="subtitle2"
									gutterBottom
								>
									{t("equipment.form.addSensor")}
								</Typography>
								<Grid
									container
									spacing={2}
									alignItems="flex-start"
								>
									<TextField
										fullWidth
										label={t("equipment.form.sensorId")}
										name="id"
										value={newSensor.id}
										onChange={handleSensorFormChange}
										size="small"
										disabled={isSubmitting}
										required
										error={!!sensorFormErrors.id}
										helperText={sensorFormErrors.id || ""}
									/>
									<TextField
										fullWidth
										label={t("equipment.form.sensorDescription")}
										name="description"
										value={newSensor.description}
										onChange={handleSensorFormChange}
										size="small"
										disabled={isSubmitting}
									/>
									<TextField
										fullWidth
										label={t("equipment.form.sensorType")}
										name="type"
										value={newSensor.type}
										onChange={handleSensorFormChange}
										size="small"
										disabled={isSubmitting}
									/>
									<Button
										variant="contained"
										color="primary"
										startIcon={<AddIcon />}
										onClick={handleAddSensor}
										disabled={isSubmitting || !newSensor.id}
										fullWidth
									>
										{t("equipment.form.addSensor")}
									</Button>
								</Grid>
							</Paper>
						</Box>
					</TabPanel>
				</Paper>
			</form>
		</Box>
	);
};

export default EquipmentForm;
