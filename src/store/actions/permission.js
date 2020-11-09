import { DIALOG } from '../../utils/constants';
import { SET_MESSAGE } from '../../utils/actions';
import Message from '../../models/message';
import Permission from '../../models/permission';

export const getPermissions = () => {
  return async (dispatch, _getState) => {
    try {
      const permissions = await Permission.getAll();
      return permissions;
    } catch (error) {
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
      const result = await Permission.set(collection, group, members);
      return result;
    } catch (error) {
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
