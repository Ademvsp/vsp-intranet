import AuthUser from '../../models/auth-user';
import CollectionData from '../../models/collection-data';
import LeaveRequest from '../../models/leave-request';
import Message from '../../models/message';
import { SET_MESSAGE } from '../../utils/actions';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../../utils/constants';
import { transformDate } from '../../utils/date';

export const getCollectionDataListener = async () => {
	const isAdmin = await LeaveRequest.isAdmin();
	if (isAdmin) {
		return CollectionData.getListener('leave-requests');
	} else {
		return CollectionData.getNestedListener({
			document: 'leave-requests',
			subCollection: 'users',
			subCollectionDoc: AuthUser.userId
		});
	}
};

export const getListener = (leaveRequestId) => {
	return LeaveRequest.getListener(leaveRequestId);
};

export const addLeaveRequest = (values) => {
	return async (dispatch, getState) => {
		const { start, end, type, reason } = values;
		const { authUser } = getState().authState;
		const { locations } = getState().dataState;

		const userLocation = locations.find(
			(location) => location.locationId === authUser.location
		);
		let startTransformed = transformDate(start, true, userLocation.timezone);
		let endTransformed = transformDate(end, true, userLocation.timezone);

		const newLeaveRequest = new LeaveRequest({
			leaveRequestId: null,
			actions: null,
			comments: [],
			end: endTransformed,
			manager: authUser.manager,
			metadata: null,
			reason: reason.trim(),
			start: startTransformed,
			type: type.name,
			user: authUser.userId
		});

		try {
			await newLeaveRequest.save();
			const message = new Message({
				title: 'Product Requests',
				body: 'Product Request submitted successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return true;
		} catch (error) {
			const message = new Message({
				title: 'Product Requests',
				body: 'Failed to submit Product Request',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
};
