import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import userService from "../../services/api/userService";
import Messenger from "../../services/ui/messengerService";
import PasswordInputForm, { validatePasswordFields, PasswordFormErrors } from "../ui/PasswordInputForm";

interface PasswordResetFormProps {
	onSuccess?: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onSuccess }) => {
	const { t } = useTranslation();
	const [showPasswordFields, setShowPasswordFields] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [formErrors, setFormErrors] = useState<PasswordFormErrors>({});

	const handleTogglePasswordFields = () => {
		setShowPasswordFields(!showPasswordFields);
		// Clear form data and errors when toggling
		if (showPasswordFields) {
			setFormData({
				oldPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			setFormErrors({});
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		// Map the PasswordInput component field names to our form state fields
		if (name === "password") {
			setFormData((prev) => ({ ...prev, newPassword: value }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}

		// Clear error for this field when user starts typing
		if (name === "oldPassword" && formErrors.oldPassword) {
			setFormErrors((prev) => ({ ...prev, oldPassword: "" }));
		} else if (name === "password" && formErrors.password) {
			setFormErrors((prev) => ({ ...prev, password: "" }));
		} else if (name === "confirmPassword" && formErrors.confirmPassword) {
			setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
		}
	};

	const validateForm = () => {
		// Use the utility function from PasswordInputForm for consistent validation
		const errors = validatePasswordFields(
			{
				oldPassword: formData.oldPassword,
				password: formData.newPassword,
				confirmPassword: formData.confirmPassword,
			},
			showPasswordFields,
			true, // showOldPassword
			t
		);

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		Messenger.confirm(t("layout.preferences.passwordResetConfirmation"), t("common.confirmationTitle"), async () => {
			setLoading(true);
			try {
				const result = await userService.resetPassword(formData.oldPassword, formData.newPassword);

				if (result.isSuccess) {
					Messenger.success(t("layout.preferences.passwordResetSuccess"));
					handleTogglePasswordFields();
					if (onSuccess) {
						onSuccess();
					}
				} else {
					setFormErrors({
						oldPassword: result.message || t("layout.preferences.passwordResetError"),
					});
				}
			} catch (error) {
				Messenger.error(t("layout.preferences.passwordResetError"));
			} finally {
				setLoading(false);
			}
		});
	};

	// Handle real-time validation
	const handleValidation = (errors: PasswordFormErrors) => {
		setFormErrors(errors);
	};

	return (
		<Box sx={{ width: "100%" }}>
			<PasswordInputForm
				formData={{
					oldPassword: formData.oldPassword,
					password: formData.newPassword,
					confirmPassword: formData.confirmPassword,
				}}
				formErrors={formErrors}
				handleChange={handleChange}
				onSubmit={handleSubmit}
				onCancel={handleTogglePasswordFields}
				showPasswordFields={showPasswordFields}
				togglePasswordFields={handleTogglePasswordFields}
				isLoading={loading}
				isNew={false}
				showOldPassword={true}
				validateOnChange={true}
				onValidation={handleValidation}
				toggleLinkText={t("layout.preferences.changePassword")}
				submitButtonText={t("layout.preferences.updatePassword")}
			/>
		</Box>
	);
};

export default PasswordResetForm;
