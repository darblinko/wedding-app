// Local storage keys
const SESSION_ID_KEY = "arkimSessionId";

// Create a function to get the current session ID
export const getSessionId: () => string | null = () => {
	return localStorage.getItem(SESSION_ID_KEY) || sessionStorage.getItem(SESSION_ID_KEY) || null;
};

// Function to set the session ID provider from components
export const setSessionId = (session: string, longLasting: boolean = false) => {
	if (longLasting) {
		localStorage.setItem(SESSION_ID_KEY, session);
	} else {
		sessionStorage.setItem(SESSION_ID_KEY, session);
	}
};

// Clear session from storage
export const clearSession = () => {
	localStorage.removeItem(SESSION_ID_KEY);
	sessionStorage.removeItem(SESSION_ID_KEY);
};
