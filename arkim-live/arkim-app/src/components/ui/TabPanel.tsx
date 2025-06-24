import React from "react";
import { Box } from "@mui/material";

export interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
	id?: string;
	padding?: string | number;
}

/**
 * TabPanel component that displays content based on the selected tab.
 * Follows accessibility best practices with proper ARIA attributes.
 */
const TabPanel: React.FC<TabPanelProps> = (props) => {
	const { children, value, index, id = "tabpanel", padding = "16px 0", ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`${id}-${index}`}
			aria-labelledby={`${id.replace("tabpanel", "tab")}-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ padding }}>
					{children}
				</Box>
			)}
		</div>
	);
};

export default TabPanel;