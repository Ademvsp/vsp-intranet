import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../utils/constants';
import { SET_MESSAGE } from '../utils/actions';
import Message from '../models/message';
import ProductRequest from '../models/product-request';
import CollectionData from '../models/collection-data';
import Notification from '../models/notification';
import { statusNames } from '../data/product-request-status-types';
import * as fileUtils from '../utils/file-utils';
import { transformedRecipient } from './notification';
import {
	NEW_PRODUCT_REQUEST_ADMIN,
	NEW_PRODUCT_REQUEST_USER
} from '../data/notification-types';
import { toCurrency } from '../utils/data-transformer';
import { getFullName } from './user';

export const addProductRequest = (values, attachments) => {
	return async (dispatch, getState) => {
		const { vendor, vendorSku, productType, cost, description } = values;
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		let newProductRequest;
		try {
			newProductRequest = new ProductRequest({
				productRequestId: null,
				action: {
					actionType: statusNames.REQUESTED,
					actionedAt: null,
					actionedBy: null
				},
				attachments: [],
				comments: [],
				cost: cost,
				description: description.trim(),
				finalSku: '',
				metadata: null,
				productType: productType.name.trim(),
				status: statusNames.REQUESTED,
				user: authUser.userId,
				vendor: { ...vendor },
				vendorSku: vendorSku.trim()
			});
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
			console.log(error);
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
		try {
			//Send email to user that submitted the form
			let senderFullName = getFullName(authUser);
			const notifications = [];
			let recipient = users.find(
				(user) => user.userId === newProductRequest.user
			);
			let emailData = {
				attachments: newProductRequest.attachments,
				vendor: newProductRequest.vendor.name,
				vendorSku: newProductRequest.vendorSku,
				productType: newProductRequest.productType,
				cost: toCurrency(newProductRequest.cost),
				description: newProductRequest.description
			};
			const notification = new Notification({
				emailData: emailData,
				link: `/product-requests/${newProductRequest.productRequestId}`,
				page: 'Product Requests',
				recipient: transformedRecipient(recipient),
				title: `Your Product Request for "${vendorSku.trim()}" has been submitted successfully`,
				type: NEW_PRODUCT_REQUEST_USER
			});
			notifications.push(notification);
			//Send emails to all admins responsible for approving or rejecting
			const admins = await ProductRequest.getAdmins();
			const recipients = users.filter((user) => admins.includes(user.userId));
			if (recipients.length > 0) {
				for (const recipient of recipients) {
					const emailData = {
						attachments: newProductRequest.attachments,
						vendor: newProductRequest.vendor.name,
						vendorSku: newProductRequest.vendorSku,
						productType: newProductRequest.productType,
						cost: toCurrency(newProductRequest.cost),
						description: newProductRequest.description
					};
					const notification = new Notification({
						emailData: emailData,
						link: `/product-requests/${newProductRequest.productRequestId}`,
						page: 'Product Requests',
						recipient: transformedRecipient(recipient),
						title: `New Product Request submitted by ${senderFullName} for "${newProductRequest.vendorSku}"`,
						type: NEW_PRODUCT_REQUEST_ADMIN
					});
					notifications.push(notification);
				}
				console.log(notifications);
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const getProductRequests = (all) => {
	return async (dispatch, getState) => {
		try {
			let productRequests;
			if (all) {
				productRequests = await ProductRequest.get();
			} else {
				const userId = getState().authState.authUser.userId;
				productRequests = await ProductRequest.get(userId);
			}
			return productRequests;
		} catch (error) {
			const message = new Message({
				title: 'Product Requests',
				body: 'Failed to retrieve product requests',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const getCollectionDataListener = async (userId) => {
	const isAdmin = await ProductRequest.isAdmin(userId);
	if (isAdmin) {
		return CollectionData.getListener('product-requests');
	} else {
		return CollectionData.getNestedListener(
			'product-requests',
			'users',
			userId
		);
	}
};

export const getListener = (productRequestId) => {
	return ProductRequest.getListener(productRequestId);
};
