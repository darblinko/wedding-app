import React, { createContext, useContext, useState, ReactNode } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";

// Define theme types
export type ThemeMode = "light" | "dark";

// Context interface
interface ThemeContextType {
	themeMode: ThemeMode;
	setThemeMode: (mode: ThemeMode) => void;
	isDarkMode: boolean;
	toggleTheme: () => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType | null>(null);

// Custom hook to use the ThemeContext
export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

// Props interface for the provider
interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultTheme = "light" }) => {
	// Initialize theme from localStorage or default
	const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
		return defaultTheme;
	});

	// Toggle between light and dark theme
	const toggleTheme = () => {
		setThemeModeState(themeMode === "light" ? "dark" : "light");
	};

	// Create theme based on mode
	const theme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: themeMode,
					// Add your custom theme colors here
					primary: {
						main: "#3b82f6", // blue-500
					},
					secondary: {
						main: "#10b981", // emerald-500
					},
					background: {
						default: themeMode === "dark" ? "#1f2937" : "#f9fafb", // gray-800 : gray-50
						paper: themeMode === "dark" ? "#374151" : "#ffffff", // gray-700 : white
					},
					text: {
						primary: themeMode === "dark" ? "#f9fafb" : "#1f2937", // gray-50 : gray-800
						secondary: themeMode === "dark" ? "#d1d5db" : "#6b7280", // gray-300 : gray-500
					},
				},
				// Add other theme customizations as needed
			}),
		[themeMode]
	);

	return (
		<ThemeContext.Provider
			value={{
				themeMode,
				setThemeMode: setThemeModeState,
				isDarkMode: themeMode === "dark",
				toggleTheme,
			}}
		>
			<MuiThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		</ThemeContext.Provider>
	);
};

export default ThemeContext;
