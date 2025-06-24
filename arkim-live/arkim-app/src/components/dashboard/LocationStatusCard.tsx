import { useTheme } from "@mui/material/styles";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import LocationOverview from "../../types/dashboard/LocationOverview";
import { useTranslation } from "react-i18next";

const LocationStatusCard: React.FC<{ locationData: LocationOverview }> = ({ locationData }) => {
	const { t } = useTranslation();
	const theme = useTheme();

	const hasIssues = (asset: any) => {
		return asset.issues && typeof asset.issues === "object" && Object.keys(asset.issues).length > 0;
	}

	// Get the status based on the statusCounts
	const getOverallStatus = () => {
		if (!locationData.isSuccess || locationData.assets.some(a => hasIssues(a))) {
			return "critical";
		} else {
			return "normal";
		}
	};

	// Get appropriate explanation based on status
	const getExplanation = (status: string) => {
		if (!locationData.isSuccess) {
			console.error(locationData.errorMessage);
			return t("dashboard.statusExplanations.serverError");
		}
		else if (status === "critical") {
			const criticalAssets = locationData.assets.filter(a => hasIssues(a)).length;
			return t("dashboard.statusExplanations.critical", { count: criticalAssets });
		}
		else {
			return t("dashboard.statusExplanations.normal");
		}
	};

	const status = getOverallStatus();
	const explanation = getExplanation(status);

	// Format relative time for last updated
	const formatRelativeTime = (date: Date) => {
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

	// Determine status color
	const getStatusColor = (status: string): string => {
		switch (status) {
			case "normal":
				return theme.palette.success.main;
			case "warning":
				return theme.palette.warning.main;
			case "critical":
				return theme.palette.error.main;
			case "offline":
				return theme.palette.text.disabled;
			default:
				return theme.palette.success.main;
		}
	};

	// Get icon based on status
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "normal":
				return "✓";
			case "warning":
				return "⚠️";
			case "critical":
				return "❗";
			case "offline":
				return "⊗";
			default:
				return "✓";
		}
	};

	const statusColor = getStatusColor(status);
	const statusIcon = getStatusIcon(status);
	const statusText = t(`dashboard.locationStatus.${status}`);
	const lastUpdatedTime = formatRelativeTime(locationData.updatedAtUtc);

	return (
		<Card
			sx={{
				width: "100%",
				boxShadow: 3,
				borderLeft: 5,
				borderColor: statusColor,
			}}
		>
			<CardContent sx={{ display: "flex", alignItems: "center" }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						width: 60,
						height: 60,
						borderRadius: "50%",
						bgcolor: `${statusColor}20`,
						color: statusColor,
						fontSize: "1.8rem",
						mr: 3,
					}}
				>
					{statusIcon}
				</Box>

				<Box>
					<Typography
						variant="h5"
						sx={{ fontWeight: 600, color: statusColor }}
					>
						{statusText}
					</Typography>
					<Divider sx={{ my: 1 }} />
					<Typography
						variant="body1"
						color="text.secondary"
					>
						{explanation}
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: "block", mt: 1 }}
					>
						{t('common.lastUpdated')}: {lastUpdatedTime}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
};

export default LocationStatusCard;
