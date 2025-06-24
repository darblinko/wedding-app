import LocationBase from "./LocationBase";

export default interface LocationDetails extends LocationBase {
	useMetricSystem: boolean;
	email?: string;
}