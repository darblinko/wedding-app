import { ReactNode, useState, useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	Divider,
	IconButton,
	CircularProgress,
	Tooltip,
	Button,
	TextField,
	FormControlLabel,
	Switch,
	InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export interface MasterDetailsProps<TListItem extends object> {
	// Display props
	title: string;
	icon?: ReactNode;

	// List props
	filterInactive?: boolean;
	listItems: (search: string, showInactive: boolean) => Promise<TListItem[]>;
	renderListItem: (item: TListItem, isSelected: boolean) => ReactNode;

	// Details props
	idPropName: string;
	detailsPageComponent: (listItem: TListItem | undefined, refreshList: () => Promise<void>) => ReactNode;
}

/**
 * Generic master-details view component that can be used for any master data management.
 * It displays a list of items on the left side and details on the right side.
 */
function MasterDetailsView<TListItem extends object>(props: MasterDetailsProps<TListItem>) {
	// State
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<TListItem[]>([]);
	const [selectedItem, setSelectedItem] = useState<TListItem | undefined>(undefined);
	const [showPlaceholder, setShowPlaceholder] = useState(true);
	const [searchText, setSearchText] = useState("");
	const [debouncedSearchText, setDebouncedSearchText] = useState("");
	const [showInactive, setShowInactive] = useState(false);

	// Debounce search text changes
	useEffect(() => {
		// Don't debounce when clearing text
		if (searchText === "" && debouncedSearchText !== "") {
			setDebouncedSearchText("");
			return;
		}

		const timerId = setTimeout(() => {
			setDebouncedSearchText(searchText);
		}, 1000); // 1 second delay for API calls

		return () => {
			clearTimeout(timerId);
		};
	}, [searchText, debouncedSearchText]);

	// Load items on component mount and when debounced search parameters change
	useEffect(() => {
		loadItems();
	}, [debouncedSearchText, showInactive]);

	// Load items from API
	const loadItems = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await props.listItems(debouncedSearchText, showInactive);
			setItems(result);
		} catch (err) {
			setError("Failed to load items. Please try again.");
			console.error("Error loading items:", err);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle refresh button click
	const handleRefresh = () => {
		loadItems();
		// Rerender details view if an item is selected
		if (selectedItem) {
			setSelectedItem((prev) => (prev ? { ...prev } : undefined));
		}
	};

	// Handle new button click
	const handleNewClick = () => {
		setSelectedItem(undefined);
		setShowPlaceholder(false);
	};

	// Handle item selection
	const handleSelectItem = (item: TListItem) => {
		setSelectedItem(item);
		setShowPlaceholder(false);
	};

	// Handle search text change - this updates local state immediately but API call is debounced
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	// Handle clear search text
	const handleClearSearch = () => {
		setSearchText("");
		// Immediately update the debounced search text to trigger the list refresh
		setDebouncedSearchText("");
	};

	// Handle show inactive toggle
	const handleShowInactiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setShowInactive(e.target.checked);
	};

	return (
		<Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
			{/* Left panel - Master list */}
			<Paper
				sx={{
					width: 320,
					display: "flex",
					flexDirection: "column",
					mr: 2,
					overflow: "hidden",
					borderRadius: 1,
				}}
			>
				{/* List header */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: 2,
						bgcolor: "background.paper",
						borderBottom: 1,
						borderColor: "divider",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						{props.icon && <Box sx={{ mr: 1 }}>{props.icon}</Box>}
						<Typography variant="h6">{props.title}</Typography>
					</Box>
					<Box>
						<Tooltip title="Add new">
							<IconButton
								onClick={handleNewClick}
								size="small"
							>
								<AddIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Refresh">
							<IconButton
								onClick={handleRefresh}
								size="small"
								disabled={isLoading}
							>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Box>
				</Box>

				{/* Search controls */}
				<Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
					<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
						<TextField
							size="small"
							placeholder="Search..."
							fullWidth
							value={searchText}
							onChange={handleSearchChange}
							slotProps={{
								input: {
									startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
									endAdornment: searchText ? (
										<InputAdornment position="end">
											<IconButton
												aria-label="clear search"
												onClick={handleClearSearch}
												edge="end"
												size="small"
											>
												<ClearIcon fontSize="small" />
											</IconButton>
										</InputAdornment>
									) : null,
								},
							}}
						/>
					</Box>
					{props.filterInactive && <FormControlLabel
						control={
							<Switch
								checked={showInactive}
								onChange={handleShowInactiveChange}
								size="small"
							/>
						}
						label="Show inactive"
					/>}
				</Box>

				{/* List content */}
				<Box
					sx={{
						flex: 1,
						overflow: "auto",
						bgcolor: "background.default",
					}}
				>
					{isLoading && items.length === 0 ? (
						<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
							<CircularProgress size={40} />
						</Box>
					) : error ? (
						<Box sx={{ p: 2, color: "error.main" }}>
							<Typography variant="body2">{error}</Typography>
							<Button
								size="small"
								onClick={handleRefresh}
								sx={{ mt: 1 }}
							>
								Retry
							</Button>
						</Box>
					) : items.length === 0 ? (
						<Box sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
							<Typography variant="body2">No items found</Typography>
						</Box>
					) : (
						<Box>
							{/* List items */}
							{items.map((item) => {
								const itemId = (item as any)[props.idPropName];
								const isSelected = (selectedItem ?? false) && (selectedItem as any)[props.idPropName] === itemId;
								return (
									<Box
										key={itemId}
										onClick={() => handleSelectItem(item)}
										sx={{ cursor: "pointer" }}
									>
										{props.renderListItem(item, isSelected)}
										<Divider />
									</Box>
								);
							})}
						</Box>
					)}
				</Box>
			</Paper>

			{/* Right panel - Details */}
			<Paper
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					borderRadius: 1,
					position: "relative",
				}}
			>
				{/* Details content */}
				<Box
					sx={{
						flex: 1,
						overflow: "auto",
						p: 2,
					}}
				>
					{showPlaceholder ? (
						<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
							<Typography
								variant="body1"
								color="text.secondary"
							>
								Select an item from the list or click the add button to create a new one
							</Typography>
						</Box>
					) : (
						props.detailsPageComponent(selectedItem, loadItems)
					)}
				</Box>
			</Paper>
		</Box>
	);
}

export default MasterDetailsView;
