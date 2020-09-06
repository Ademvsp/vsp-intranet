import firebase from '../utils/firebase';
import Message from '../models/message';
import { DIALOG, SET_MESSAGE } from '../utils/constants';
// import Post from '../models/post';

export const uploadFiles = (files) => {
	return async (dispatch, _getState) => {
		try {
			const promises = [];
			const attachments = [];
			for (const [index, file] of files.entries()) {
				const storageRef = firebase
					.storage()
					.ref(`threads/${threadId}/${attachment.file.name}`);
				const uploadTask = storageRef.put(attachment.file);
				promises.push(
					new Promise((resolve, reject) => {
						uploadTask.on(
							'state_changed',
							(snapshot) => {
								const newAttachmentsValue = [...attachmentsValue];
								const progress =
									(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
								newAttachmentsValue[index].progress = isNaN(progress)
									? 100
									: progress;
								setAttachmentsValue(newAttachmentsValue);
							},
							() => reject(),
							async () => {
								const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
								attachments.push({
									link: downloadUrl,
									name: attachment.file.name
								});
								await firebase
									.firestore()
									.collection('threads')
									.doc(threadId)
									.update({
										attachments: firebase.firestore.FieldValue.arrayUnion({
											link: downloadUrl,
											name: attachment.file.name
										})
									});
								resolve();
							}
						);
					})
				);
			}
			await Promise.all(promises);
			await firebase.firestore().collection('threads').doc(threadId).update({
				createdAt: firebase.firestore.FieldValue.serverTimestamp()
			});
			return attachments;
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
