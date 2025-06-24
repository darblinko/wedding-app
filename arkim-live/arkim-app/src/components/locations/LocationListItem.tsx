import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip, Tooltip } from "@mui/material";
import LocationBase from "../../types/locations/LocationBase";
import LocationDetails from "../../types/locations/LocationDetails";
import PlaceIcon from "@mui/icons-material/Place";
import EmailIcon from "@mui/icons-material/Email";
import SpeedIcon from "@mui/icons-material/Speed";

interface LocationListItemProps {
	location: LocationBase;
	isSelected: boolean;
	locationDetails?: LocationDetails;
}

const LocationListItem: React.FC<LocationListItemProps> = ({ location, isSelected, locationDetails }) => {
	const { t } = useTranslation();

	// Determine if we have the full location details or just the base
	const hasDetails = !!locationDetails;

	return (
		<Box
			sx={{
				p: 2,
				borderRadius: 1,
				backgroundColor: isSelected ? "action.selected" : "background.paper",
				"&:hover": {
					backgroundColor: "action.hover",
				},
				cursor: "pointer",
				borderColor: "primary.main",
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
				<Typography
					variant="subtitle1"
					sx={{ fontWeight: isSelected ? "bold" : "normal" }}
				>
					{location.name}
				</Typography>

				{/* Show metric/imperial indicator if details are available */}
				{hasDetails && (
					<Tooltip title={locationDetails.useMetricSystem ? t("company.metric") : t("company.imperial")}>
						<Chip
							icon={<SpeedIcon />}
							label={locationDetails.useMetricSystem ? "Metric" : "Imperial"}
							size="small"
							color={locationDetails.useMetricSystem ? "primary" : "default"}
							variant="outlined"
						/>
					</Tooltip>
				)}
			</Box>

			{/* Description */}
			<Typography
				variant="body2"
				color="text.secondary"
				sx={{
					mt: 0.5,
					display: "-webkit-box",
					WebkitLineClamp: 2,
					WebkitBoxOrient: "vertical",
					overflow: "hidden",
				}}
			>
				{location.description}
			</Typography>

			{/* Email if available */}
			{hasDetails && locationDetails.email && (
				<Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
					<EmailIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
					<Typography
						variant="caption"
						color="text.secondary"
					>
						{locationDetails.email}
					</Typography>
				</Box>
			)}
		</Box>
	);
};

export default LocationListItem;
