import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import companyService from "../../services/api/companyService";
import CompanySignupDto from "../../types/company/CompanySignupDto";
import { Container, Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import RequiredDetailsForm, {
	RequiredUserFormData,
	RequiredUserFormErrors,
	validateRequiredUserDetails,
} from "../../components/users/RequiredDetailsForm";

const SignUp: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [formData, setFormData] = useState<CompanySignupDto & RequiredUserFormData>({
		companyPin: "",
		companyName: "",
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);
	const [signupSuccess, setSignupSuccess] = useState(false);
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		// Convert companyPin to lowercase automatically
		const processedValue = name === "companyPin" ? value.toLowerCase() : value;

		setFormData({
			...formData,
			[name]: processedValue,
		});

		// Clear validation errors when user changes a field
		if (formErrors[name]) {
			setFormErrors({
				...formErrors,
				[name]: "",
			});
		}
	};

	// Handle validation errors from the RequiredDetailsForm component
	const handleValidationErrors = (errors: RequiredUserFormErrors) => {
		setFormErrors({
			...formErrors,
			...(errors as Record<string, string>),
		});
	};

	// Form validation now uses the centralized validation logic
	const validateForm = () => {
		// Validate required user details using the shared validation logic
		const userErrors = validateRequiredUserDetails(formData, true, true, t);

		// Add company name and pin validation (specific to SignUp)
		const allErrors = { ...userErrors } as Record<string, string>;

		if (!formData.companyName.trim()) {
			allErrors.companyName = t("validation.companyNameRequired");
		}

		// Validate companyPin - required, lowercase only characters and dashes up to 15 characters
		if (!formData.companyPin.trim()) {
			allErrors.companyPin = t("validation.companyPinRequired");
		} else if (!/^[a-z-]{1,15}$/.test(formData.companyPin)) {
			allErrors.companyPin = t("validation.companyPinFormat");
		}

		// Set the errors and return validation result
		setFormErrors(allErrors);
		return Object.keys(allErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Use the centralized validation
		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		setApiError(null);

		try {
			const signupData: CompanySignupDto = {
				companyPin: formData.companyPin,
				companyName: formData.companyName,
				email: formData.email,
				firstName: formData.firstName,
				lastName: formData.lastName,
				password: formData.password as string,
			};

			const response = await companyService.signup(signupData);
			if (!response.isSuccess) {
				throw new Error(response.message || "Signup failed");
			}
			console.log("Signup successful:", response);

			setSignupSuccess(true);

			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error: any) {
			console.error("Signup error:", error);
			setApiError(error.message || error.response?.data?.message || "An error occurred during registration. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Container
			component="main"
			maxWidth="sm"
		>
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				{/* Logo */}
				<Box sx={{ mb: 4 }}>
					<img
						src="/arkim_logo_horizontal.png"
						alt="Arkim Logo"
						style={{ maxWidth: "240px", height: "auto" }}
					/>
				</Box>

				<Paper
					elevation={3}
					sx={{ p: 4, width: "100%" }}
				>
					{signupSuccess ? (
						<Box sx={{ textAlign: "center" }}>
							<Box
								sx={{
									backgroundColor: "success.light",
									borderRadius: "50%",
									width: 64,
									height: 64,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									margin: "0 auto",
									mb: 3,
								}}
							>
								<CheckCircle
									color="success"
									sx={{ fontSize: 40 }}
								/>
							</Box>{" "}
							<Typography variant="h6">Registration successful!</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mt: 1 }}
							>
								You will be redirected to the login page shortly.
							</Typography>
						</Box>
					) : (
						<Box
							component="form"
							onSubmit={handleSubmit}
							noValidate
							sx={{ mt: 1 }}
						>
							{apiError && (
								<Alert
									severity="error"
									sx={{ mb: 2 }}
								>
									{apiError}
								</Alert>
							)}

							<Box
								width={"100%"}
								display={"flex"}
								justifyContent={"center"}
							>
								<Typography
									component="h1"
									variant="h4"
									sx={{ mb: 3 }}
								>
									{t("auth.createAccount")}
								</Typography>
							</Box>
							<TextField
								margin="normal"
								required
								fullWidth
								id="companyPin"
								label={t("auth.form.companyPin")}
								name="companyPin"
								value={formData.companyPin}
								onChange={handleChange}
								error={!!formErrors.companyPin}
								helperText={formErrors.companyPin || t("auth.form.companyPinHelp")}
								inputProps={{
									maxLength: 15,
								}}
							/>

							<TextField
								margin="normal"
								required
								fullWidth
								id="companyName"
								label={t("auth.form.companyName")}
								name="companyName"
								value={formData.companyName}
								onChange={handleChange}
								error={!!formErrors.companyName}
								helperText={formErrors.companyName}
							/>

							{/* Use RequiredDetailsForm for common user fields with onValidationErrors callback */}
							<RequiredDetailsForm
								formData={formData}
								formErrors={formErrors}
								handleChange={handleChange}
								isNew={true}
								disabled={isSubmitting}
								onValidationErrors={handleValidationErrors}
							/>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								sx={{ mt: 3, mb: 2, py: 1.5 }}
								disabled={isSubmitting}
								startIcon={
									isSubmitting && (
										<CircularProgress
											size={20}
											color="inherit"
										/>
									)
								}
							>
								{isSubmitting ? t("common.loading") : t("auth.signUp")}
							</Button>

							<Box sx={{ mt: 2, textAlign: "center" }}>
								{" "}
								<Typography variant="body2">
									{t("auth.alreadyHaveAccount")}{" "}
									<Link
										component={RouterLink}
										to="/login"
										color="primary"
									>
										{t("auth.signIn")}
									</Link>
								</Typography>
							</Box>
						</Box>
					)}
				</Paper>
			</Box>
		</Container>
	);
};

export default SignUp;
