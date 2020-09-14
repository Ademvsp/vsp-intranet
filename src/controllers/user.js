import { DIALOG, SILENT } from '../utils/constants';
import {
	SET_MESSAGE,
	SET_USERS,
	SET_ACTIVE_USERS,
	SET_USERS_TOUCHED
} from '../utils/actions';
import firebase from '../utils/firebase';
import Compressor from 'compressorjs';
import Message from '../models/message';
import User from '../models/user';
let usersListener;

export const updateSettings = (settings) => {
	return async (dispatch, getState) => {
		try {
			const userId = getState().authState.authUser.userId;
			await firebase
				.firestore()
				.collection('users')
				.doc(userId)
				.update({ settings });
		} catch (error) {
			const message = new Message(
				'Update Settings',
				'Settings failed to update',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const uploadPicture = (file) => {
	return async (dispatch, getState) => {
		try {
			if (!file.type.includes('image')) {
				throw new Error('Invalid image format');
			}
			const authUser = getState().authState.authUser;
			const resizedFile = await new Promise((resolve, reject) => {
				return new Compressor(file, {
					width: 200,
					success: (result) => {
						resolve(
							new File([result], file.name, {
								type: file.type,
								lastModified: file.lastModified
							})
						);
					},
					error: (error) => reject(error)
				});
			});
			const listAll = await firebase //Delete all existing profile pictures in user folder
				.storage()
				.ref(`users/${authUser.userId}/profilePicture/`)
				.listAll();
			for (const item of listAll.items) {
				await firebase.storage().ref().child(item.fullPath).delete();
			} //Upload image, then use snapshot in promise to update profilePicture property in the user database
			const uploadResult = await firebase
				.storage()
				.ref()
				.child(`users/${authUser.userId}/profilePicture/${resizedFile.name}`)
				.put(resizedFile);
			const downloadUrl = await firebase
				.storage()
				.ref()
				.child(uploadResult.ref.fullPath)
				.getDownloadURL();
			await firebase
				.firestore()
				.collection('users')
				.doc(authUser.userId)
				.update({ profilePicture: downloadUrl });
		} catch (error) {
			const message = new Message(
				'Profile Picture',
				'Profile picture failed to upload',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const removePicture = () => {
	return async (dispatch, getState) => {
		try {
			const authUser = getState().authState.authUser;
			const listAll = await firebase //Delete all existing profile pictures in user folder
				.storage()
				.ref(`users/${authUser.userId}/profilePicture/`)
				.listAll();
			for (const item of listAll.items) {
				await firebase.storage().ref().child(item.fullPath).delete();
			}
			await firebase
				.firestore()
				.collection('users')
				.doc(authUser.userId)
				.update({ profilePicture: '' });
		} catch (error) {
			const message = new Message(
				'Profile Picture',
				'Profile picture failed to remove',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const subscribeUsers = () => {
	return async (dispatch, getState) => {
		try {
			usersListener = firebase
				.firestore()
				.collection('users')
				.orderBy('firstName', 'asc')
				.onSnapshot((snapshot) => {
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

export const getUser = async (userId) => {
	return async (_dispatch, getState) => {
		return getState().dataState.users.find((user) => user.userId === userId);
	};
};

export const unsubscribeUsersListener = () => {
	if (usersListener) {
		usersListener();
	}
};
