import Message from '../models/message';
import Post from '../models/post';
import Notification from '../models/notification';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import { SET_MESSAGE } from '../utils/actions';
import * as fileUtils from '../utils/file-utils';
import { NEW_POST_COMMENT, NEW_POST } from '../data/notification-types';
import { getServerTimeInMilliseconds } from '../utils/firebase';
import Metadata from '../models/metadata';
let postsCounterListener;

export const getMetadataListener = () => {
	return Metadata.getListener('posts');
};

export const getListener = (postId) => {
	return Post.getListener(postId);
};

export const addPost = (values, attachments, notifyUsers) => {
	return async (dispatch, getState) => {
		const { title, body } = values;
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		let newPost;
		try {
			newPost = new Post({
				postId: null,
				attachments: [],
				body: body.trim(),
				comments: [],
				metadata: null,
				subscribers: [authUser.userId],
				title: title.trim(),
				user: authUser.userId
			});
			await newPost.save();
			if (attachments.length > 0) {
				const uploadedAttachments = await dispatch(
					fileUtils.upload({
						files: attachments,
						collection: 'posts',
						collectionId: newPost.postId,
						folder: newPost.metadata.createdAt.getTime().toString()
					})
				);
				newPost.attachments = uploadedAttachments;
				await newPost.save();
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
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					newPost.subscribers.includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
					const emailData = {
						postBody: body.trim(),
						attachments: newPost.attachments,
						postTitle: title.trim()
					};
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification({
						notificationId: null,
						emailData: emailData,
						link: `/newsfeed/${newPost.postId}`,
						page: 'News Feed',
						recipient: transformedRecipient,
						title: `News Feed "${title}" New post from ${senderFullName}`,
						type: NEW_POST
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const addComment = (post, body, attachments, notifyUsers) => {
	return async (dispatch, getState) => {
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		let uploadedAttachments;
		try {
			const serverTime = await getServerTimeInMilliseconds();
			uploadedAttachments = [];
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					fileUtils.upload({
						files: attachments,
						collection: 'posts',
						collectionId: post.postId,
						folder: serverTime.toString()
					})
				);
			}
			await post.addComment(body.trim(), uploadedAttachments, serverTime);
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
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					post.subscribers.includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
					const emailData = {
						commentBody: body.trim(),
						attachments: uploadedAttachments,
						postTitle: post.title
					};
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification({
						notificationId: null,
						emailData: emailData,
						link: `/newsfeed/${post.postId}`,
						page: 'News Feed',
						recipient: transformedRecipient,
						title: `News Feed "${post.title}" New comment from ${senderFullName}`,
						type: NEW_POST_COMMENT
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const toggleSubscribePost = (post) => {
	return async (dispatch, _getState) => {
		try {
			await post.toggleSubscribePost();
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

export const searchPosts = (values) => {
	return async (dispatch, _getState) => {
		try {
			const posts = await Post.getAll();
			const results = [];
			posts.forEach((doc) => {
				const value = values.value.trim().toLowerCase();
				const userId = values.user ? values.user.userId : null;
				const post = new Post({
					...doc.data(),
					postId: doc.id
				});
				if (getSearchMatch(post, value, userId)) {
					results.push(post.postId);
				}
			});
			if (results.length === 0 || results.length === posts.length) {
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
