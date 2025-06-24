import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import UserBase from "../../types/user/UserBase";
import { useUserContext } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface UserListItemProps {
	user: UserBase;
	isSelected: boolean;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, isSelected }) => {
	const { t } = useTranslation();
	const userContextDetails = useUserContext();
	const isCurrentUser = userContextDetails?.user?.userName === user.userName;

	return (
		<Box
			sx={{
				p: 2,
				display: "flex",
				alignItems: "center",
				cursor: "pointer",
				backgroundColor: isSelected ? "action.selected" : "transparent",
				borderLeft: user.isActive ? undefined : "4px solid",
				borderLeftColor: user.isActive ? undefined : "error.main",
				"&:hover": {
					backgroundColor: isSelected ? "action.selected" : "action.hover",
				},
			}}
		>
			<Box sx={{ flexGrow: 1, minWidth: 0 }}>
				<Typography
					variant="h6"
					sx={{ fontWeight: isSelected ? "bold" : "normal" }}
				>
					{user.userName || ""}
				</Typography>
				<Typography variant="body1">{`${user.firstName || ""} ${user.lastName || ""}`}</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
				>
					{user.email || ""}
				</Typography>
			</Box>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					gap: 1,
					flexShrink: 0,
					alignItems: "flex-end",
				}}
			>
				{user.isAdmin && (
					<Chip
						label={t("users.admin")}
						color={user.isActive ? "success" : "error"}
						size="small"
						variant="outlined"
					/>
				)}
				{isCurrentUser && (
					<Chip
						label={t("users.current")}
						color="primary"
						size="small"
						variant="outlined"
					/>
				)}
			</Box>
		</Box>
	);
};

export default UserListItem;
