import firebase from './firebase';
import {
  FINISH_UPLOAD,
  SET_MESSAGE,
  SET_UPLOAD_PROGRESS,
  START_UPLOAD
} from './actions';
import Message from '../models/message';
import { DIALOG } from './constants';

export const compareAndDelete = async ({
  oldAttachments,
  newAttachments,
  collection,
  collectionId,
  folder
}) => {
  const promises = [];
  for (const oldAttachment of oldAttachments) {
    const keepAttachment = newAttachments.find((newAttachment) => {
      const nameMatch = newAttachment.name === oldAttachment.name;
      const linkMatch = newAttachment.link === oldAttachment.link;
      return nameMatch && linkMatch;
    });
    if (!keepAttachment) {
      promises.push(
        firebase
          .storage()
          .ref(`${collection}/${collectionId}/${folder}/${oldAttachment.name}`)
          .delete()
      );
    }
  }
  await Promise.all(promises);
  return newAttachments;
};

export const upload = ({ files, collection, collectionId, folder }) => {
  return async (dispatch, getState) => {
    try {
      const promises = [];
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
                resolve({
                  link: downloadUrl,
                  name: file.name,
                  size: file.size
                });
              }
            );
          })
        );
      }
      const uploadedFiles = await Promise.all(promises);
      dispatch({ type: FINISH_UPLOAD });
      return uploadedFiles;
    } catch (error) {
      console.error(error);
      const message = new Message({
        title: 'Upload Files',
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
