import UserDetails from './UserDetails.d.ts';

export default interface UserContextDetails {
	user: UserDetails;
	companyName: string;
	defaultLanguage: string;
	defaultTheme: string;
	useMetricSystem: boolean;
}
