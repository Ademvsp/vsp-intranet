import firebase from '../utils/firebase';
import Message from '../models/message';
import { DIALOG, SET_MESSAGE } from '../utils/constants';
// import Post from '../models/post';

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

export const addComment = (postId, body) => {
	return async (dispatch, getState) => {
		try {
			const comment = {
				attachments: [],
				body,
				createdAt: null,
				createdBy: getState().authState.authUser.userId
			};
			const funcionRef = firebase.functions().httpsCallable('addComment');
			await funcionRef({
				collection: 'posts',
				document: postId,
				comment
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
