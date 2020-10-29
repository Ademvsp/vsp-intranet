import Message from '../../models/message';
import Post from '../../models/post';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../../utils/constants';
import { SET_MESSAGE } from '../../utils/actions';
import * as fileUtils from '../../utils/file-utils';
import { getServerTimeInMilliseconds } from '../../utils/firebase';
let collectionDataListener;

export const addPost = (values, attachments, notifyUsers) => {
	return async (dispatch, getState) => {
		const { title, body } = values;
		const { authUser } = getState().authState;
		let newPost;
		try {
			newPost = new Post({
				//The rest of .actions will be filled out in the model
				actions: [{ notifyUsers: notifyUsers }],
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
					duration: 5000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.INFO
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
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
			return false;
		}
	};
};

export const addComment = (post, body, attachments, notifyUsers) => {
	return async (dispatch, _getState) => {
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
			await post.addComment(
				body.trim(),
				uploadedAttachments,
				notifyUsers,
				serverTime
			);
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
			return false;
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

export const unsubscribeCollectionDataListener = () => {
	if (collectionDataListener) {
		collectionDataListener();
	}
};
