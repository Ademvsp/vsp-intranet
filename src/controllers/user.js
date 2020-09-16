import { SILENT } from '../utils/constants';
import {
	SET_MESSAGE,
	SET_USERS,
	SET_ACTIVE_USERS,
	SET_USERS_TOUCHED
} from '../utils/actions';
import Message from '../models/message';
import User from '../models/user';
let usersListener;

export const subscribeUsers = () => {
	return async (dispatch, getState) => {
		try {
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
					const location = locations.find(
						(location) => location.locationId === doc.data().location
					);
					return new User(
						doc.id,
						doc.data().active,
						doc.data().email,
						doc.data().extension,
						doc.data().firstName,
						doc.data().lastName,
						location,
						doc.data().manager,
						doc.data().phone,
						doc.data().profilePicture,
						doc.data().settings,
						doc.data().title
					);
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
			const message = new Message('User', 'Users failed to retrieve', SILENT);
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
};
