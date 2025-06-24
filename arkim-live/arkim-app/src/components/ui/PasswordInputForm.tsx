import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Collapse, Link, CircularProgress } from "@mui/material";
import PasswordInput from "./PasswordInput";

export interface PasswordFormData {
	password?: string;
	confirmPassword?: string;
	oldPassword?: string;
}

export interface PasswordFormErrors {
	password?: string;
	confirmPassword?: string;
	oldPassword?: string;
}

interface PasswordInputFormProps {
	formData: PasswordFormData;
	formErrors: PasswordFormErrors;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit?: (e: React.FormEvent) => void;
	onCancel?: () => void;
	showPasswordFields?: boolean;
	togglePasswordFields?: () => void;
	isLoading?: boolean;
	isNew?: boolean;
	disabled?: boolean;
	showOldPassword?: boolean;
	validateOnChange?: boolean;
	onValidation?: (errors: PasswordFormErrors) => void;
	// We'll keep these overrides but make them optional
	submitButtonText?: string;
	cancelButtonText?: string;
	toggleLinkText?: string;
}

// Utility function to validate password fields
export const validatePasswordFields = (
	formData: PasswordFormData,
	showPasswordFields: boolean,
	showOldPassword: boolean,
	t: (key: string) => string
): PasswordFormErrors => {
	const errors: PasswordFormErrors = {};

	if (!showPasswordFields) {
		return errors;
	}

	// Validate old password if it's required
	if (showOldPassword && !formData.oldPassword) {
		errors.oldPassword = t("validation.currentPasswordRequired");
	}

	// Validate new password
	if (!formData.password) {
		errors.password = t("validation.passwordRequired");
	} else if (formData.password.length < 8) {
		errors.password = t("validation.passwordMinLength");
	}

	// Validate password confirmation
	if (formData.password !== formData.confirmPassword) {
		errors.confirmPassword = t("validation.passwordsDoNotMatch");
	}

	return errors;
};

const PasswordInputForm: React.FC<PasswordInputFormProps> = ({
	formData,
	formErrors,
	handleChange,
	onSubmit,
	onCancel,
	showPasswordFields = true,
	togglePasswordFields,
	isLoading = false,
	isNew = false,
	disabled = false,
	showOldPassword = false,
	validateOnChange = false,
	onValidation,
	// Optional text overrides
	submitButtonText,
	cancelButtonText,
	toggleLinkText
}) => {
	const { t } = useTranslation();

	// All text labels use translations directly
	const actualSubmitButtonText = submitButtonText || (isNew ? t("common.save") : t("common.update"));
	const actualCancelButtonText = cancelButtonText || t("common.cancel");
	const actualToggleLinkText = toggleLinkText || t("auth.changePassword");
	const oldPasswordLabel = t("layout.preferences.currentPassword");
	const passwordLabel = isNew ? t("auth.form.password") : t("layout.preferences.newPassword");
	const confirmPasswordLabel = isNew ? t("auth.form.confirmPassword") : t("layout.preferences.confirmNewPassword");
	const passwordHelperText = t("validation.passwordMinLength");

	// Custom change handler to validate on change if needed
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleChange(e);
		
		// Validate on change if requested
		if (validateOnChange && onValidation) {
			const newValue = e.target.value;
			const name = e.target.name;
			
			// Update the value locally for validation
			const updatedFormData = {
				...formData,
				[name]: newValue
			};
			
			const errors = validatePasswordFields(
				updatedFormData, 
				showPasswordFields,
				showOldPassword,
				t
			);
			
			onValidation(errors);
		}
	};

	// Render the toggle link only if togglePasswordFields function is provided
	const renderToggleLink = () => {
		if (!togglePasswordFields) return null;

		return (
			<Box sx={{ mt: 2, mb: 2 }}>
				<Link
					component="button"
					variant="body2"
					color="primary"
					onClick={togglePasswordFields}
					sx={{ textDecoration: "none", cursor: "pointer" }}
					type="button"
				>
					{actualToggleLinkText}
				</Link>
			</Box>
		);
	};

	return (
		<>
			{!showPasswordFields && !disabled && renderToggleLink()}

			<Collapse in={showPasswordFields}>
				<Box
					component={onSubmit ? "form" : "div"}
					noValidate
					onSubmit={onSubmit}
				>
					{showOldPassword && (
						<PasswordInput
							name="oldPassword"
							label={oldPasswordLabel}
							value={formData.oldPassword || ""}
							onChange={handleInputChange}
							error={!!formErrors.oldPassword}
							helperText={formErrors.oldPassword || ""}
							disabled={disabled || isLoading}
							required={true}
							autoComplete="current-password"
						/>
					)}

					<PasswordInput
						name="password"
						label={passwordLabel}
						value={formData.password || ""}
						onChange={handleInputChange}
						error={!!formErrors.password}
						helperText={formErrors.password || passwordHelperText}
						disabled={disabled || isLoading}
						required={true}
						autoComplete="new-password"
					/>

					<PasswordInput
						name="confirmPassword"
						label={confirmPasswordLabel}
						value={formData.confirmPassword || ""}
						onChange={handleInputChange}
						error={!!formErrors.confirmPassword}
						helperText={formErrors.confirmPassword || ""}
						disabled={disabled || isLoading}
						required={true}
						autoComplete="new-password"
					/>

					{(onSubmit || onCancel) && (
						<Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
							{onCancel && (
								<Button
									variant="outlined"
									color="inherit"
									onClick={onCancel}
									disabled={isLoading}
									type="button"
								>
									{actualCancelButtonText}
								</Button>
							)}
							{onSubmit && (
								<Button
									type="submit"
									variant="contained"
									color="primary"
									disabled={isLoading || disabled}
									startIcon={isLoading ? <CircularProgress size={20} /> : null}
									sx={{ ml: onCancel ? 1 : 0 }}
								>
									{isLoading ? t("common.processing") : actualSubmitButtonText}
								</Button>
							)}
						</Box>
					)}
				</Box>
			</Collapse>
		</>
	);
};

export default PasswordInputForm;
