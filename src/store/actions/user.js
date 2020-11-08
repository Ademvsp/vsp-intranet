import {
  DIALOG,
  SILENT,
  SNACKBAR,
  SNACKBAR_SEVERITY,
  SNACKBAR_VARIANTS
} from '../../utils/constants';
import {
  SET_MESSAGE,
  SET_USERS,
  SET_ACTIVE_USERS,
  SET_USERS_TOUCHED,
  SET_USERS_DATA,
  SET_ACTIVE_USERS_DATA
} from '../../utils/actions';
import Message from '../../models/message';
import User from '../../models/user';
import CollectionData from '../../models/collection-data';
let usersListener, usersDataListener, activeUsersDataListener;

export const subscribeUserListener = () => {
  return async (dispatch, getState) => {
    try {
      usersDataListener = CollectionData.getListener('users').onSnapshot(
        (snapshot) => {
          const usersData = new CollectionData({
            ...snapshot.data(),
            collection: snapshot.id
          });
          dispatch({
            type: SET_USERS_DATA,
            usersData
          });
        }
      );
      activeUsersDataListener = CollectionData.getListener(
        'active-users'
      ).onSnapshot((snapshot) => {
        const activeUsersData = new CollectionData({
          ...snapshot.data(),
          collection: snapshot.id
        });
        dispatch({
          type: SET_ACTIVE_USERS_DATA,
          activeUsersData: activeUsersData
        });
      });
      usersListener = User.getListener().onSnapshot((snapshot) => {
        const touched = getState().dataState.usersTouched;
        const locations = getState().dataState.locations;
        const actions = [];
        if (!touched) {
          actions.push({
            type: SET_USERS_TOUCHED
          });
        }
        const users = snapshot.docs.map((doc) => {
          const locationPopulated = locations.find(
            (location) => location.locationId === doc.data().location
          );
          const workFromHome = doc.data().settings.workFromHome;
          return new User({
            ...doc.data(),
            userId: doc.id,
            location: locationPopulated,
            workFromHome: workFromHome
          });
        });
        actions.push({
          type: SET_USERS,
          users
        });
        actions.push({
          type: SET_ACTIVE_USERS,
          activeUsers: users.filter((user) => user.active)
        });
        dispatch(actions);
      });
    } catch (error) {
      const message = new Message({
        title: 'User',
        body: 'Users failed to retrieve',
        feedback: SILENT
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
    }
  };
};

export const unsubscribeUsersListener = () => {
  if (usersListener) {
    usersListener();
  }
  if (usersDataListener) {
    usersDataListener();
  }
  if (activeUsersDataListener) {
    activeUsersDataListener();
  }
};

export const getUserAuthData = (userId) => {
  return async (dispatch, _getState) => {
    try {
      return await User.getUserAuthData(userId);
    } catch (error) {
      const message = new Message({
        title: 'Admin Panel',
        body: 'Failed to retrieve user',
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

export const revokeRefreshTokens = (userId) => {
  return async (dispatch, _getState) => {
    try {
      await User.revokeRefreshTokens(userId);
      const message = new Message({
        title: 'Admin Panel',
        body:
          'Refresh Token revoked successfully. This may take up to an hour to take effect.',
        feedback: SNACKBAR,
        options: {
          duration: 5000,
          variant: SNACKBAR_VARIANTS.FILLED,
          severity: SNACKBAR_SEVERITY.INFO
        }
      });
      dispatch({
        type: SET_MESSAGE,
        message: message
      });
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Admin Panel',
        body: 'Failed to retrieve user',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message: message
      });
      return false;
    }
  };
};

export const addUser = (values) => {
  return async (dispatch, _getState) => {
    try {
      const updatedValues = {
        admin: values.admin,
        active: values.active,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        authPhone: values.authPhone.trim(),
        phone: values.phone.trim(),
        extension: values.extension.trim(),
        title: values.title.trim(),
        location: values.location,
        manager: values.manager
      };
      return await User.create(updatedValues);
    } catch (error) {
      const message = new Message({
        title: 'Admin Panel',
        body: 'Failed to create user',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
    }
  };
};

export const editUser = (userId, values) => {
  return async (dispatch, _getState) => {
    try {
      const updatedValues = {
        admin: values.admin,
        active: values.active,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        authPhone: values.authPhone.trim(),
        phone: values.phone.trim(),
        extension: values.extension.trim(),
        title: values.title.trim(),
        location: values.location,
        manager: values.manager
      };
      const result = await User.update(userId, updatedValues);
      return result;
    } catch (error) {
      const message = new Message({
        title: 'Admin Panel',
        body: 'Failed to update user',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
    }
  };
};
