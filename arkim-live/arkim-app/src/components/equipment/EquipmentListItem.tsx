import React from "react";
import { ListItem, ListItemText, Box, Typography, Chip } from "@mui/material";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import AssetBase from "../../types/equipment/AssetBase";

interface EquipmentListItemProps {
	equipment: AssetBase;
	isSelected: boolean;
}

const EquipmentListItem: React.FC<EquipmentListItemProps> = ({ equipment, isSelected }) => {
	return (
		<ListItem
			sx={{
				py: 1.5,
				bgcolor: isSelected ? "action.selected" : "transparent",
				"&:hover": {
					bgcolor: isSelected ? "action.selected" : "action.hover",
				},
			}}
		>
			<ListItemText
				primary={
					<Typography
						variant="subtitle2"
						noWrap
					>
						{equipment.name}
					</Typography>
				}
				secondary={
					<Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
						{equipment.type && (
							<Chip
								label={equipment.type}
								size="small"
								sx={{ mr: 1, height: 20, fontSize: "0.7rem" }}
							/>
						)}
						{equipment.description && (
							<Typography
								variant="body2"
								color="text.secondary"
								noWrap
							>
								{equipment.description}
							</Typography>
						)}
					</Box>
				}
			/>
		</ListItem>
	);
};

export default EquipmentListItem;
