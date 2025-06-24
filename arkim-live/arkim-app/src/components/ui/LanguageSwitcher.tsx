import React from "react";
import { Box, FormControl, Select, MenuItem, Typography, SelectChangeEvent } from "@mui/material";
import { getAvailableLanguages, getUserLanguage } from "../../i18n/i18nUtils";

interface LanguageSwitcherProps {
	language: string | undefined;
	disabled?: boolean;
	width?: string;
	onLanguageChange: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props: LanguageSwitcherProps) => {
	// Available languages with their flags
	const languages = getAvailableLanguages();
	const userLanguage = getUserLanguage();

	const handleLanguageChange = (event: SelectChangeEvent<string>) => {
		const languageCode = event.target.value;
		props.onLanguageChange(languageCode);
	};

	return (
		<FormControl sx={{ minWidth: 120, width: props.width ?? "100%" }}>
			<Select
				disabled={props.disabled || false}
				value={props.language || userLanguage}
				onChange={handleLanguageChange}
				sx={{
					"& .MuiSelect-select": {
						display: "flex",
						alignItems: "center",
						gap: 1,
						py: 0.5,
					},
				}}
			>
				{languages.map((language) => (
					<MenuItem
						key={language.code}
						value={language.code}
					>
						<Box
							display="flex"
							alignItems="center"
							gap={1}
						>
							<Typography
								variant="body2"
								component="span"
								fontSize="1.2rem"
							>
								{language.flag}
							</Typography>
							<Typography
								variant="body2"
								component="span"
							>
								{language.name}
							</Typography>
						</Box>
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default LanguageSwitcher;
