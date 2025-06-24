import UserBase from './UserBase';

export default interface UserDetails extends UserBase {
	password?: string;
	language?: string;
	theme?: string;
	defaultLocation?: string;
	assignedLocations?: string[];
}
