import React, { useState, forwardRef, useImperativeHandle, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, TextField } from "@mui/material";
import PasswordInputForm, { PasswordFormErrors, validatePasswordFields } from "../ui/PasswordInputForm";

export interface RequiredUserFormData {
	email: string;
	firstName: string;
	lastName: string;
	password?: string;
	confirmPassword?: string;
}

export interface RequiredUserFormErrors {
	firstName?: string;
	lastName?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
}

export interface RequiredDetailsFormRef {
	validateForm: () => boolean;
}

interface RequiredDetailsFormProps {
	formData: RequiredUserFormData;
	formErrors: Record<string, string>;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	updateField?: (name: string, value: string) => void; // Added this prop for direct field updates
	isNew?: boolean; // If true, show password fields by default
	disabled?: boolean;
	onValidationErrors?: (errors: RequiredUserFormErrors) => void;
}

export const validateRequiredUserDetails = (
	formData: RequiredUserFormData,
	isNew: boolean, 
	showPasswordFields: boolean,
	t: (key: string) => string
): RequiredUserFormErrors => {	const errors: RequiredUserFormErrors = {};

	if (!formData.email?.trim()) {
		errors.email = t("validation.emailRequired");
	} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
		errors.email = t("validation.emailInvalid");
	}

	// Use the password validation utility for password fields
	if (isNew || showPasswordFields) {
		const passwordErrors = validatePasswordFields(
			{
				password: formData.password,
				confirmPassword: formData.confirmPassword
			},
			true, // Always validate if isNew or showPasswordFields is true
			false, // No old password needed
			t
		);

		// Merge password errors into the main errors object
		if (passwordErrors.password) {
			errors.password = passwordErrors.password;
		}
		if (passwordErrors.confirmPassword) {
			errors.confirmPassword = passwordErrors.confirmPassword;
		}
	}

	return errors;
};

const RequiredDetailsForm = forwardRef<RequiredDetailsFormRef, RequiredDetailsFormProps>(
	({ formData, formErrors, handleChange, updateField, isNew = true, disabled = false, onValidationErrors }, ref) => {
		const { t } = useTranslation();
		const [showPasswordFields, setShowPasswordFields] = useState(isNew);

		// Update showPasswordFields when isNew changes
		useEffect(() => {
			setShowPasswordFields(isNew);
		}, [isNew]);

		const handleTogglePasswordFields = () => {
			setShowPasswordFields(!showPasswordFields);
			// Clear password fields when hiding them (when user clicks Cancel)
			if (showPasswordFields && updateField) {
				updateField("password", "");
				updateField("confirmPassword", "");
			}
		};

		// Handle password validation updates
		const handlePasswordValidation = (passwordErrors: PasswordFormErrors) => {
			if (onValidationErrors) {
				const currentErrors = validateRequiredUserDetails(formData, isNew, showPasswordFields, t);
				// Merge password errors with the rest of the form errors
				onValidationErrors({
					...currentErrors,
					password: passwordErrors.password,
					confirmPassword: passwordErrors.confirmPassword
				});
			}
		};

		// Memoize the validateForm function with useCallback
		const validateForm = useCallback(() => {
			const errors = validateRequiredUserDetails(formData, isNew, showPasswordFields, t);

			if (onValidationErrors) {
				onValidationErrors(errors);
			}

			return Object.keys(errors).length === 0;
		}, [formData, isNew, showPasswordFields, t, onValidationErrors]);

		// Properly expose the validation method via ref
		useImperativeHandle(
			ref,
			() => ({
				validateForm,
			}),
			[validateForm]
		);
		return (
			<>
				<TextField
					margin="normal"
					required
					fullWidth
					id="email"
					label={t("auth.form.email")}
					name="email"
					type="email"
					value={formData.email}
					onChange={handleChange}
					error={!!formErrors.email}
					helperText={formErrors.email}
					disabled={disabled}
				/>

				<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 1 }}>
					<TextField
						fullWidth
						id="firstName"
						label={t("auth.form.firstName")}
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
						error={!!formErrors.firstName}
						helperText={formErrors.firstName}
						disabled={disabled}
					/>
					<TextField
						fullWidth
						id="lastName"
						label={t("auth.form.lastName")}
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
						error={!!formErrors.lastName}
						helperText={formErrors.lastName}
						disabled={disabled}					/>
				</Box>

				{/* Using the enhanced PasswordInputForm with validation */}
				<PasswordInputForm
					formData={{
						password: formData.password,
						confirmPassword: formData.confirmPassword
					}}
					formErrors={{
						password: formErrors.password,
						confirmPassword: formErrors.confirmPassword
					}}
					handleChange={handleChange}
					onCancel={!isNew ? handleTogglePasswordFields : undefined}
					showPasswordFields={showPasswordFields}
					togglePasswordFields={!isNew ? handleTogglePasswordFields : undefined}
					isNew={isNew}
					disabled={disabled}
					validateOnChange={true}
					onValidation={handlePasswordValidation}
				/>
			</>
		);
	}
);

export default RequiredDetailsForm;
