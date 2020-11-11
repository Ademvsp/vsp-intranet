import {
  DIALOG,
  SNACKBAR,
  SNACKBAR_SEVERITY,
  SNACKBAR_VARIANTS
} from '../../utils/constants';
import { SET_MESSAGE } from '../../utils/actions';
import Message from '../../models/message';
import Permission from '../../models/permission';

export const getPermissions = () => {
  return async (dispatch, _getState) => {
    try {
      const permissions = await Permission.getAll();
      return permissions;
    } catch (error) {
      console.error(error);
      const message = new Message({
        title: 'Admin Panel',
        body: 'Failed to retrieve permissions',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
    }
  };
};

export const setPermissions = (collection, group, members) => {
  return async (dispatch, _getState) => {
    try {
      await Permission.set(collection, group, members);
      const message = new Message({
        title: 'Admin Panel',
        body: 'Permission set successfully',
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
        body: 'Failed to write permissions',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
    }
  };
};
