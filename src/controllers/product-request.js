import { DIALOG } from '../utils/constants';
import { SET_MESSAGE, SET_LOCATIONS } from '../utils/actions';
import Message from '../models/message';
import ProductRequest from '../models/product-request';
import Metadata from '../models/metadata';

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
			console.log('error', error);
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

export const getMetadataListener = () => {
	return Metadata.getListener('product-requests');
};

export const getListener = (productRequestId) => {
	return ProductRequest.getListener(productRequestId);
};
