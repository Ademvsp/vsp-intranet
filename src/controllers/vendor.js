import Vendor from '../models/vendor';
import Message from '../models/message';
import { SET_VENDORS, SET_MESSAGE } from '../utils/actions';
import { SNACKBAR } from '../utils/constants';

let vendorsListener;

export const subscribeVendorListener = () => {
	return async (dispatch, _getState) => {
		try {
			unsubscribeVendorListener();
			vendorsListener = Vendor.getListener().onSnapshot((snapshot) => {
				console.log(snapshot);
				const vendors = snapshot.docs.map(
					(doc) => new Vendor({ vendorId: doc.id, name: doc.data().name })
				);
				dispatch({
					type: SET_VENDORS,
					vendors: vendors
				});
			});
		} catch (error) {
			const message = new Message({
				title: 'Vendors',
				body: 'Failed to retrieve vendors',
				feedback: SNACKBAR
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const createVendor = async (name) => {
	const vendor = new Vendor({ vendorId: null, name: name });
	await vendor.save();
	return vendor;
};

export const unsubscribeVendorListener = () => {
	if (vendorsListener) {
		vendorsListener();
	}
};
