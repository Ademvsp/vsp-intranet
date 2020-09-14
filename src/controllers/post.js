import firebase from '../utils/firebase';
import Message from '../models/message';
import Counter from '../models/counter';
import Post from '../models/post';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import {
	SET_MESSAGE,
	START_UPLOAD,
	SET_UPLOAD_PROGRESS,
	FINISH_UPLOAD,
	SET_POSTS_COUNTER
} from '../utils/actions';
import { NEW_POST, NEW_COMMENT } from '../utils/notification-template-codes';
import * as notificationController from './notification';
const region = process.env.REACT_APP_FIREBASE_FUNCTIONS_REGION;
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
		const { title, body } = values;
		const authUser = getState().authState.authUser;
		let uploadedAttachments = [];
		let postId;
		try {
			let functionRef = firebase
				.app()
				.functions(region)
				.httpsCallable('getServerTime');
			let result = await functionRef();
			const serverTime = result.data;
			const post = {
				attachments: [],
				body: body.trim(),
				comments: [],
				createdAt: null,
				createdBy: authUser.userId,
				subscribers: [authUser.userId],
				title: title.trim()
			};
			functionRef = firebase.app().functions(region).httpsCallable('addPost');
			result = await functionRef({ post, serverTime });
			postId = result.data;
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					uploadFiles(attachments, 'posts', postId, serverTime.toString())
				);
				await firebase.firestore().collection('posts').doc(postId).update({
					attachments: uploadedAttachments
				});
			}
			const message = new Message({
				title: 'News Feed',
				body: 'Post created successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.INFO
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
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
			return false;
		}
		//Perform this without disruptive error catching
		try {
			await notificationController.sendNotification({
				type: NEW_POST,
				recipients: notifyUsers,
				postId,
				title: title.trim(),
				postBody: body,
				attachments: uploadedAttachments
			});
		} catch (error) {
			return true;
		}
		return true;
	};
};

export const addComment = (post, body, attachments, notifyUsers) => {
	return async (dispatch, getState) => {
		const authUser = getState().authState.authUser;
		const users = getState().dataState.users;
		const recipients = users.filter((user) => {
			const notifyUsersMatch = notifyUsers.find(
				(notifyUser) => notifyUser.userId === user.userId
			);
			const subscribersMatch = post.subscribers.includes(user.userId);
			return notifyUsersMatch || subscribersMatch;
		});
		let uploadedAttachments = [];
		try {
			let functionRef = firebase
				.app()
				.functions(region)
				.httpsCallable('getServerTime');
			let result = await functionRef();
			const serverTime = result.data;
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					uploadFiles(attachments, 'posts', post.postId, serverTime.toString())
				);
			}
			const comment = {
				attachments: uploadedAttachments,
				body,
				createdBy: authUser.userId
			};
			functionRef = firebase
				.app()
				.functions(region)
				.httpsCallable('addComment');
			await functionRef({
				collection: 'posts',
				document: post.postId,
				comment,
				serverTime
			});
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
			return false;
		}
		//Perform this without disruptive error catching
		try {
			await notificationController.sendNotification({
				type: NEW_COMMENT,
				recipients,
				postId: post.postId,
				title: post.title,
				commentBody: body,
				attachments: uploadedAttachments
			});
		} catch (error) {
			return true;
		}
		return true;
	};
};

export const toggleSubscribePost = (post) => {
	return async (dispatch, getState) => {
		try {
			const postId = post.postId;
			const userId = getState().authState.authUser.userId;
			let dbAction = firebase.firestore.FieldValue.arrayUnion(userId);
			if (post.subscribers.includes(userId)) {
				dbAction = firebase.firestore.FieldValue.arrayRemove(userId);
			}
			await firebase.firestore().collection('posts').doc(postId).update({
				subscribers: dbAction
			});
		} catch (error) {
			const message = new Message({
				title: 'News Feed',
				body: 'Failed to subscribe/unsubscribe to post',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
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
	return async (dispatch, _getState) => {
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
					subscribers: doc.data().subscribers,
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
