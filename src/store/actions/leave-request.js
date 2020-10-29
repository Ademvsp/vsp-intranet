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
import { upload } from '../../utils/file-utils';
import { getServerTimeInMilliseconds } from '../../utils/firebase';

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
				title: 'Leave Requests',
				body: 'Leave Request submitted successfully',
				feedback: SNACKBAR,
				options: {
					duration: 5000,
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
				title: 'Leave Requests',
				body: 'Failed to submit Leave Request',
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

export const addComment = (leaveRequest, body, attachments) => {
	return async (dispatch, getState) => {
		let uploadedAttachments;
		try {
			const serverTime = await getServerTimeInMilliseconds();
			uploadedAttachments = [];
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					upload({
						files: attachments,
						collection: 'leave-requests',
						collectionId: leaveRequest.leaveRequestId,
						folder: serverTime.toString()
					})
				);
			}
			await leaveRequest.addComment(
				body.trim(),
				uploadedAttachments,
				serverTime
			);
			return true;
		} catch (error) {
			const message = new Message({
				title: 'Leave Requests',
				body: 'Comment failed to post',
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

export const approveLeaveRequest = (leaveRequest) => {
	return async (dispatch, _getState) => {
		const newLeaveRequest = new LeaveRequest({ ...leaveRequest });
		try {
			await newLeaveRequest.approve();
			const message = new Message({
				title: 'Leave Requests',
				body: 'Leave Request approved successfully',
				feedback: SNACKBAR,
				options: {
					duration: 5000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message({
				title: 'Leave Requests',
				body: 'The Leave Request failed to approve',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const rejectLeaveRequest = (leaveRequest) => {
	return async (dispatch, _getState) => {
		const newLeaveRequest = new LeaveRequest({ ...leaveRequest });
		try {
			await newLeaveRequest.reject();
			const message = new Message({
				title: 'Leave Requests',
				body: 'Leave Request rejected successfully',
				feedback: SNACKBAR,
				options: {
					duration: 5000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message({
				title: 'Leave Requests',
				body: 'The Leave Request failed to reject',
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
