import Customer from '../../models/customer';
import Message from '../../models/message';
import { SET_CUSTOMERS, SET_MESSAGE } from '../../utils/actions';
import { SNACKBAR } from '../../utils/constants';

let customersListener;

export const subscribeCustomerListener = () => {
	return async (dispatch, _getState) => {
		try {
			unsubscribeCustomerListener();
			customersListener = Customer.getListener().onSnapshot((snapshot) => {
				const customers = snapshot.docs.map(
					(doc) =>
						new Customer({
							customerId: doc.id,
							metadata: doc.data().metadata,
							name: doc.data().name
						})
				);
				dispatch({
					type: SET_CUSTOMERS,
					customers: customers
				});
			});
		} catch (error) {
			const message = new Message({
				title: 'Customers',
				body: 'Failed to retrieve customers',
				feedback: SNACKBAR
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const unsubscribeCustomerListener = () => {
	if (customersListener) {
		customersListener();
	}
};
