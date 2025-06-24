import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Box,
	Typography,
	Button,
	Paper,
	List,
	ListItem,
	Divider,
	IconButton,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
	CircularProgress,
	Tooltip,
	Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import ApiKeyBase from "../types/apiKeys/ApiKeyBase";
import ApiKeyDetails from "../types/apiKeys/ApiKeyDetails";
import apiKeyService from "../services/api/apiKeyService";
import Messenger from "../services/ui/messengerService";

const ApiKeyManagement: React.FC = () => {
	const { t } = useTranslation();
	const [apiKeys, setApiKeys] = useState<ApiKeyBase[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Dialog states
	const [openGenerateDialog, setOpenGenerateDialog] = useState<boolean>(false);
	const [openSecretDialog, setOpenSecretDialog] = useState<boolean>(false);
	const [description, setDescription] = useState<string>("");
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [newApiKey, setNewApiKey] = useState<ApiKeyDetails | null>(null);

	// Load API keys
	const loadApiKeys = async () => {
		try {
			setLoading(true);
			setError(null);
			const keys = await apiKeyService.list("");
			setApiKeys(keys);
		} catch (err) {
			console.error("Error loading API keys:", err);
			setError(t("apiKeys.loadError"));
		} finally {
			setLoading(false);
		}
	};

	// Initial load
	useEffect(() => {
		loadApiKeys();
	}, []);

	// Handle opening the generate dialog
	const handleOpenGenerateDialog = () => {
		setDescription("");
		setOpenGenerateDialog(true);
	};

	// Handle closing the generate dialog
	const handleCloseGenerateDialog = () => {
		setOpenGenerateDialog(false);
	};

	// Handle closing the secret dialog
	const handleCloseSecretDialog = () => {
		setOpenSecretDialog(false);
	};

	// Handle form submission for creating a new API key
	const handleGenerateSubmit = async () => {
		try {
			setIsSaving(true);

			const result = await apiKeyService.generate(description);

			// Show the API key secret in a dialog
			setNewApiKey(result);
			setOpenGenerateDialog(false);
			setOpenSecretDialog(true);

			// Reset the form and refresh the list
			setDescription("");
			await loadApiKeys();
		} catch (err) {
			console.error("Error generating API key:", err);
			Messenger.error(t("apiKeys.generateError"));
		} finally {
			setIsSaving(false);
		}
	};

	// Handle toggling API key active status
	const handleToggleActive = async (apiKey: ApiKeyBase) => {
		try {
			await apiKeyService.revertActiveStatus(apiKey.accessKey);
			Messenger.success(t("apiKeys.statusToggled"));
			await loadApiKeys();
		} catch (err) {
			console.error("Error toggling API key status:", err);
			Messenger.error(t("apiKeys.statusToggleError"));
		}
	};

	// Handle deleting an API key
	const handleDelete = (apiKey: ApiKeyBase) => {
		Messenger.confirm(t("apiKeys.deleteConfirmation"), t("apiKeys.deleteTitle"), async () => {
			try {
				await apiKeyService.delete(apiKey.accessKey);
				Messenger.success(t("apiKeys.deleteSuccess"));
				await loadApiKeys();
			} catch (err) {
				console.error("Error deleting API key:", err);
				Messenger.error(t("apiKeys.deleteError"));
			}
		});
	};

	// Handle copying API key to clipboard
	const handleCopyToClipboard = (text: string, message: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => Messenger.success(message))
			.catch(() => Messenger.error(t("apiKeys.copyError")));
	};

	// Handle downloading API key as a file
	const handleDownloadAsFile = () => {
		if (!newApiKey) return;

		const data = {
			accessKey: newApiKey.accessKey,
			secret: newApiKey.secret,
			description: newApiKey.description,
			createdAt: new Date().toISOString(),
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `api-key-${newApiKey.accessKey.substring(0, 8)}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		Messenger.success(t("apiKeys.downloadSuccess"));
	};

	return (
		<Box sx={{ p: 3 }}>
			{/* Header with title and actions */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<VpnKeyIcon sx={{ mr: 2, color: "primary.main", fontSize: 32 }} />
					<Typography
						variant="h5"
						component="h1"
					>
						{t("apiKeys.title")}
					</Typography>
				</Box>

				<Box>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleOpenGenerateDialog}
						sx={{ mr: 1 }}
					>
						{t("apiKeys.generateNew")}
					</Button>
					<IconButton
						color="primary"
						onClick={loadApiKeys}
						disabled={loading}
					>
						<RefreshIcon />
					</IconButton>
				</Box>
			</Box>

			{/* Error message */}
			{error && (
				<Alert
					severity="error"
					sx={{ mb: 3 }}
				>
					{error}
				</Alert>
			)}

			{/* API Keys List */}
			<Paper sx={{ width: "100%", mb: 3 }}>
				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
						<CircularProgress />
					</Box>
				) : apiKeys.length === 0 ? (
					<Box sx={{ p: 4, textAlign: "center" }}>
						<Typography color="text.secondary">{t("apiKeys.noKeys")}</Typography>
					</Box>
				) : (
					<List>
						{apiKeys.map((apiKey, index) => (
							<React.Fragment key={apiKey.accessKey}>
								<ListItem
									sx={{ py: 2 }}
									secondaryAction={
										<Box>
											<Tooltip title={apiKey.isActive ? t("apiKeys.deactivate") : t("apiKeys.activate")}>
												<IconButton
													onClick={() => handleToggleActive(apiKey)}
													color={apiKey.isActive ? "success" : "default"}
												>
													{apiKey.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
												</IconButton>
											</Tooltip>

											<Tooltip title={t("apiKeys.copyAccessKey")}>
												<IconButton onClick={() => handleCopyToClipboard(apiKey.accessKey, t("apiKeys.accessKeyCopied"))}>
													<ContentCopyIcon />
												</IconButton>
											</Tooltip>

											<Tooltip title={t("apiKeys.delete")}>
												<IconButton
													onClick={() => handleDelete(apiKey)}
													color="error"
												>
													<DeleteIcon />
												</IconButton>
											</Tooltip>
										</Box>
									}
								>
									<Box sx={{ width: "100%" }}>
										<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
											<Typography
												variant="h6"
												component="div"
												sx={{ flexGrow: 1 }}
											>
												{apiKey.accessKey}
												<Chip
													size="small"
													label={apiKey.isActive ? t("apiKeys.active") : t("apiKeys.inactive")}
													color={apiKey.isActive ? "success" : "default"}
													sx={{ ml: 2 }}
												/>
											</Typography>
										</Box>

										<Typography
											variant="body1"
											color="text.secondary"
										>
											{apiKey.description || t("apiKeys.noDescription")}
										</Typography>

										<Typography
											variant="caption"
											color="text.secondary"
										>
											{t("apiKeys.createdAt")}:{" "}
											{apiKey.createdAtUtc ? new Date(apiKey.createdAtUtc).toLocaleString() : t("apiKeys.unknown")}
										</Typography>
									</Box>
								</ListItem>
								{index < apiKeys.length - 1 && <Divider />}
							</React.Fragment>
						))}
					</List>
				)}
			</Paper>

			{/* Description Input Dialog */}
			<Dialog
				open={openGenerateDialog}
				onClose={handleCloseGenerateDialog}
			>
				<DialogTitle>{t("apiKeys.generateNew")}</DialogTitle>
				<DialogContent>
					<DialogContentText>{t("apiKeys.enterDescription")}</DialogContentText>
					<TextField
						autoFocus
						margin="dense"
						label={t("apiKeys.description")}
						fullWidth
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						variant="outlined"
						disabled={isSaving}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseGenerateDialog}
						disabled={isSaving}
					>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={handleGenerateSubmit}
						variant="contained"
						disabled={isSaving}
						startIcon={isSaving ? <CircularProgress size={20} /> : null}
					>
						{isSaving ? t("common.generating") : t("common.generate")}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Secret Key Display Dialog */}
			<Dialog
				open={openSecretDialog}
				onClose={handleCloseSecretDialog}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>{t("apiKeys.newApiKeyCreated")}</DialogTitle>
				<DialogContent>
					<DialogContentText
						color="warning.main"
						sx={{ mb: 2 }}
					>
						{t("apiKeys.secretWarning")}
					</DialogContentText>

					<Box sx={{ mb: 3 }}>
						<Typography
							variant="subtitle1"
							gutterBottom
						>
							{t("apiKeys.accessKey")}:
						</Typography>
						<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
							<TextField
								fullWidth
								variant="outlined"
								value={newApiKey?.accessKey || ""}
								InputProps={{ readOnly: true }}
								size="small"
							/>
							<Tooltip title={t("apiKeys.copyAccessKey")}>
								<IconButton onClick={() => handleCopyToClipboard(newApiKey?.accessKey || "", t("apiKeys.accessKeyCopied"))}>
									<ContentCopyIcon />
								</IconButton>
							</Tooltip>
						</Box>

						<Typography
							variant="subtitle1"
							gutterBottom
						>
							{t("apiKeys.secret")}:
						</Typography>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<TextField
								fullWidth
								variant="outlined"
								value={newApiKey?.secret || ""}
								InputProps={{ readOnly: true }}
								size="small"
							/>
							<Tooltip title={t("apiKeys.copySecret")}>
								<IconButton onClick={() => handleCopyToClipboard(newApiKey?.secret || "", t("apiKeys.secretCopied"))}>
									<ContentCopyIcon />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>

					<Box sx={{ display: "flex", justifyContent: "center" }}>
						<Button
							variant="outlined"
							startIcon={<DownloadIcon />}
							onClick={handleDownloadAsFile}
						>
							{t("apiKeys.downloadAsFile")}
						</Button>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseSecretDialog}
						color="primary"
					>
						{t("common.close")}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ApiKeyManagement;
