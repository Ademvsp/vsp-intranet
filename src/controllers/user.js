import {
	DIALOG,
	SET_MESSAGE,
	SET_USERS,
	SILENT,
	SET_USERS_TOUHED
} from '../utils/constants';
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
			const message = new Message({
				title: 'Update Settings',
				body: 'Settings failed to update',
				feedback: DIALOG
			});
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
			const message = new Message({
				title: 'Profile Picture',
				body: 'Profile picture failed to upload',
				feedback: DIALOG
			});
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
			const message = new Message({
				title: 'Profile Picture',
				body: 'Profile picture failed to remove',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const getUsers = () => {
	return async (dispatch, getState) => {
		try {
			usersListener = firebase
				.firestore()
				.collection('users')
				.where('active', '==', true)
				.onSnapshot((snapshot) => {
					const touched = getState().dataState.usersTouched;
					const actions = [];
					if (!touched) {
						actions.push({
							type: SET_USERS_TOUHED
						});
					}
					const users = snapshot.docs.map((doc) => {
						const user = new User({
							userId: doc.id,
							firstName: doc.data().firstName,
							lastName: doc.data().lastName,
							location: doc.data().location,
							phone: doc.data().phone,
							profilePicture: doc.data().profilePicture,
							settings: doc.data().settings,
							title: doc.data().title
						});
						return user;
					});
					actions.push({
						type: SET_USERS,
						users
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
