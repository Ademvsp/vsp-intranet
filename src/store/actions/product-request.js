import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../../utils/constants';
import { SET_MESSAGE } from '../../utils/actions';
import Message from '../../models/message';
import ProductRequest from '../../models/product-request';
import Notification from '../../models/notification';
import * as fileUtils from '../../utils/file-utils';
import { transformedRecipient } from './notification';
import {
	APPROVED_PRODUCT_REQUEST,
	NEW_PRODUCT_REQUEST_ADMIN,
	NEW_PRODUCT_REQUEST_COMMENT,
	NEW_PRODUCT_REQUEST_USER,
	REJECTED_PRODUCT_REQUEST
} from '../../data/notification-types';
import { toCurrency } from '../../utils/data-transformer';
import { getServerTimeInMilliseconds } from '../../utils/firebase';
import { REQUESTED } from '../../data/product-request-status-types';

export const addProductRequest = (values, attachments) => {
	return async (dispatch, getState) => {
		const { vendor, vendorSku, productType, cost, description } = values;
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		const newProductRequest = new ProductRequest({
			productRequestId: null,
			actions: null,
			attachments: [],
			comments: [],
			cost: cost,
			description: description.trim(),
			finalSku: '',
			metadata: null,
			productType: productType.name.trim(),
			status: REQUESTED,
			user: authUser.userId,
			vendor: { ...vendor },
			vendorSku: vendorSku.trim()
		});
		try {
			await newProductRequest.save();
			if (attachments.length > 0) {
				const uploadedAttachments = await dispatch(
					fileUtils.upload({
						files: attachments,
						collection: 'product-requests',
						collectionId: newProductRequest.productRequestId,
						folder: newProductRequest.metadata.createdAt.getTime().toString()
					})
				);
				newProductRequest.attachments = uploadedAttachments;
				await newProductRequest.save();
			}
			const message = new Message({
				title: 'Product Requests',
				body: 'Product Request submitted successfully',
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
		// 		(user) => user.userId === newProductRequest.user
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
		// } catch (error) {
		// 	return true;
		// }
	};
};

export const addComment = (productRequest, body, attachments) => {
	return async (dispatch, getState) => {
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		let uploadedAttachments;
		try {
			const serverTime = await getServerTimeInMilliseconds();
			uploadedAttachments = [];
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					fileUtils.upload({
						files: attachments,
						collection: 'product-requests',
						collectionId: productRequest.productRequestId,
						folder: serverTime.toString()
					})
				);
			}
			await productRequest.addComment(
				body.trim(),
				uploadedAttachments,
				serverTime
			);
		} catch (error) {
			const message = new Message({
				title: 'Product Requests',
				body: 'Comment failed to post',
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
		// 	const admins = await ProductRequest.getAdmins();
		// 	const recipients = users.filter(
		// 		(user) =>
		// 			admins.includes(user.userId) || user.userId === productRequest.user
		// 	);
		// 	if (recipients.length > 0) {
		// 		const notifications = [];
		// 		for (const recipient of recipients) {
		// 			const senderFullName = getFullName(authUser);
		// 			const emailData = {
		// 				commentBody: body.trim(),
		// 				attachments: uploadedAttachments,
		// 				vendorSku: productRequest.vendorSku
		// 			};
		// 			const notification = new Notification({
		// 				notificationId: null,
		// 				emailData: emailData,
		// 				link: `/product-requests/${productRequest.productRequestId}`,
		// 				page: 'Product Requests',
		// 				recipient: transformedRecipient(recipient),
		// 				title: `Product Request "${productRequest.vendorSku}" New comment from ${senderFullName}`,
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
	};
};

export const approveProductRequest = (productRequest, values) => {
	return async (dispatch, getState) => {
		const { users } = getState().dataState;
		const newProductRequest = new ProductRequest({ ...productRequest });
		try {
			await newProductRequest.approve(values.finalSku.trim());
			const message = new Message({
				title: 'Product Requests',
				body: 'Product Request approved successfully',
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
				title: 'Product Requests',
				body: 'The Product Request failed to approve',
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
		// 		(user) => user.userId === newProductRequest.user
		// 	);
		// 	const emailData = {
		// 		vendorSku: newProductRequest.vendorSku,
		// 		finalSku: newProductRequest.finalSku
		// 	};
		// 	const notification = new Notification({
		// 		notificationId: null,
		// 		emailData: emailData,
		// 		link: `/product-requests/${productRequest.productRequestId}`,
		// 		page: 'Product Requests',
		// 		recipient: transformedRecipient(recipient),
		// 		title: `Product Request for "${productRequest.vendorSku}" has been approved`,
		// 		type: APPROVED_PRODUCT_REQUEST
		// 	});
		// 	await notification.save();
		// 	return true;
		// } catch (error) {
		// 	return true;
		// }
	};
};

export const rejectProductRequest = (productRequest) => {
	return async (dispatch, getState) => {
		const { users } = getState().dataState;
		const newProductRequest = new ProductRequest({ ...productRequest });
		try {
			await newProductRequest.reject();
			const message = new Message({
				title: 'Product Requests',
				body: 'Product Request rejected successfully',
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
				title: 'Product Requests',
				body: 'The Product Request failed to reject',
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
		// 		(user) => user.userId === newProductRequest.user
		// 	);
		// 	const emailData = {
		// 		vendorSku: newProductRequest.vendorSku
		// 	};
		// 	const notification = new Notification({
		// 		notificationId: null,
		// 		emailData: emailData,
		// 		link: `/product-requests/${productRequest.productRequestId}`,
		// 		page: 'Product Requests',
		// 		recipient: transformedRecipient(recipient),
		// 		title: `Product Request for "${productRequest.vendorSku}" has been rejected`,
		// 		type: REJECTED_PRODUCT_REQUEST
		// 	});
		// 	await notification.save();
		// 	return true;
		// } catch (error) {
		// 	return true;
		// }
	};
};
