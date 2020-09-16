import firebase from './firebase';
import {
	FINISH_UPLOAD,
	SET_MESSAGE,
	SET_UPLOAD_PROGRESS,
	START_UPLOAD
} from './actions';
import Message from '../models/message';
import { DIALOG } from './constants';

export const upload = (files, collection, collectionId, folder) => {
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
			const message = new Message(
				'Upload Files',
				'Attachments failed to upload',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const removeAll = async (path) => {
	const listAll = await firebase.storage().ref(path).listAll();
	const promises = [];
	for (const item of listAll.items) {
		promises.push(firebase.storage().ref().child(item.fullPath).delete());
	}
	await Promise.all(promises);
};
