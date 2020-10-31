import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../../utils/constants';
import { SET_MESSAGE } from '../../utils/actions';
import Message from '../../models/message';
import ProductRequest from '../../models/product-request';
import * as fileUtils from '../../utils/file-utils';
import { getServerTimeInMilliseconds } from '../../utils/firebase';
import {
	APPROVED,
	REJECTED,
	REQUESTED
} from '../../data/product-request-status-types';

export const addProductRequest = (values) => {
	return async (dispatch, getState) => {
		const {
			attachments,
			vendor,
			vendorSku,
			productType,
			cost,
			description
		} = values;
		const { authUser } = getState().authState;
		const newProductRequest = new ProductRequest({
			attachments: [],
			comments: [],
			cost: cost,
			description: description.trim(),
			finalSku: '',
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

export const addComment = (productRequest, values) => {
	return async (dispatch, _getState) => {
		const { body, attachments } = values;
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
			await productRequest.saveComment(
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
			await newProductRequest.saveAction(APPROVED, values.finalSku.trim());
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
			await newProductRequest.saveAction(REJECTED);
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
