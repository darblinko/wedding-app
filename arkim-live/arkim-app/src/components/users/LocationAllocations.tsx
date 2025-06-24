import React from "react";
import { useTranslation } from "react-i18next";
import {
	Box,
	Checkbox,
	CircularProgress,
	Paper,
	Radio,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import LocationBase from "../../types/locations/LocationBase";

interface LocationAllocationsProps {
	locations: LocationBase[];
	assignedLocations: string[];
	defaultLocation: string | undefined;
	disabled: boolean;
	isLoading: boolean;
	onLocationAssignmentChanged: (locationId: string, isAssigned: boolean) => void;
	onDefaultLocationChanged: (locationId: string) => void;
}

const LocationAllocations: React.FC<LocationAllocationsProps> = ({
	locations = [],
	assignedLocations = [],
	defaultLocation,
	disabled,
	isLoading,
	onLocationAssignmentChanged,
	onDefaultLocationChanged,
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (locations.length === 0) {
		return <Typography sx={{ p: 2 }}>{t("locations.noLocationsAvailable")}</Typography>;
	}

	return (
		<Box sx={{ p: 2 }}>
			<TableContainer component={Paper}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>{t("locations.name")}</TableCell>
							<TableCell>{t("users.form.locationAllocations.assigned")}</TableCell>
							<TableCell>{t("users.form.locationAllocations.default")}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{locations.map((location) => (
							<TableRow
								key={location.id}
							>
								<TableCell>
									<Typography variant="body2">{location.name}</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
									>
										{location.description}
									</Typography>
								</TableCell>
								<TableCell>
									<Checkbox
										checked={location.id ? assignedLocations.includes(location.id) : false}
										onChange={(e) => location.id && onLocationAssignmentChanged(location.id, e.target.checked)}
										disabled={disabled}
									/>
								</TableCell>
								<TableCell>
									<Radio
										checked={location.id === defaultLocation}
										onChange={() => location.id && onDefaultLocationChanged(location.id)}
										disabled={disabled || (!!location.id && !assignedLocations.includes(location.id))}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default LocationAllocations;
