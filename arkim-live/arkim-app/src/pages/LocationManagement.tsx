import React from "react";
import { useTranslation } from "react-i18next";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import MasterDetailsView from "../components/ui/MasterDetailsView";
import LocationListItem from "../components/locations/LocationListItem";
import LocationForm from "../components/locations/LocationForm";
import locationService from "../services/api/locationService";
import LocationBase from "../types/locations/LocationBase";

/**
 * Location Management page that uses the MasterDetailsView component
 * for a consistent location management experience
 */
const LocationManagement: React.FC = () => {
	const { t } = useTranslation();

	return (
		<MasterDetailsView<LocationBase>
			// Display props
			title={t("locations.title")}
			icon={<LocationOnIcon />}
			// List props
			listItems={locationService.list}
			renderListItem={(location, isSelected) => (
				<LocationListItem
					location={location}
					isSelected={isSelected}
				/>
			)}
			// Details props
			idPropName="id"
			detailsPageComponent={(location: LocationBase | undefined, refreshList: () => Promise<void>) => (
				<LocationForm
					location={location}
					refreshList={refreshList}
				/>
			)}
		/>
	);
};

export default LocationManagement;
