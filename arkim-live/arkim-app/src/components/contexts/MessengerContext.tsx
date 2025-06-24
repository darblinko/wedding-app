import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import Messenger from "../common/Messenger";
import { InfoOutlined, ErrorOutline, WarningAmberOutlined, CheckCircleOutline } from "@mui/icons-material";
import MessengerService from "../../services/ui/messengerService";
import { Snackbar, Alert } from "@mui/material";

// Define message types
export type MessageType = "info" | "error" | "warning" | "success" | "confirm";

// Define the shape of our context
interface MessengerContextType {
	showMessage: (message: string, title?: string) => void;
	showError: (message: string, title?: string) => void;
	showWarning: (message: string, title?: string) => void;
	showSuccess: (message: string, title?: string) => void;
	showConfirm: (
		message: string,
		title?: string,
		onConfirm?: () => void,
		onCancel?: () => void,
		confirmButtonText?: string,
		cancelButtonText?: string
	) => void;
}

// Create the context
const MessengerContext = createContext<MessengerContextType | null>(null);

// Custom hook to use the Messenger context
export const useMessenger = (): MessengerContextType => {
	const context = useContext(MessengerContext);
	if (!context) {
		throw new Error("useMessenger must be used within a MessengerProvider");
	}
	return context;
};

// Props interface for the provider
interface MessengerProviderProps {
	children: ReactNode;
}

// State interface for message box data
interface MessengerState {
	open: boolean;
	message: string;
	title: string;
	type: MessageType;
	confirmAction: (() => void) | null;
	cancelAction: (() => void) | null;
	confirmButtonText: string;
	cancelButtonText: string;
}

// State interface for toast notifications
interface ToastState {
	open: boolean;
	message: string;
	severity: "info" | "success" | "warning" | "error";
}

// The provider component
export const MessengerProvider: React.FC<MessengerProviderProps> = ({ children }) => {
	// State for the message box
	const [state, setState] = useState<MessengerState>({
		open: false,
		message: "",
		title: "",
		type: "info",
		confirmAction: null,
		cancelAction: null,
		confirmButtonText: "OK",
		cancelButtonText: "Cancel",
	});

	// State for toast notifications
	const [toast, setToast] = useState<ToastState>({
		open: false,
		message: "",
		severity: "info",
	});

	// Base method to show any type of message
	const showMessageByType = (
		message: string,
		title: string | undefined,
		type: MessageType,
		confirmAction: (() => void) | null = null,
		cancelAction: (() => void) | null = null,
		confirmButtonText: string = "OK",
		cancelButtonText: string = "Cancel"
	) => {
		setState({
			open: true,
			message,
			title: title || getDefaultTitle(type),
			type,
			confirmAction,
			cancelAction,
			confirmButtonText,
			cancelButtonText,
		});
	};

	// Method to show toast notification
	const showToast = (message: string, severity: "info" | "success" | "warning" | "error") => {
		setToast({
			open: true,
			message,
			severity,
		});
	};

	// Helper to get default titles based on message type
	const getDefaultTitle = (type: MessageType): string => {
		switch (type) {
			case "info":
				return "Information";
			case "error":
				return "Error";
			case "warning":
				return "Warning";
			case "success":
				return "Success";
			case "confirm":
				return "Confirmation";
			default:
				return "Message";
		}
	};

	// Helper to get icon based on message type
	const getIconByType = () => {
		switch (state.type) {
			case "info":
				return <InfoOutlined color="info" />;
			case "error":
				return <ErrorOutline color="error" />;
			case "warning":
				return <WarningAmberOutlined color="warning" />;
			case "success":
				return <CheckCircleOutline color="success" />;
			case "confirm":
				return <WarningAmberOutlined color="warning" />;
			default:
				return <InfoOutlined color="info" />;
		}
	};

	// Public methods exposed through context
	const showMessage = (message: string, title?: string) => showMessageByType(message, title, "info");

	const showError = (message: string, title?: string) => showMessageByType(message, title, "error");

	const showWarning = (message: string, title?: string) => showMessageByType(message, title, "warning");

	const showSuccess = (message: string, title?: string) => {
		// Use toast notification for success messages
		showToast(message, "success");
	};

	const showConfirm = (
		message: string,
		title?: string,
		onConfirm?: () => void,
		onCancel?: () => void,
		confirmButtonText: string = "Confirm",
		cancelButtonText: string = "Cancel"
	) =>
		showMessageByType(
			message,
			title,
			"confirm",
			onConfirm || (() => {}),
			onCancel || (() => {}),
			confirmButtonText,
			cancelButtonText
		);

	// Close handlers
	const handleClose = () => {
		if (state.cancelAction) {
			state.cancelAction();
		}
		setState((prev) => ({ ...prev, open: false }));
	};

	const handleConfirm = () => {
		if (state.confirmAction) {
			state.confirmAction();
		}
		setState((prev) => ({ ...prev, open: false }));
	};

	// Handle toast close
	const handleToastClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === "clickaway") {
			return;
		}
		setToast((prev) => ({ ...prev, open: false }));
	};

	// Get the appropriate button color based on message type
	const getButtonColor = () => {
		switch (state.type) {
			case "error":
				return "error";
			case "warning":
				return "warning";
			case "success":
				return "success";
			case "confirm":
				return "primary";
			case "info":
			default:
				return "primary";
		}
	};

	// Register the handlers with the Messenger service once when the component mounts
	useEffect(() => {
		MessengerService.setHandlers(showMessage, showError, showWarning, showSuccess, showConfirm);
		// We're intentionally only setting these handlers once during initialization,
		// even though the functions could technically change. This prevents infinite loops.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MessengerContext.Provider
			value={{
				showMessage,
				showError,
				showWarning,
				showSuccess,
				showConfirm,
			}}
		>
			{children}
			<Messenger
				open={state.open}
				title={state.title}
				message={state.message}
				confirmButtonText={state.confirmButtonText}
				cancelButtonText={state.cancelButtonText}
				confirmButtonColor={getButtonColor()}
				onConfirm={handleConfirm}
				onCancel={handleClose}
				icon={getIconByType()}
			/>

			{/* Toast notification */}
			<Snackbar
				open={toast.open}
				autoHideDuration={4000}
				onClose={handleToastClose}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert
					onClose={handleToastClose}
					severity={toast.severity}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{toast.message}
				</Alert>
			</Snackbar>
		</MessengerContext.Provider>
	);
};

export default MessengerContext;
