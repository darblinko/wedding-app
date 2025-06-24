import AssetBase from "./AssetBase";

export default interface AssetDetails extends AssetBase {
	minOperatingTemperatureC?: double;
	maxOperatingTemperatureC?: double;
	minOperatingHumidityPercent?: double;
	maxOperatingHumidityPercent?: double;
}
