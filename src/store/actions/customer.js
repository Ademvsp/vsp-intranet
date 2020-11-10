import Customer from '../../models/customer';
import Message from '../../models/message';
import { SET_CUSTOMERS, SET_MESSAGE } from '../../utils/actions';
import {
  DIALOG,
  SNACKBAR,
  SNACKBAR_SEVERITY,
  SNACKBAR_VARIANTS
} from '../../utils/constants';

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

export const addExternalCustomers = (values) => {
  return async (dispatch, _getState) => {
    try {
      await Customer.saveAllExternal(values);
      const message = new Message({
        title: 'Admin Panel',
        body: 'Customers added successfully',
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
        title: 'Admin Panel',
        body: 'Failed to add Customers',
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
