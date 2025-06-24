import React from "react";
import { Card, CardContent, CardHeader, Typography, Box, Avatar } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import KitchenIcon from "@mui/icons-material/Kitchen";
import MiniTrend from "../ui/analytics/MiniTrend";
import AssetStatus from "../../types/equipment/AssetStatus";
import AssetIssueTypes from "../../types/equipment/AssetIssueTypes";
import { useTranslation } from "react-i18next";

interface AssetCardProps {
	assetStatus?: AssetStatus;
	useMetricSystem: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({ assetStatus, useMetricSystem }) => {
	const { t } = useTranslation();

	if (!assetStatus) {
		return (
			<Card sx={{ height: "100%", opacity: 0.7 }}>
				<CardContent sx={{ pt: 1 }}>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mt: 1, mb: 2 }}
					>
						{t("dashboard.noAssetData")}
					</Typography>
				</CardContent>
			</Card>
		);
	}

	const convertCelsiusToFahrenheit = (celsius: number): number => {
		return (celsius * 9) / 5 + 32;
	}

	// Format temperature based on unit system
	const formatTemperature = (temp: number | undefined | null): string => {
		if (temp === undefined || temp === null) {
			return t("common.notAvailableShort");
		}

		// Convert temperature to Fahrenheit if not using metric system
		let tempSign = "°C";
		if (!useMetricSystem) {
			tempSign = "°F";
			temp = convertCelsiusToFahrenheit(temp);
		}
		return `${temp?.toFixed(1)}${tempSign}`;
	};

	const formatHumidity = (humidity: number | undefined | null): string => {
		if (humidity === undefined || humidity === null) {
			return t("common.notAvailableShort");
		}
		return `${humidity.toFixed(1)}%`;
	};

	// Format date to readable format
	const formatDateTime = (date: Date | undefined | null): string => {
		if (date === undefined || date === null) {
			return t("common.notAvailableShort");
		}

		const now = new Date();
		const updateTime = new Date(date);
		const diffMs = now.getTime() - updateTime.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 60) {
			// Less than an hour ago - show minutes
			return diffMins <= 1 ? t("time.justNow") : t("time.minutesAgo", { count: diffMins });
		} else {
			// More than an hour ago - show date and time
			return updateTime.toLocaleString(undefined, {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		}
	};

	const formatIssue = (issue: AssetIssueTypes, value: number | undefined | null): string => {
		let issueText = t(`dashboard.assetIssueTypes.${AssetIssueTypes[issue]}`);
		// Add specific measurement values to the issue text
		if (issue === AssetIssueTypes.Temperature_Above && asset.maxOperatingTemperatureC !== undefined) {
			issueText += ` (${formatTemperature(value)} > ${formatTemperature(asset.maxOperatingTemperatureC)})`;
		} else if (issue === AssetIssueTypes.Temperature_Below && asset.minOperatingTemperatureC !== undefined) {
			issueText += ` (${formatTemperature(value)} < ${formatTemperature(asset.minOperatingTemperatureC)})`;
		} else if (issue === AssetIssueTypes.Humidity_Above && asset.maxOperatingHumidityPercent !== undefined) {
			issueText += ` (${formatHumidity(value)} > ${formatHumidity(asset.maxOperatingHumidityPercent)})`;
		} else if (issue === AssetIssueTypes.Humidity_Below && asset.minOperatingHumidityPercent !== undefined) {
			issueText += ` (${formatHumidity(value)} < ${formatHumidity(asset.minOperatingHumidityPercent)})`;
		}
		return issueText
	};

	const asset = assetStatus.asset;
	const issues = assetStatus.issues ?? {};
	
	// Get specific temperature and humidity issues
	const temperatureAboveIssue = issues.hasOwnProperty(AssetIssueTypes.Temperature_Above);
	const temperatureBelowIssue = issues.hasOwnProperty(AssetIssueTypes.Temperature_Below);
	const temperatureNotReceivedIssue = issues.hasOwnProperty(AssetIssueTypes.Temperature_NotReceived);

	const humidityAboveIssue = issues.hasOwnProperty(AssetIssueTypes.Humidity_Above);
	const humidityBelowIssue = issues.hasOwnProperty(AssetIssueTypes.Humidity_Below);
	const humidityNotReceivedIssue = issues.hasOwnProperty(AssetIssueTypes.Humidity_NotReceived);

	// Determine if there are any issues with temperature or humidity
	const hasTemperatureIssue = temperatureAboveIssue || temperatureBelowIssue || temperatureNotReceivedIssue;
	const hasHumidityIssue = humidityAboveIssue || humidityBelowIssue || humidityNotReceivedIssue;

	// Define theme colors for different states
	const themeColors = {
		success: "#2e7d32",             // darker green for general success
		temperatureSuccess: "#29b6f6", // light blue for temperature (cool tone)
		humiditySuccess: "#26a69a",    // aquamarine for humidity (moist tone)
		error: "#d32f2f",              // darker red for critical errors
		disabled: "#bdbdbd",           // light gray for missing or inactive data
	};

	const hasIssues = Object.keys(issues).length > 0;
	const statusColor = hasIssues ? themeColors.error : themeColors.success;

	// Get color for temperature-related elements
	const getTemperatureColor = () => {
		if (temperatureNotReceivedIssue) {
			return themeColors.disabled;
		} else if (temperatureAboveIssue || temperatureBelowIssue) {
			return themeColors.error;
		}
		return themeColors.temperatureSuccess;
	};

	// Get color for humidity-related elements
	const getHumidityColor = () => {
		if (humidityNotReceivedIssue) {
			return themeColors.disabled;
		} else if (humidityAboveIssue || humidityBelowIssue) {
			return themeColors.error;
		}
		return themeColors.humiditySuccess;
	};

	// Get the appropriate icon based on equipment type
	const getEquipmentAvatar = () => {
		return (
			<Avatar sx={{ bgcolor: (hasIssues ? themeColors.error : themeColors.success) + "20" }}>
				<KitchenIcon sx={{ color: hasIssues ? themeColors.error : themeColors.success }} />
			</Avatar>
		);
	};
	// Card header with asset status
	const cardHeader = (
		<CardHeader
			avatar={getEquipmentAvatar()}
			title={asset.name}
			subheader={
				<Box
					component="span"
					sx={{
						display: "inline-flex",
						alignItems: "center",
						fontWeight: 500,
						fontSize: "0.875rem",
					}}
				>
					<Box
						component="span"
						sx={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							display: "inline-block",
							mr: 0.75,
							backgroundColor: statusColor,
						}}
					/>
					{hasIssues ? t("dashboard.assetIssues.title") : t("dashboard.assetIssues.noIssues")}
				</Box>
			}
			sx={{
				pb: 0,
				"& .MuiCardHeader-title": {
					fontWeight: 600,
				},
			}}
		/>
	);

	return (
		<Card
			sx={{
				height: "100%",
				borderLeft: hasIssues ? `4px solid ${themeColors.error}` : "none",
				boxShadow: hasIssues ? 2 : 1,
			}}
		>
			{cardHeader}
			<CardContent sx={{ pt: 1 }}>
				{" "}
				{/* Temperature */}
				<Box sx={{ mb: 2 }}>
					{" "}
					<Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
						<ThermostatIcon
							sx={{
								mr: 1,
								color: getTemperatureColor(),
							}}
							fontSize="small"
						/>
						<Typography
							variant="body2"
							sx={{
								fontWeight: 500,
								color: hasTemperatureIssue ? themeColors.error : "inherit",
							}}
						>
							{formatTemperature(assetStatus.lastRegisteredTempC)}
						</Typography>
						<MiniTrend
							minBorder={asset.minOperatingTemperatureC}
							maxBorder={asset.maxOperatingTemperatureC}
							dataRecords={assetStatus.recentTemperatureReadings}
							successColor={themeColors.temperatureSuccess}
						/>
					</Box>{" "}
					<Box sx={{ display: "flex", justifyContent: "space-between", pl: 4, mb: 0.5 }}>
						<Typography
							variant="caption"
							color={temperatureBelowIssue ? "error" : "text.secondary"}
						>
							{t("common.minShort")}: {formatTemperature(asset.minOperatingTemperatureC)}
						</Typography>
						<Typography
							variant="caption"
							color={temperatureAboveIssue ? "error" : "text.secondary"}
						>
							{t("common.maxShort")}: {formatTemperature(asset.maxOperatingTemperatureC)}
						</Typography>
					</Box>{" "}
					<Typography
						variant="caption"
						color={temperatureNotReceivedIssue ? "error" : "text.secondary"}
						sx={{ pl: 4 }}
					>
						{t("common.lastUpdated")}:{" "}
						{formatDateTime(assetStatus.lastRegisteredTempTimeUtc)}
					</Typography>
				</Box>{" "}
				{/* Humidity */}
				<Box>
					{" "}
					<Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
						<OpacityIcon
							sx={{ mr: 1, color: getHumidityColor() }}
							fontSize="small"
						/>
						<Typography
							variant="body2"
							sx={{
								fontWeight: 500,
								color: hasHumidityIssue ? themeColors.error : "inherit",
							}}
						>
							{formatHumidity(assetStatus.lastRegisteredHumidityPercent)}
						</Typography>
						<MiniTrend
							minBorder={asset.minOperatingHumidityPercent}
							maxBorder={asset.maxOperatingHumidityPercent}
							dataRecords={assetStatus.recentHumidityReadings}
							successColor={themeColors.humiditySuccess}
						/>
					</Box>{" "}
					<Box sx={{ display: "flex", justifyContent: "space-between", pl: 4, mb: 0.5 }}>
						<Typography
							variant="caption"
							color={humidityBelowIssue ? "error" : "text.secondary"}
						>
							{t("common.minShort")}: {formatHumidity(asset.minOperatingHumidityPercent)}
						</Typography>
						<Typography
							variant="caption"
							color={humidityAboveIssue ? "error" : "text.secondary"}
						>
							{t("common.maxShort")}: {formatHumidity(asset.maxOperatingHumidityPercent)}
						</Typography>
					</Box>{" "}
					<Typography
						variant="caption"
						color={humidityNotReceivedIssue ? "error" : "text.secondary"}
						sx={{ pl: 4 }}
					>
						{t("common.lastUpdated")}:{" "}
						{formatDateTime(assetStatus.lastRegisteredHumidityTimeUtc)}
					</Typography>
				</Box>{" "}
				{/* Issues Section */}
				{hasIssues && (
					<Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: "divider" }}>
						{" "}
						<Typography
							variant="subtitle2"
							color="error"
							sx={{ mb: 1 }}
						>
							{t("dashboard.assetIssues.title")}:
						</Typography>
						<Box sx={{ pl: 2 }}>
							{Object.entries(issues).map(([issue, value], index) => {
								return (
									<Typography
										key={index}
										variant="caption"
										component="div"
										sx={{
											color: "text.secondary",
											display: "flex",
											alignItems: "center",
											mb: 0.5,
										}}
									>
										<Box
											component="span"
											sx={{
												width: 6,
												height: 6,
												borderRadius: "50%",
												display: "inline-block",
												mr: 1,
												backgroundColor: themeColors.error,
											}}
										/>
										{formatIssue(parseInt(issue), value)}
									</Typography>
								);
							})}
						</Box>
					</Box>
				)}
			</CardContent>
		</Card>
	);
};

export default AssetCard;
