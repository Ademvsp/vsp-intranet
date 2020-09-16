import Message from '../models/message';
import Counter from '../models/counter';
import Post from '../models/post';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import { SET_MESSAGE, SET_POSTS_COUNTER } from '../utils/actions';
import * as fileUtils from '../utils/file-utils';
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

export const addPost = (values, attachments) => {
	return async (dispatch, getState) => {
		const { title, body } = values;
		const authUser = getState().authState.authUser;
		try {
			const newPost = new Post(
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
			return newPost;
		} catch (error) {
			const message = new Message('News Feed', 'Post failed to post', DIALOG);
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
};

export const addComment = (post, body, attachments) => {
	return async (dispatch, _getState) => {
		try {
			const serverTime = await Post.getServerTime();
			let uploadedAttachments = [];
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
