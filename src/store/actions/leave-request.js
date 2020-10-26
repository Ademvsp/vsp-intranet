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
	// return async (dispatch, getState) => {
	// 	const { authUser } = getState().authState;
	// 	const { users } = getState().dataState;
	// 	let uploadedAttachments;
	// 	try {
	// 		const serverTime = await getServerTimeInMilliseconds();
	// 		uploadedAttachments = [];
	// 		if (attachments.length > 0) {
	// 			uploadedAttachments = await dispatch(
	// 				fileUtils.upload({
	// 					files: attachments,
	// 					collection: 'product-requests',
	// 					collectionId: leaveRequest.leaveRequestId,
	// 					folder: serverTime.toString()
	// 				})
	// 			);
	// 		}
	// 		await leaveRequest.addComment(
	// 			body.trim(),
	// 			uploadedAttachments,
	// 			serverTime
	// 		);
	// 	} catch (error) {
	// 		const message = new Message({
	// 			title: 'Leave Requests',
	// 			body: 'Comment failed to post',
	// 			feedback: DIALOG
	// 		});
	// 		dispatch({
	// 			type: SET_MESSAGE,
	// 			message
	// 		});
	// 		return false;
	// 	}
	//Send notification, do nothing if this fails so no error is thrown
	// try {
	// 	const admins = await LeaveRequest.getAdmins();
	// 	const recipients = users.filter(
	// 		(user) =>
	// 			admins.includes(user.userId) || user.userId === leaveRequest.user
	// 	);
	// 	if (recipients.length > 0) {
	// 		const notifications = [];
	// 		for (const recipient of recipients) {
	// 			const senderFullName = getFullName(authUser);
	// 			const emailData = {
	// 				commentBody: body.trim(),
	// 				attachments: uploadedAttachments,
	// 				vendorSku: leaveRequest.vendorSku
	// 			};
	// 			const notification = new Notification({
	// 				notificationId: null,
	// 				emailData: emailData,
	// 				link: `/product-requests/${leaveRequest.leaveRequestId}`,
	// 				page: 'Leave Requests',
	// 				recipient: transformedRecipient(recipient),
	// 				title: `Leave Request "${leaveRequest.vendorSku}" New comment from ${senderFullName}`,
	// 				type: NEW_PRODUCT_REQUEST_COMMENT
	// 			});
	// 			notifications.push(notification);
	// 		}
	// 		await Notification.saveAll(notifications);
	// 	}
	// 	return true;
	// } catch (error) {
	// 	return true;
	// }
	// };
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
			console.log(error);
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
		//Send notification, do nothing if this fails so no error is thrown
		// try {
		// 	const recipient = users.find(
		// 		(user) => user.userId === newLeaveRequest.user
		// 	);
		// 	const emailData = {
		// 		vendorSku: newLeaveRequest.vendorSku
		// 	};
		// 	const notification = new Notification({
		// 		notificationId: null,
		// 		emailData: emailData,
		// 		link: `/product-requests/${leaveRequest.leaveRequestId}`,
		// 		page: 'Leave Requests',
		// 		recipient: transformedRecipient(recipient),
		// 		title: `Leave Request for "${leaveRequest.vendorSku}" has been rejected`,
		// 		type: REJECTED_PRODUCT_REQUEST
		// 	});
		// 	await notification.save();
		// 	return true;
		// } catch (error) {
		// 	return true;
		// }
	};
};
