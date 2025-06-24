import LanguageDetector from "i18next-browser-languagedetector";

export interface Language {
	code: string;
	name: string;
	flag: string;
}

export const getUserLanguage = (): string => {
	const detector = new LanguageDetector();
	const language = detector.detect();
	if (!language) {
		return "en";
	}
	// We don't support locales, get the language code only
	let languageCode = language instanceof Array ? language[0] : language;
	return languageCode.split("-")[0];
};

export const getAvailableLanguages = (): Language[] => {
	const languages = [
		{
			code: "en",
			name: "English",
			flag: "🇺🇸",
		},
		{
			code: "es",
			name: "Español",
			flag: "🇪🇸",
		},
	];
	return languages;
};
