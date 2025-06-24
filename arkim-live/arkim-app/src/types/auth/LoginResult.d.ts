import OperationResult from "../api/OperationResult";
import UserContextDetails from "../user/UserContextDetails";

export default interface LoginResult extends OperationResult {
	sessionId: string;
	context: UserContextDetails;
}
