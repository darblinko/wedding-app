import React from "react";
import LocationOverview from "../../types/dashboard/LocationOverview";
import MultiLineChart from "../ui/analytics/MultiLineChart";
import { useTranslation } from "react-i18next";

const HumidityChart: React.FC<{ locationOverview: LocationOverview }> = ({ locationOverview }) => {
	const { t } = useTranslation();
	
	const data = locationOverview.assets.map((asset) => ({
		seriesLabel: asset.asset.name,
		dataPoints: asset.recentHumidityReadings,
	}));
	return (
		<MultiLineChart
			title={t("dashboard.charts.humidityTrend")}
			xAxisLabel={t("dashboard.charts.time")}
			yAxisLabel={t("dashboard.charts.humidity")}
			data={data}
		/>
	);
};

export default HumidityChart;
