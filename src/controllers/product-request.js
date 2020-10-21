import { DIALOG } from '../utils/constants';
import { SET_MESSAGE } from '../utils/actions';
import Message from '../models/message';
import ProductRequest from '../models/product-request';
import CollectionData from '../models/collection-data';

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

export const isAdmin = () => {
	return async (dispatch, getState) => {
		try {
			const userId = getState().authState.authUser.userId;
			return await ProductRequest.isAdmin(userId);
		} catch (error) {
			console.log('error', error);
			const message = new Message({
				title: 'Product Requests',
				body: 'Failed to retrieve admin permissions',
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
	return CollectionData.getListener('product-requests');
};

export const getListener = (productRequestId) => {
	return ProductRequest.getListener(productRequestId);
};
