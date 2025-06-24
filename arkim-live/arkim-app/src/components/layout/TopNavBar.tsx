import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppBar, Box, Toolbar, IconButton, Typography, Avatar, Tooltip, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useUserContext } from "../contexts/AuthContext";
import { getAppConfig } from "../../config/environmentVariablesService";

interface TopNavBarProps {
	toggleMenu: () => void;
	togglePreferences: () => void;
	toggleAlerts: () => void;
	unreadAlertsCount: number;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ 
	toggleMenu, 
	togglePreferences, 
	toggleAlerts,
	unreadAlertsCount
}) => {
	const { t } = useTranslation();
	const userContextDetails= useUserContext(),
		userDetails = userContextDetails?.user;
	const appConfig = getAppConfig();

	// Get user initials for the avatar
	const getUserInitials = (): string => {
		if (!userDetails?.firstName) return "?";
		return `${userDetails.firstName.charAt(0)}${userDetails.lastName?.charAt(0) || ""}`;
	};

	return (
		<AppBar
			position="static"
			color="default"
			elevation={1}
			sx={{
				zIndex: (theme) => theme.zIndex.drawer + 1,
				bgcolor: "background.paper",
				color: "text.primary",
			}}
		>
			<Toolbar>
				{/* Menu Button - only for admin users */}
				{userDetails?.isAdmin && (
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 2 }}
						onClick={toggleMenu}
					>
						<MenuIcon />
					</IconButton>
				)}

				{/* Logo and Brand */}
				<Box
					component={Link}
					to="/dashboard"
					sx={{
						display: "flex",
						alignItems: "center",
						color: "inherit",
						textDecoration: "none",
					}}
				>
					<Avatar
						src="/arkim_logo.png"
						sx={{ width: 32, height: 32, mr: 1 }}
						alt="Arkim Logo"
					/>
					<Typography
						variant="h6"
						component="div"
						sx={{ fontWeight: "bold" }}
					>
						{appConfig.appName}
					</Typography>
				</Box>

				{/* Spacer */}
				<Box sx={{ flexGrow: 1 }} />

				{/* Company Title */}
				{userDetails && (
					<Typography
						variant="h5"
						sx={{
							mr: 2,
							display: { xs: "none", sm: "block" },
						}}
					>
						{`${userContextDetails?.companyName} ${t("layout.title")}`.toUpperCase()}
					</Typography>
				)}

				{/* Spacer */}
				<Box sx={{ flexGrow: 1 }} />

				{/* Right side tools */}
				<Box sx={{ display: "flex", alignItems: "center" }}>
					{/* Notifications */}
					{/* Hidden for now, can be enabled when the notifications feature is implemented */}
					{/*
					<Tooltip title={t("layout.tooltips.notifications")}>
						<IconButton
							size="large"
							color="inherit"
							onClick={toggleAlerts}
						>
							<Badge
								badgeContent={unreadAlertsCount}
								color="error"
								overlap="circular"
								max={99}
							>
								<NotificationsIcon />
							</Badge>
						</IconButton>
					</Tooltip>
					*/}
					{/* User Profile Button */}
					<Tooltip title={t("layout.tooltips.profile")}>
						<IconButton
							size="large"
							edge="end"
							onClick={togglePreferences}
							color="inherit"
						>
							{userDetails ? (
								<Avatar
									sx={{
										width: 32,
										height: 32,
										bgcolor: "primary.main",
										fontSize: "0.875rem",
									}}
								>
									{getUserInitials()}
								</Avatar>
							) : (
								<AccountCircleIcon />
							)}
						</IconButton>
					</Tooltip>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default TopNavBar;
