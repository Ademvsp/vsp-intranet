import firebase from '../utils/firebase';
import Message from '../models/message';
import {
	DIALOG,
	SET_MESSAGE,
	START_UPLOAD,
	SET_UPLOAD_PROGRESS,
	FINISH_UPLOAD
} from '../utils/constants';
import * as notificationController from './notification';
import { transformForEmail } from '../utils/html-transformer';

export const getPostCounter = () => {
	return async (dispatch, _getState) => {
		try {
			const doc = await firebase
				.firestore()
				.collection('counters')
				.doc('posts')
				.get();
			return { ...doc.data() };
		} catch (error) {
			const message = new Message({
				title: 'News Feed',
				body: 'Failed to retrieve news feed',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const getPostRef = (postId) => {
	return firebase.firestore().collection('posts').doc(postId);
};

export const addComment = (post, postId, body, attachments, notifyUsers) => {
	return async (dispatch, getState) => {
		try {
			const authUser = getState().authState.authUser;
			let functionRef = firebase.functions().httpsCallable('getServerTime');
			let result = await functionRef();
			const serverTime = result.data;
			let uploadedAttachments = [];
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					uploadFiles(attachments, 'posts', postId, serverTime.toString())
				);
			}
			const comment = {
				attachments: uploadedAttachments,
				body,
				createdBy: authUser.userId
			};
			functionRef = firebase.functions().httpsCallable('addComment');
			await functionRef({
				collection: 'posts',
				document: postId,
				comment,
				serverTime
			});
			notificationController.sendEmailNotification({
				headerParams: {
					from: null,
					recipients: notifyUsers,
					bcc: null
				},
				bodyParams: {
					template: 'newThreadReply',
					title: post.title,
					link: 'newsfeed',
					page: 'News Feed',
					sender: authUser,
					content: transformForEmail(body, '50%'),
					attachments: uploadedAttachments,
					signature: 'VSP Intranet'
				}
			});
			return true;
		} catch (error) {
			const message = new Message({
				title: 'News Feed',
				body: 'Comment failed to post',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
		return false;
	};
};

const uploadFiles = (files, collection, collectionId, folder) => {
	return async (dispatch, getState) => {
		try {
			const promises = [];
			const uploadedFiles = [];
			const filesProgress = files.map((file) => {
				return {
					name: file.name,
					totalBytes: file.size,
					bytesTransferred: 0
				};
			});
			dispatch({
				type: START_UPLOAD,
				files,
				filesProgress
			});

			for (const [index, file] of files.entries()) {
				const storageRef = firebase
					.storage()
					.ref(`${collection}/${collectionId}/${folder}/${file.name}`);
				const uploadTask = storageRef.put(file);
				promises.push(
					new Promise((resolve, reject) => {
						uploadTask.on(
							'state_changed',
							(snapshot) => {
								const newFilesProgress = [
									...getState().uploadState.filesProgress
								];
								newFilesProgress[index].bytesTransferred =
									snapshot.bytesTransferred;
								newFilesProgress[index].totalBytes = snapshot.totalBytes;
								dispatch({
									type: SET_UPLOAD_PROGRESS,
									filesProgress: newFilesProgress
								});
							},
							() => reject(),
							async () => {
								const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
								uploadedFiles.push({
									link: downloadUrl,
									name: file.name,
									size: file.size
								});
								resolve();
							}
						);
					})
				);
			}
			await Promise.all(promises);
			dispatch({ type: FINISH_UPLOAD });
			return uploadedFiles;
		} catch (error) {
			const message = new Message({
				title: 'News Feed',
				body: 'Attachments failed to upload',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};
