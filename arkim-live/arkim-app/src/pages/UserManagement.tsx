import React from "react";
import { useTranslation } from "react-i18next";
import GroupIcon from "@mui/icons-material/Group";

import MasterDetailsView from "../components/ui/MasterDetailsView";
import UserListItem from "../components/users/UserListItem";
import UserForm from "../components/users/UserForm";
import userService from "../services/api/userService";
import UserBase from "../types/user/UserBase";

const UserManagement: React.FC = () => {
	const { t } = useTranslation();

	return (
		<MasterDetailsView<UserBase>
			// Header
			title={t("users.title")}
			icon={<GroupIcon />}
			// List
			filterInactive={true}
			listItems={userService.list}
			renderListItem={(user, isSelected) => (
				<UserListItem
					user={user}
					isSelected={isSelected}
				/>
			)}
			// Details
			idPropName="userName"
			detailsPageComponent={(user: UserBase | undefined, refreshList: () => Promise<void>) => <UserForm selectedUser={user} refreshList={refreshList}/>}
		/>
	);
};

export default UserManagement;
