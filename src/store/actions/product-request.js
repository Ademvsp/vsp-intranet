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

export const addComment = (productRequest, body, attachments) => {
	return async (dispatch, _getState) => {
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
			return true;
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
	};
};

export const approveProductRequest = (productRequest, values) => {
	return async (dispatch, _getState) => {
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
			return true;
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
	};
};

export const rejectProductRequest = (productRequest) => {
	return async (dispatch, _getState) => {
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
			return true;
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
	};
};
