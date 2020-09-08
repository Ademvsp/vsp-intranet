import firebase from '../utils/firebase';
import Message from '../models/message';
import Counter from '../models/counter';
import Post from '../models/post';
import {
	DIALOG,
	SET_MESSAGE,
	START_UPLOAD,
	SET_UPLOAD_PROGRESS,
	FINISH_UPLOAD,
	SET_POSTS_COUNTER
} from '../utils/constants';
import * as notificationController from './notification';
import { transformForEmail } from '../utils/html-transformer';
let postsCounterListener;

export const subscribePostsCounterListener = () => {
	return async (dispatch, _getState) => {
		try {
			postsCounterListener = firebase
				.firestore()
				.collection('counters')
				.doc('posts')
				.onSnapshot((snapshot) => {
					const postsCounter = new Counter({
						collection: snapshot.id,
						count: snapshot.data().count,
						documents: snapshot.data().documents.reverse()
					});
					dispatch({
						type: SET_POSTS_COUNTER,
						postsCounter
					});
				});
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

export const addPost = (values, attachments, notifyUsers) => {
	return async (dispatch, getState) => {
		try {
			const { title, body } = values;
			const authUser = getState().authState.authUser;
			let functionRef = firebase.functions().httpsCallable('getServerTime');
			let result = await functionRef();
			const serverTime = result.data;
			const post = {
				attachments: [],
				body: body.trim(),
				comments: [],
				createdAt: null,
				createdBy: authUser.userId,
				title: title.trim()
			};
			functionRef = firebase.functions().httpsCallable('addPost');
			result = await functionRef({ post, serverTime });
			const postId = result.data;
			let uploadedAttachments = [];
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					uploadFiles(attachments, 'posts', postId, serverTime.toString())
				);
				await firebase.firestore().collection('posts').doc(postId).update({
					attachments: uploadedAttachments
				});
			}
			notificationController.sendEmailNotification({
				headerParams: {
					from: null,
					recipients: notifyUsers,
					bcc: null
				},
				bodyParams: {
					template: 'newThread',
					title: title.trim(),
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
				body: 'Post failed to post',
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

export const searchPosts = (values) => {
	return async (dispatch, getState) => {
		try {
			const collection = await firebase.firestore().collection('posts').get();
			const results = [];
			collection.docs.forEach((doc) => {
				const value = values.value.trim().toLowerCase();
				const userId = values.user ? values.user.userId : null;
				const post = new Post({
					postId: doc.id,
					attachments: doc.data().attachments,
					body: doc.data().body,
					comments: doc.data().comments,
					title: doc.data().title,
					createdAt: doc.data().createdAt,
					createdBy: doc.data().createdBy
				});
				if (getSearchMatch(post, value, userId)) {
					results.push(post.postId);
				}
			});
			if (results.length === 0 || results.length === collection.docs.length) {
				return null;
			}
			return results;
		} catch (error) {
			const message = new Message({
				title: 'News Feed',
				body: 'Search failed',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

const getSearchMatch = (post, value, userId) => {
	if (post.title.toLowerCase().includes(value)) {
		if (userId) {
			if (userId === post.createdBy) {
				return true;
			}
		} else {
			return true;
		}
	}
	if (post.body.toLowerCase().includes(value)) {
		if (userId) {
			if (userId === post.createdBy) {
				return true;
			}
		} else {
			return true;
		}
	}
	const commentMatch = post.comments.find((comment) =>
		comment.body.toLowerCase().includes(value)
	);
	if (commentMatch) {
		if (userId) {
			if (userId === commentMatch.createdBy) {
				return true;
			}
		} else {
			return true;
		}
	}
	return false;
};

export const unsubscribePostsCounter = () => {
	if (postsCounterListener) {
		postsCounterListener();
	}
};
