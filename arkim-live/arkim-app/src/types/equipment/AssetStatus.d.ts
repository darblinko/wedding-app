import { t } from "i18next";
import AssetConfiguration from "./AssetConfiguration";
import SensorDetails from "./SensorDetails";
import AssetIssueTypes from "./AssetIssueTypes";

export default interface AssetStatus {
	asset: AssetConfiguration;
	lastRegisteredTempC: number;
	lastRegisteredTempTimeUtc: Date;
	lastRegisteredHumidityPercent: number;
	lastRegisteredHumidityTimeUtc: Date;
	recentTemperatureReadings: Record<string, number>;
	recentHumidityReadings: Record<string, number>;
	issues: Record<int, number?>;
}
