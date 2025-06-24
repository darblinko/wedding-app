import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	Divider,
	List,
	ListItem,
	Chip,
	Button,
	CircularProgress,
	FormControlLabel,
	Switch,
	Link,
	Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { AlertDetails, AlertSeverity } from "../../types/alerts/AlertDetails";
import alertService from "../../services/api/alertService";
import Messenger from "../../services/ui/messengerService";
import { useNavigate } from "react-router-dom";

interface NotificationsDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [notifications, setNotifications] = useState<AlertDetails[]>([]);
	const [loading, setLoading] = useState(false);
	const [showHandled, setShowHandled] = useState(false);
	const [processingIds, setProcessingIds] = useState<string[]>([]);

	// Fetch notifications when drawer opens or every 30 seconds when open
	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		const fetchNotifications = async () => {
			if (isOpen) {
				setLoading(true);
				try {
					const data = await alertService.list(showHandled);
					setNotifications(data);
				} catch (error) {
					console.error("Error fetching notifications:", error);
					Messenger.error(t("notifications.fetchError"));
				} finally {
					setLoading(false);
				}
			}
		};

		fetchNotifications();

		if (isOpen) {
			intervalId = setInterval(fetchNotifications, 30000); // 30 seconds
		}

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [isOpen, showHandled, t]);

	// Handle marking a notification as handled
	const handleMarkAsHandled = async (id: string) => {
		setProcessingIds((prev) => [...prev, id]);

		try {
			const result = await alertService.markHandled(id, true);
			if (result.isSuccess) {
				// Refresh notifications after handling
				const updatedAlerts = await alertService.list(showHandled);
				setNotifications(updatedAlerts);
				Messenger.success(t("notifications.markedAsHandled"));
			} else {
				Messenger.error(t("notifications.markAsHandledError"));
			}
		} catch (error) {
			console.error("Error marking notification as handled:", error);
			Messenger.error(t("notifications.markAsHandledError"));
		} finally {
			setProcessingIds((prev) => prev.filter((procId) => procId !== id));
		}
	};

	// Navigate to notification link if available
	const handleNavigate = (notification: AlertDetails) => {
		if (notification.navigationLink) {
			onClose();
			navigate(notification.navigationLink);
		}
	};

	// Get severity color for chips
	const getSeverityColor = (
		severity: AlertSeverity
	): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
		switch (severity) {
			case "error":
				return "error";
			case "warning":
				return "warning";
			case "success":
				return "success";
			case "info":
			default:
				return "info";
		}
	};

	return (
		<Drawer
			anchor="right"
			open={isOpen}
			onClose={onClose}
			sx={{
				width: 400,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: 400,
					boxSizing: "border-box",
				},
			}}
		>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					px: 2,
					pt: 9,
					pb: 2,
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Typography variant="h6">{t("notifications.title")}</Typography>
				<IconButton
					onClick={onClose}
					size="small"
				>
					<CloseIcon />
				</IconButton>
			</Box>

			{/* Notifications Filter */}
			<Box
				sx={{
					px: 2,
					py: 1,
					borderBottom: 1,
					borderColor: "divider",
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<FormControlLabel
					control={
						<Switch
							checked={showHandled}
							onChange={(e) => setShowHandled(e.target.checked)}
							color="primary"
						/>
					}
					label={t("notifications.showHandled")}
				/>
			</Box>

			{/* Notifications List */}
			<Box sx={{ overflow: "auto", flexGrow: 1 }}>
				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
						<CircularProgress />
					</Box>
				) : notifications.length > 0 ? (
					<List>
						{notifications.map((notification) => (
							<React.Fragment key={notification.id}>
								<ListItem
									alignItems="flex-start"
									sx={{
										p: 2,
										opacity: notification.isHandled ? 0.8 : 1,
										bgcolor: notification.isHandled ? "action.hover" : "background.paper",
										cursor: notification.navigationLink ? "pointer" : "default",
									}}
									onClick={() => notification.navigationLink && handleNavigate(notification)}
								>
									<Box sx={{ width: "100%" }}>
										<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
											<Chip
												label={notification.severity.toUpperCase()}
												color={getSeverityColor(notification.severity)}
												size="small"
											/>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{new Date(notification.timeUtc).toLocaleString()}
											</Typography>
										</Box>

										<Typography
											variant="subtitle1"
											sx={{ fontWeight: "bold" }}
										>
											{notification.title}
										</Typography>

										<Typography
											variant="body2"
											color="text.primary"
											sx={{ mb: 2 }}
										>
											{notification.text}
										</Typography>

										{notification.navigationLink && (
											<Tooltip title={t("notifications.clickToNavigate")}>
												<Link
													component="span"
													sx={{
														cursor: "pointer",
														display: "flex",
														alignItems: "center",
														mb: 1,
														"&:hover": { textDecoration: "underline" },
													}}
													onClick={(e) => {
														e.stopPropagation();
														handleNavigate(notification);
													}}
												>
													{t("notifications.navigate")}
												</Link>
											</Tooltip>
										)}

										{notification.isHandled ? (
											<Box sx={{ display: "flex", alignItems: "center", mt: 1, color: "text.secondary" }}>
												<CheckCircleIcon
													fontSize="small"
													sx={{ mr: 0.5 }}
												/>
												<Typography variant="caption">
													{t("notifications.handledBy", {
														user: notification.handledBy || "Unknown",
														time: notification.handleTimeUtc
															? new Date(notification.handleTimeUtc).toLocaleString()
															: "Unknown time",
													})}
												</Typography>
											</Box>
										) : (
											<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
												<Button
													variant="contained"
													color="primary"
													size="small"
													onClick={(e) => {
														e.stopPropagation();
														handleMarkAsHandled(notification.id);
													}}
													disabled={processingIds.includes(notification.id)}
													startIcon={
														processingIds.includes(notification.id) ? <CircularProgress size={16} /> : <CheckCircleIcon />
													}
												>
													{processingIds.includes(notification.id)
														? t("notifications.processing")
														: t("notifications.markAsHandled")}
												</Button>
											</Box>
										)}
									</Box>
								</ListItem>
								<Divider />
							</React.Fragment>
						))}
					</List>
				) : (
					<Box sx={{ p: 4, textAlign: "center" }}>
						<AccessTimeIcon sx={{ fontSize: 48, color: "action.disabled", mb: 2 }} />
						<Typography
							variant="body1"
							color="text.secondary"
						>
							{t("notifications.noNotifications")}
						</Typography>
					</Box>
				)}
			</Box>
		</Drawer>
	);
};

export default NotificationsDrawer;
