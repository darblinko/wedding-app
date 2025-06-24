import React from "react";
import LocationOverview from "../../types/dashboard/LocationOverview";
import MultiLineChart from "../ui/analytics/MultiLineChart";
import { useTranslation } from "react-i18next";

const TemperatureChart: React.FC<{ locationOverview: LocationOverview }> = ({ locationOverview }) => {
	const { t } = useTranslation();
	const useMetricSystem = locationOverview?.location?.useMetricSystem ?? false;



	const data = locationOverview.assets.map((asset) => {
		if (!useMetricSystem) {
			Object.keys(asset.recentTemperatureReadings).forEach((key) => {
				asset.recentTemperatureReadings[key] = (asset.recentTemperatureReadings[key] * 9) / 5 + 32;
			});
		}
		
		return {
			seriesLabel: asset.asset.name,
			dataPoints: asset.recentTemperatureReadings
		}
	});
	return (
		<MultiLineChart
			title={t("dashboard.charts.temperatureTrend")}
			xAxisLabel={t("dashboard.charts.time")}
			yAxisLabel={useMetricSystem ? t("dashboard.charts.temperatureC") : t("dashboard.charts.temperatureF")}
			data={data}
		/>
	);
};

export default TemperatureChart;
