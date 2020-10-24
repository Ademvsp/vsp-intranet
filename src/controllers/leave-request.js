import AuthUser from '../models/auth-user';
import CollectionData from '../models/collection-data';
import LeaveRequest from '../models/leave-request';
import { SET_MESSAGE } from '../utils/actions';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../utils/constants';
import { transformDate } from '../utils/date';
import { getFullName } from './user';

export const getIsAdmin = async () => {
	return await LeaveRequest.isAdmin();
};

export const getCollectionDataListener = async () => {
	const isAdmin = await getIsAdmin();
	if (isAdmin) {
		return CollectionData.getListener('leave-requests');
	} else {
		return CollectionData.getNestedListener(
			'leave-requests',
			'users',
			AuthUser.getUserId()
		);
	}
};

export const getListener = (leaveRequestId) => {
	return LeaveRequest.getListener(leaveRequestId);
};

export const addLeaveRequest = (values) => {
	return async (dispatch, getState) => {
		const { start, end, type, reason } = values;
		const { authUser } = getState().authState;
		const { users, locations } = getState().dataState;

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
		//Send notification, do nothing if this fails so no error is thrown
		// try {
		// 	//Send email to user that submitted the form
		// 	let senderFullName = getFullName(authUser);
		// 	const notifications = [];
		// 	let recipient = users.find(
		// 		(user) => user.userId === newLeaveRequest.user
		// 	);
		// 	let emailData = {
		// 		attachments: newProductRequest.attachments,
		// 		vendor: newProductRequest.vendor.name,
		// 		vendorSku: newProductRequest.vendorSku,
		// 		productType: newProductRequest.productType,
		// 		cost: toCurrency(newProductRequest.cost),
		// 		description: newProductRequest.description
		// 	};
		// 	const notification = new Notification({
		// 		emailData: emailData,
		// 		link: `/product-requests/${newProductRequest.productRequestId}`,
		// 		page: 'Product Requests',
		// 		recipient: transformedRecipient(recipient),
		// 		title: `Your Product Request for "${vendorSku.trim()}" has been submitted successfully`,
		// 		type: NEW_PRODUCT_REQUEST_USER
		// 	});
		// 	notifications.push(notification);
		// 	//Send emails to all admins responsible for approving or rejecting
		// 	const admins = await ProductRequest.getAdmins();
		// 	const recipients = users.filter((user) => admins.includes(user.userId));
		// 	if (recipients.length > 0) {
		// 		for (const recipient of recipients) {
		// 			const emailData = {
		// 				attachments: newProductRequest.attachments,
		// 				vendor: newProductRequest.vendor.name,
		// 				vendorSku: newProductRequest.vendorSku,
		// 				productType: newProductRequest.productType,
		// 				cost: toCurrency(newProductRequest.cost),
		// 				description: newProductRequest.description
		// 			};
		// 			const notification = new Notification({
		// 				emailData: emailData,
		// 				link: `/product-requests/${newProductRequest.productRequestId}`,
		// 				page: 'Product Requests',
		// 				recipient: transformedRecipient(recipient),
		// 				title: `New Product Request submitted by ${senderFullName} for "${newProductRequest.vendorSku}"`,
		// 				type: NEW_PRODUCT_REQUEST_ADMIN
		// 			});
		// 			notifications.push(notification);
		// 		}
		// 		await Notification.saveAll(notifications);
		// 	}
		// 	return true;
		} catch (error) {
			return true;
		}
	};
};
