import { SILENT } from '../utils/constants';
import {
	SET_MESSAGE,
	SET_USERS,
	SET_ACTIVE_USERS,
	SET_USERS_TOUCHED,
	SET_USERS_DATA,
	SET_ACTIVE_USERS_DATA
} from '../utils/actions';
import Message from '../models/message';
import User from '../models/user';
import CollectionData from '../models/collection-data';
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
				'activeUsers'
			).onSnapshot((snapshot) => {
				const activeUsersData = new CollectionData({
					...snapshot.data(),
					collection: snapshot.id
				});
				dispatch({
					type: SET_ACTIVE_USERS_DATA,
					activeUsersData
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
