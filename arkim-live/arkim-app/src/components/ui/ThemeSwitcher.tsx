import React from "react";
import { useTranslation } from "react-i18next";
import { 
  Box, 
  FormControl, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  Typography 
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ThemeMode } from "../contexts/ThemeContext";

interface ThemeSwitcherProps {
  themeMode: ThemeMode;
  disabled?: boolean;
  onThemeChange: (theme: ThemeMode) => void;
}

interface ThemeOption {
  id: ThemeMode;
  name: string;
  icon: React.ReactNode;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ themeMode, disabled, onThemeChange }) => {
  const { t } = useTranslation();

  // Theme options
  const themeOptions: ThemeOption[] = [
    {
      id: "light",
      name: t("layout.preferences.theme.light"),
      icon: <LightModeIcon />,
    },
    {
      id: "dark",
      name: t("layout.preferences.theme.dark"),
      icon: <DarkModeIcon />,
    },
  ];

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.value as ThemeMode;
    onThemeChange(newTheme);
  };

  return (
    <FormControl component="fieldset" sx={{ width: "100%" }}>
      <RadioGroup
        name="theme-options"
        value={themeMode}
        onChange={handleThemeChange}
      >
        {themeOptions.map((option) => (
          <FormControlLabel
            disabled={disabled}
            key={option.id}
            value={option.id}
            control={<Radio color="primary" />}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>{option.icon}</Box>
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            }
            sx={{ py: 0.5 }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default ThemeSwitcher;