import React from "react";

import { getAppConfig } from "../../config/environmentVariablesService";

import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	Drawer,
	Box,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	Typography,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import KitchenIcon from "@mui/icons-material/Kitchen";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ShowChartIcon from "@mui/icons-material/ShowChart";

interface SideMenuProps {
	isOpen: boolean;
	onClose: () => void;
}

interface MenuItem {
	label: string;
	path: string;
	icon: React.ReactNode;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();
	const location = useLocation();
	const version = getAppConfig().appVersion;

	// Define menu items
	const menuItems: MenuItem[] = [
		{
			label: t("layout.menu.dashboard"),
			path: "/dashboard",
			icon: <DashboardIcon />,
		},
		{
			label: t("layout.menu.readings"),
			path: "/readings",
			icon: <ShowChartIcon />,
		},
		{
			label: t("layout.menu.company"),
			path: "/company",
			icon: <BusinessIcon />,
		},
		{
			label: t("layout.menu.locations"),
			path: "/locations",
			icon: <LocationOnIcon />,
		},
		{
			label: t("layout.menu.users"),
			path: "/users",
			icon: <GroupIcon />,
		},
		{
			label: t("layout.menu.equipment"),
			path: "/equipment",
			icon: <KitchenIcon />,
		},
		{
			label: t("layout.menu.apiKeys"),
			path: "/api-keys",
			icon: <VpnKeyIcon />,
		},
	];

	// Check if a menu item is active
	const isActiveRoute = (path: string) => {
		return location.pathname.startsWith(path);
	};

	return (
		<Drawer
			anchor="left"
			open={isOpen}
			onClose={onClose}
			sx={{
				width: 280,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: 280,
					boxSizing: "border-box",
				},
			}}
		>
			{/* Menu Items */}
			<List sx={{ pt: 8 }}>
				{menuItems.map((item, index) => (
					<ListItem
						key={index}
						disablePadding
					>
						<ListItemButton
							component={Link}
							to={item.path}
							onClick={onClose}
							selected={isActiveRoute(item.path)}
							sx={{
								"&.Mui-selected": {
									bgcolor: "action.selected",
									"&:hover": {
										bgcolor: "action.hover",
									},
								},
							}}
						>
							<ListItemIcon>{item.icon}</ListItemIcon>
							<ListItemText primary={item.label} />
						</ListItemButton>
					</ListItem>
				))}
			</List>

			<Divider sx={{ mt: "auto" }} />

			{/* Footer */}
			<Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
				<Typography
					variant="body2"
					color="text.secondary"
				>
					{t("layout.version")}: {version}
				</Typography>
			</Box>
		</Drawer>
	);
};

export default SideMenu;
