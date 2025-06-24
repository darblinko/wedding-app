import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	Alert,
	CircularProgress,
	FormControlLabel,
	Checkbox,
} from "@mui/material";
import { useAuth } from "../../components/contexts/AuthContext";
import UserLoginDto from "../../types/auth/UserLoginDto";
import PasswordInput from "../../components/ui/PasswordInput";

const Login: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const auth = useAuth();

	const [formData, setFormData] = useState<UserLoginDto>({
		companyId: "",
		email: "",
		password: "",
		longLasting: false,
	});

	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, checked, type } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});

		// Clear validation errors when user changes a field
		if (formErrors[name]) {
			setFormErrors({
				...formErrors,
				[name]: "",
			});
		}
	};

	const validateForm = () => {
		const errors: Record<string, string> = {};

		if (!formData.companyId.trim()) {
			errors.companyId = t("validation.companyPinRequired");
		}

		if (!formData.email.trim()) {
			errors.email = t("validation.emailRequired");
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = t("validation.emailInvalid");
		}

		if (!formData.password.trim()) {
			errors.password = t("validation.passwordRequired");
		}

		// Set errors and return validation result
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};


	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		setApiError(null);

		try {
			console.log("Submitting login form...");
			const result = await auth.signIn(formData);

			if (result.isSuccess) {
				console.log("Login successful, navigating to dashboard");

				// Wait a moment for auth state to update before navigating
				setTimeout(() => {
					// Navigate to the dashboard on success with replace:true to avoid history stack buildup
					navigate("/dashboard", { replace: true });
				}, 100);
			} else {
				setApiError(result.message || "Login failed. Please check your credentials.");
			}
		} catch (error: any) {
			console.error("Login error:", error);
			setApiError(error.message || "An error occurred during login. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// If already authenticated, redirect to dashboard
	useEffect(() => {
		// Check for authentication status, but only if we're not in the process of logging in
		if (auth.isAuthenticated && !auth.isLoading && !isSubmitting) {
			console.log("Already authenticated, redirecting to dashboard");
			navigate("/dashboard", { replace: true });
		}
	}, [auth.isAuthenticated, auth.isLoading, navigate, isSubmitting]);

	if (auth.isLoading) {
		return (
			<Container
				component="main"
				maxWidth="sm"
			>
				<Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
					<CircularProgress />
				</Box>
			</Container>
		);
	}

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
								{t("auth.signIn")}
							</Typography>
						</Box>

						<TextField
							margin="normal"
							required
							fullWidth
							id="companyId"
							label={t("auth.form.companyPin")}
							name="companyId"
							value={formData.companyId}
							onChange={handleChange}
							error={!!formErrors.companyId}
							helperText={formErrors.companyId}
							autoFocus
						/>						<TextField
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
						/>

						<PasswordInput
							margin="normal"
							required
							name="password"
							label={t("auth.form.password")}
							value={formData.password}
							onChange={handleChange}
							error={!!formErrors.password}
							helperText={formErrors.password}
							autoComplete="current-password"
						/>

						<FormControlLabel
							control={
								<Checkbox
									color="primary"
									name="longLasting"
									checked={formData.longLasting}
									onChange={handleChange}
								/>
							}
							label={t("auth.form.rememberMe")}
							sx={{ mt: 1 }}
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
							{isSubmitting ? t("common.loading") : t("auth.signIn")}
						</Button>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
};

export default Login;
