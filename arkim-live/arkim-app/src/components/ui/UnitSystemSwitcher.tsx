import React from "react";
import { useTranslation } from "react-i18next";
import { Box, FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup, Typography } from "@mui/material";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import ScaleIcon from "@mui/icons-material/Scale";

interface UnitSystemSwitcherProps {
	useMetricSystem: boolean;
	disabled?: boolean;
	onChange: (useMetric: boolean) => void;
	showHelperText?: boolean;
}

const UnitSystemSwitcher: React.FC<UnitSystemSwitcherProps> = ({
	useMetricSystem,
	disabled,
	onChange,
	showHelperText = true,
}) => {
	const { t } = useTranslation();

	const handleUnitSystemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const useMetric = event.target.value === "metric";
		onChange(useMetric);
	};

	return (
		<FormControl
			component="fieldset"
			sx={{ width: "100%" }}
		>
			<RadioGroup
				name="unit-system"
				value={useMetricSystem ? "metric" : "imperial"}
				onChange={handleUnitSystemChange}
				row
			>
				<FormControlLabel
					disabled={disabled}
					value="metric"
					control={<Radio />}
					label={
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
								<ScaleIcon />
							</Box>
							<Typography variant="body2">{t("company.metric")}</Typography>
						</Box>
					}
				/>
				<FormControlLabel
					disabled={disabled}
					value="imperial"
					control={<Radio />}
					label={
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
								<SquareFootIcon />
							</Box>
							<Typography variant="body2">{t("company.imperial")}</Typography>
						</Box>
					}
				/>
			</RadioGroup>
			{showHelperText && <FormHelperText>{t("company.unitSystemDescription")}</FormHelperText>}
		</FormControl>
	);
};

export default UnitSystemSwitcher;
