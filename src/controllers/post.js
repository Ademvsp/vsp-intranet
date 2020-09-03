import firebase from '../utils/firebase';
import Message from '../models/message';
import { DIALOG, SET_MESSAGE } from '../utils/constants';
import Post from '../models/post';

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

// export const getPost = (postId) => {
// 	return async (dispatch, _getState) => {
// 		try {
// 			const postListener = firebase
// 				.firestore()
// 				.collection('threads')
// 				.doc(postId)
// 				.onSnapshot((snapshot) => {});
// 			const post = new Post({
// 				threadId: doc.id,
// 				attachments: doc.data().attachments,
// 				categories: doc.data().categories,
// 				content: doc.data().content,
// 				createdAt: doc.data().createdAt,
// 				replies: doc.data().replies,
// 				subject: doc.data().subject,
// 				user: doc.data().user
// 			});
// 		} catch (error) {
// 			const message = new Message({
// 				title: 'News Feed',
// 				body: 'Failed to retrieve news feed',
// 				feedback: DIALOG
// 			});
// 			dispatch({
// 				type: SET_MESSAGE,
// 				message
// 			});
// 		}
// 	};
// };
