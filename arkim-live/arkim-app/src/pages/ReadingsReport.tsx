import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Tooltip,
	CircularProgress,
	Alert,
	Autocomplete,
	TextField,
	Button,
	Chip,
} from "@mui/material";
import ReadingsIcon from "@mui/icons-material/ShowChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";

import { SensorReading } from "../types/readings/SensorReading";
import {
	SensorReadingsBrowserReportConfiguration,
	SensorReadingsBrowserReportParameters,
} from "../types/reports/SensorReadingsBrowserReport";
import readingsService from "../services/api/reportsService";
import { PlayArrow } from "@mui/icons-material";

// Define SelectedFilters locally as it's specific to this page
interface SelectedFilters {
	assets: string[];
	sensors: string[];
	metricTypes: string[];
}

const ReadingsManagement: React.FC = () => {
	const { t } = useTranslation();
	const [readings, setReadings] = useState<SensorReading[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [nextToken, setNextToken] = useState<string | null>(null);

	// Filter states
	const [configLoading, setConfigLoading] = useState<boolean>(true);
	const [filterConfig, setFilterConfig] = useState<SensorReadingsBrowserReportConfiguration | null>(null);
	const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
		assets: [],
		sensors: [],
		metricTypes: [],
	});

	// Available options for each filter
	const assetOptions = React.useMemo(() => {
		if (!filterConfig) return [];
		// Extract unique assets from sensorFilters
		const assetMap: { [id: string]: { id: string; label: string; description: string } } = {};
		filterConfig.sensorFilters.forEach((filter) => {
			if (!assetMap[filter.assetId]) {
				assetMap[filter.assetId] = {
					id: filter.assetId,
					label: filter.assetName,
					description: filter.assetDescription || "",
				};
			}
		});
		return Object.values(assetMap).sort((a, b) => a.label.localeCompare(b.label));
	}, [filterConfig]);

	const sensorOptions = React.useMemo(() => {
		if (!filterConfig) return [];
		let sensors = filterConfig.sensorFilters;
		if (selectedFilters.assets.length > 0) {
			sensors = sensors.filter((filter) => selectedFilters.assets.includes(filter.assetId));
		}
		return sensors
			.map((filter) => ({
				id: filter.sensorId,
				label: filter.sensorId,
				description: filter.sensorDescription || "",
				assetId: filter.assetId,
				assetName: filter.assetName,
			}))
			.sort((a, b) => {
				const assetCompare = a.assetName.localeCompare(b.assetName);
				if (assetCompare !== 0) return assetCompare;
				return a.label.localeCompare(b.label);
			});
	}, [filterConfig, selectedFilters.assets]);

	const metricTypeOptions = React.useMemo(() => {
		if (!filterConfig) return [];
		return filterConfig.metricTypes
			.map((type) => ({
				id: type,
				label: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
			}))
			.sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
	}, [filterConfig]);

	const assetIdToNameMap = React.useMemo(() => {
		if (!filterConfig) return {};
		const map: { [key: string]: string } = {};
		filterConfig.sensorFilters.forEach((filter) => {
			if (!map[filter.assetId]) {
				map[filter.assetId] = filter.assetName;
			}
		});
		return map;
	}, [filterConfig]);

	// Fetch filter configuration
	const fetchFilterConfiguration = async () => {
		setConfigLoading(true);
		try {
			const config = await readingsService.getReadingsBrowserReportConfiguration();
			setFilterConfig(config);
		} catch (err) {
			console.error("Failed to fetch filter configuration:", err);
			setError("Failed to load filter options. Please try again.");
		} finally {
			setConfigLoading(false);
		}
	};

	// Fetch readings data with filters
	const fetchReadings = async (isLoadMore = false, token?: string) => {
		setLoading(true);
		setError(null);
		try {
			const params: SensorReadingsBrowserReportParameters = {
				assetIds: selectedFilters.assets.length > 0 ? selectedFilters.assets : undefined,
				sensorIds: selectedFilters.sensors.length > 0 ? selectedFilters.sensors : undefined,
				metricTypes: selectedFilters.metricTypes.length > 0 ? selectedFilters.metricTypes : undefined,
				nextToken: token,
			};
			const reportData = await readingsService.getReadingsBrowserReport(params);
			if (isLoadMore) {
				setReadings((prev) => [...prev, ...reportData.rows]);
			} else {
				setReadings(reportData.rows);
			}
			setNextToken(reportData.nextToken || null);
		} catch (err) {
			console.error("Failed to fetch readings data:", err);
			setError("Failed to load readings data. Please try again.");
			// Ensure readings is always an array even when errors occur
			if (!isLoadMore) {
				setReadings([]);
			}
		} finally {
			setLoading(false);
		}
	}; // Load filter config and readings on component mount
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		fetchFilterConfiguration();
		fetchReadings();
	}, []);
	const convertUtcStringToLocalDate = (timestamp: string): Date => {
		if (!timestamp) {
			return new Date(); // Return current date if timestamp is null/undefined
		}
		if (!timestamp.endsWith("Z") && !timestamp.endsWith("z")) {
			timestamp += "Z";
		}
		return new Date(timestamp);
	};

	// Handle filter changes
	const handleFilterChange = (type: keyof SelectedFilters, values: string[]) => {
		setSelectedFilters((prev) => ({
			...prev,
			[type]: values,
		}));
	};

	// Apply filters
	const handleApplyFilters = () => {
		setReadings([]);
		setNextToken(null);
		fetchReadings();
	};

	// Reset all filters
	const handleResetFilters = () => {
		setSelectedFilters({
			assets: [],
			sensors: [],
			metricTypes: [],
		});
		setReadings([]);
		setNextToken(null);
		fetchReadings();
	};

	const handleLoadMore = () => {
		if (nextToken) {
			fetchReadings(true, nextToken);
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 64px)", // Adjust for app bar height
				p: 3,
			}}
		>
			{/* Header */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<ReadingsIcon sx={{ fontSize: 28, mr: 2, color: "primary.main" }} />
					<Typography
						variant="h5"
						component="h1"
					>
						{t("readings.title")}
					</Typography>
				</Box>
				<Box>
					<Tooltip title={t("common.reset")}>
						<IconButton
							onClick={handleResetFilters}
							disabled={loading || configLoading}
						>
							{loading ? <CircularProgress size={24} /> : <ClearIcon />}
						</IconButton>
					</Tooltip>
					<Tooltip title={t("common.refresh")}>
						<IconButton
							onClick={() => fetchReadings()}
							disabled={loading}
						>
							{loading ? <CircularProgress size={24} /> : <RefreshIcon />}
						</IconButton>
					</Tooltip>
				</Box>
			</Box>

			{/* Error Alert */}
			{error && (
				<Alert
					severity="error"
					sx={{ mb: 3 }}
				>
					{error}
				</Alert>
			)}

			{/* Filters Section */}
			<Paper sx={{ p: 1, mb: 1 }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
					<Box sx={{ display: "flex", gap: 2, width: "100%" }}>
						{/* Asset Filter */}
						<Autocomplete
							multiple
							loading={configLoading}
							options={assetOptions}
							getOptionLabel={(option) => `${option.label}${option.description ? ` - ${option.description}` : ""}`}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							value={assetOptions.filter((option) => selectedFilters.assets.includes(option.id))}
							onChange={(_event, newValue) => {
								handleFilterChange(
									"assets",
									newValue.map((v) => v.id)
								);
							}}
							sx={{ flex: 1 }}
							disableCloseOnSelect
							filterSelectedOptions
							limitTags={3}
							renderInput={(params) => (
								<TextField
									{...params}
									label={t("readings.filters.assets")}
									placeholder={t("readings.filters.selectAssets")}
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<React.Fragment>
												{configLoading ? (
													<CircularProgress
														color="inherit"
														size={20}
													/>
												) : null}
												{params.InputProps.endAdornment}
											</React.Fragment>
										),
									}}
								/>
							)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										label={`${option.label}${option.description ? ` - ${option.description}` : ""}`}
										{...getTagProps({ index })}
										size="small"
									/>
								))
							}
						/>
						{/* Sensor Filter */}
						<Autocomplete
							multiple
							loading={configLoading}
							options={sensorOptions}
							groupBy={(option) => option.assetName}
							getOptionLabel={(option) => `${option.label}${option.description ? ` - ${option.description}` : ""}`}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							value={sensorOptions.filter((option) => selectedFilters.sensors.includes(option.id))}
							onChange={(_event, newValue) => {
								handleFilterChange(
									"sensors",
									newValue.map((v) => v.id)
								);
							}}
							sx={{ flex: 1 }}
							disableCloseOnSelect
							filterSelectedOptions
							limitTags={3}
							renderInput={(params) => (
								<TextField
									{...params}
									label={t("readings.filters.sensors")}
									placeholder={t("readings.filters.selectSensors")}
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<React.Fragment>
												{configLoading ? (
													<CircularProgress
														color="inherit"
														size={20}
													/>
												) : null}
												{params.InputProps.endAdornment}
											</React.Fragment>
										),
									}}
								/>
							)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										label={`${option.label}${option.description ? ` - ${option.description}` : ""}`}
										{...getTagProps({ index })}
										size="small"
									/>
								))
							}
						/>
						{/* Metric Type Filter */}
						<Autocomplete
							multiple
							loading={configLoading}
							options={metricTypeOptions}
							getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							value={metricTypeOptions.filter((option) => selectedFilters.metricTypes.includes(option.id))}
							onChange={(_event, newValue) => {
								handleFilterChange(
									"metricTypes",
									newValue.map((v) => v.id)
								);
							}}
							sx={{ flex: 1 }}
							disableCloseOnSelect
							filterSelectedOptions
							limitTags={3}
							renderInput={(params) => (
								<TextField
									{...params}
									label={t("readings.filters.metricTypes")}
									placeholder={t("readings.filters.selectMetricTypes")}
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<React.Fragment>
												{configLoading ? (
													<CircularProgress
														color="inherit"
														size={20}
													/>
												) : null}
												{params.InputProps.endAdornment}
											</React.Fragment>
										),
									}}
								/>
							)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										label={option.label}
										{...getTagProps({ index })}
										size="small"
									/>
								))
							}
						/>
					</Box>

					{/* Filter Actions */}
					<Box sx={{ display: "flex", ml: 2, gap: 1 }}>
						<Button
							startIcon={<PlayArrow />}
							onClick={handleApplyFilters}
							disabled={loading || configLoading}
							size="small"
						>
							{t("reports.run")}
						</Button>
					</Box>
				</Box>
			</Paper>

			{/* Readings Table */}
			<Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%", overflow: "hidden" }}>
				<TableContainer sx={{ flexGrow: 1, overflow: "auto" }}>
					<Table
						stickyHeader
						size="medium"
					>
						<TableHead>
							<TableRow>
								<TableCell>{t("readings.equipment")}</TableCell>
								<TableCell>{t("readings.sensorId")}</TableCell>
								<TableCell>{t("readings.timestamp")}</TableCell>
								<TableCell>{t("readings.readingType")}</TableCell>
								<TableCell align="right">{t("readings.value")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading && readings && readings.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										align="center"
										sx={{ py: 3 }}
									>
										<CircularProgress size={40} />
									</TableCell>
								</TableRow>
							) : !readings || readings.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										align="center"
										sx={{ py: 3 }}
									>
										<Typography
											variant="body1"
											color="text.secondary"
										>
											{t("common.noData")}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								<>
									{readings.map((reading) => (
										<TableRow
											key={`${reading.assetId}-${reading.sensorId}-${reading.metricName}-${reading.timeUtc}`}
											hover
										>
											{" "}
											<TableCell>{assetIdToNameMap[reading?.assetId] || reading?.assetId || "-"}</TableCell>
											<TableCell>{reading?.sensorId || "-"}</TableCell>
											<TableCell>
												{reading?.timeUtc ? convertUtcStringToLocalDate(reading.timeUtc).toLocaleString() : "-"}
											</TableCell>
											<TableCell>{reading?.metricName || "-"}</TableCell>
											<TableCell align="right">{reading?.value ?? "-"}</TableCell>
										</TableRow>
									))}
									{loading && readings && readings.length > 0 && (
										<TableRow>
											<TableCell
												colSpan={5}
												align="center"
												sx={{ py: 2 }}
											>
												<CircularProgress size={30} />
											</TableCell>
										</TableRow>
									)}
								</>
							)}
						</TableBody>
					</Table>
					{nextToken && !loading && (
						<Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
							<Button
								variant="outlined"
								onClick={handleLoadMore}
								disabled={loading}
							>
								{t("common.loadMore")}
							</Button>
						</Box>
					)}
				</TableContainer>
			</Paper>
		</Box>
	);
};

export default ReadingsManagement;
