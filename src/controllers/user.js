import { DIALOG, SET_MESSAGE } from '../utils/constants';
import firebase from '../utils/firebase';
import Compressor from 'compressorjs';
import Message from '../models/message';

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
