import AssetConfiguration from "./AssetConfiguration";
import SensorDetails from "./SensorDetails";

export default interface AssetDetails extends AssetConfiguration {
	locationId: string;
	manufacturer: string;
	model?: string;
	serialNumber?: string;
	sensors?: SensorDetails[];
}
