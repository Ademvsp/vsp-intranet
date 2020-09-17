import Message from '../models/message';
import Counter from '../models/counter';
import Post from '../models/post';
import Notification from '../models/notification';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import { SET_MESSAGE, SET_POSTS_COUNTER } from '../utils/actions';
import * as fileUtils from '../utils/file-utils';
import { NEW_COMMENT, NEW_POST } from '../utils/notification-types';
import { getServerTimeInMilliseconds } from '../utils/firebase';
let postsCounterListener;

export const subscribePostsCounterListener = () => {
	return async (dispatch, _getState) => {
		try {
			postsCounterListener = Counter.getListener('posts').onSnapshot(
				(snapshot) => {
					const postsCounter = new Counter(
						snapshot.id,
						snapshot.data().count,
						snapshot.data().documents
					);
					dispatch({
						type: SET_POSTS_COUNTER,
						postsCounter
					});
				}
			);
		} catch (error) {
			const message = new Message(
				'News Feed',
				'Failed to retrieve news feed',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
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
			newPost = new Post(
				null,
				[],
				body.trim(),
				[],
				null,
				[authUser.userId],
				title.trim(),
				authUser.userId
			);
			await newPost.save();
			if (attachments.length > 0) {
				const uploadedAttachments = await dispatch(
					fileUtils.upload(
						attachments,
						'posts',
						newPost.postId,
						newPost.metadata.createdAt.getTime().toString()
					)
				);
				newPost.attachments = uploadedAttachments;
				await newPost.save();
			}
			const message = new Message(
				'News Feed',
				'Post created successfully',
				SNACKBAR,
				{
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.INFO
				}
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message('News Feed', 'Post failed to post', DIALOG);
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
					const notification = new Notification(
						null,
						emailData,
						`/newsfeed/post?postId=${newPost.postId}`,
						null,
						'News Feed',
						transformedRecipient,
						`News Feed "${title}" New post from ${senderFullName}`,
						NEW_POST
					);
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
					fileUtils.upload(
						attachments,
						'posts',
						post.postId,
						serverTime.toString()
					)
				);
			}
			await post.addComment(body.trim(), uploadedAttachments, serverTime);
		} catch (error) {
			const message = new Message(
				'News Feed',
				'Comment failed to post',
				DIALOG
			);
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
					const notification = new Notification(
						null,
						emailData,
						`/newsfeed/post?postId=${post.postId}`,
						null,
						'News Feed',
						transformedRecipient,
						`News Feed "${post.title}" New comment from ${senderFullName}`,
						NEW_COMMENT
					);
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
			const message = new Message(
				'News Feed',
				'Failed to subscribe/unsubscribe to post',
				DIALOG
			);
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
				const post = new Post(
					doc.id,
					doc.data().attachments,
					doc.data().body,
					doc.data().comments,
					doc.data().metadata,
					doc.data().subscribers,
					doc.data().title,
					doc.data().user
				);
				if (getSearchMatch(post, value, userId)) {
					results.push(post.postId);
				}
			});
			if (results.length === 0 || results.length === posts.length) {
				return null;
			}
			return results;
		} catch (error) {
			const message = new Message('News Feed', 'Search failed', DIALOG);
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
