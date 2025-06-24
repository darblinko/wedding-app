import React, { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface PasswordInputProps {
	name: string;
	label: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	error?: boolean;
	helperText?: string;
	disabled?: boolean;
	required?: boolean;
	autoComplete?: string;
	margin?: "none" | "dense" | "normal";
}

const PasswordInput: React.FC<PasswordInputProps> = ({
	name,
	label,
	value,
	onChange,
	error = false,
	helperText = "",
	disabled = false,
	required = false,
	autoComplete = "new-password",
	margin = "normal",
}) => {
	const [showPassword, setShowPassword] = useState(false);

	const handleTogglePassword = () => {
		setShowPassword(!showPassword);
	};

	return (
		<TextField
			margin={margin}
			required={required}
			fullWidth
			name={name}
			label={label}
			id={name}
			type={showPassword ? "text" : "password"}
			value={value}
			onChange={onChange}
			error={error}
			helperText={helperText}
			disabled={disabled}
			autoComplete={autoComplete}
			slotProps={{
				input: {
					endAdornment: (
						<InputAdornment position="end">							<IconButton
								aria-label="toggle password visibility"
								onClick={handleTogglePassword}
								tabIndex={-1} // Skip in tab navigation
								edge="end"
							>
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</InputAdornment>
					),
				},
			}}
		/>
	);
};

export default PasswordInput;
