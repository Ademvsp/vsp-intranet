import Vendor from '../../models/vendor';
import Message from '../../models/message';
import { SET_VENDORS, SET_MESSAGE } from '../../utils/actions';
import {
  DIALOG,
  SNACKBAR,
  SNACKBAR_SEVERITY,
  SNACKBAR_VARIANTS
} from '../../utils/constants';

let vendorsListener;

export const subscribeVendorListener = () => {
  return async (dispatch, _getState) => {
    try {
      unsubscribeVendorListener();
      vendorsListener = Vendor.getListener().onSnapshot((snapshot) => {
        const vendors = snapshot.docs.map(
          (doc) =>
            new Vendor({
              vendorId: doc.id,
              metadata: doc.data().metadata,
              name: doc.data().name
            })
        );
        dispatch({
          type: SET_VENDORS,
          vendors: vendors
        });
      });
    } catch (error) {
      console.error(error);
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

export const unsubscribeVendorListener = () => {
  if (vendorsListener) {
    vendorsListener();
  }
};

export const addExternalVendors = (values) => {
  return async (dispatch, _getState) => {
    try {
      await Vendor.saveAllExternal(values);
      const message = new Message({
        title: 'Admin Panel',
        body: 'Vendors added successfully',
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
      console.error(error);
      const message = new Message({
        title: 'Admin Panel',
        body: 'Failed to add vendors',
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
