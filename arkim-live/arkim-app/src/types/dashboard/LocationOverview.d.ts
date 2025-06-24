import AssetStatus from "../equipment/AssetStatus";
import LocationDetails from "../locations/LocationDetails";

export default interface LocationOverview {
	isSuccess: boolean;
	location: LocationDetails;
	assets: AssetStatus[];
	updatedAtUtc: Date;
	errorMessage: string;
	
}
