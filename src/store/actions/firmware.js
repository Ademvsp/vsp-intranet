import Message from '../../models/message';
import { SET_MESSAGE } from '../../utils/actions';
import {
  DIALOG,
  SNACKBAR,
  SNACKBAR_SEVERITY,
  SNACKBAR_VARIANTS
} from '../../utils/constants';
import { compareAndDelete, upload } from '../../utils/file-utils';
import Firmware from '../../models/firmware';
import { getServerTimeInMilliseconds } from '../../utils/firebase';

export const addFirmware = (values) => {
  return async (dispatch, getState) => {
    const { attachments, notifyUsers, body, products, title } = values;
    const { authUser } = getState().authState;
    const newFirmware = new Firmware({
      //The rest of .actions will be filled out in the model when you .save()
      actions: [{ notifyUsers: notifyUsers }],
      attachments: [],
      body: body.trim(),
      comments: [],
      products: products,
      title: title.trim(),
      user: authUser.userId
    });
    try {
      await newFirmware.save();
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'firmwares',
            collectionId: newFirmware.firmwareId,
            folder: newFirmware.metadata.createdAt.getTime().toString()
          })
        );
      }
      newFirmware.attachments = uploadedAttachments;
      await newFirmware.save();
      const message = new Message({
        title: 'Firmware & Software',
        body: 'Firmware added successfully',
        feedback: SNACKBAR,
        options: {
          duration: 5000,
          variant: SNACKBAR_VARIANTS.FILLED,
          severity: SNACKBAR_SEVERITY.SUCCESS
        }
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return true;
    } catch (error) {
      console.error(error);
      const message = new Message({
        title: 'Firmware & Software',
        body: 'Failed to add firmware',
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

export const editFirmware = (firmware, values) => {
  return async (dispatch, _getState) => {
    const { attachments, notifyUsers, body, products, title } = values;
    //Handle any attachment deletions
    const existingAttachments = attachments.filter(
      (attachment) => !(attachment instanceof File)
    );
    await compareAndDelete({
      oldAttachments: firmware.attachments,
      newAttachments: existingAttachments,
      collection: 'firmwares',
      collectionId: firmware.firmwareId,
      folder: firmware.metadata.createdAt.getTime().toString()
    });
    //Handle new attachments to be uploaded
    const toBeUploadedAttachments = attachments.filter(
      (attachment) => attachment instanceof File
    );
    let uploadedAttachments = [];
    if (toBeUploadedAttachments.length > 0) {
      uploadedAttachments = await dispatch(
        upload({
          files: toBeUploadedAttachments,
          collection: 'firmwares',
          collectionId: firmware.firmwareId,
          folder: firmware.metadata.createdAt.getTime().toString()
        })
      );
    }
    const newFirmware = new Firmware({
      firmwareId: firmware.firmwareId,
      actions: [...firmware.actions, { notifyUsers: notifyUsers }],
      attachments: [...existingAttachments, ...uploadedAttachments],
      body: body.trim(),
      comments: firmware.comments,
      metadata: firmware.metadata,
      products: products,
      title: title.trim(),
      user: firmware.user
    });
    try {
      await newFirmware.save();
      const message = new Message({
        title: 'Firmware & Software',
        body: 'Firmware updated successfully',
        feedback: SNACKBAR,
        options: {
          duration: 5000,
          variant: SNACKBAR_VARIANTS.FILLED,
          severity: SNACKBAR_SEVERITY.SUCCESS
        }
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return true;
    } catch (error) {
      console.error(error);
      const message = new Message({
        title: 'Firmware & Software',
        body: 'Failed to update Firmware',
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

export const deleteFirmware = (firmware) => {
  return async (dispatch, _getState) => {
    try {
      const newFirmware = new Firmware({ ...firmware });
      const promises = [];
      promises.push(newFirmware.delete());
      await Promise.all(promises);
      const message = new Message({
        title: 'Firmware & Software',
        body: 'Firmware deleted successfully',
        feedback: SNACKBAR,
        options: {
          duration: 5000,
          variant: SNACKBAR_VARIANTS.FILLED,
          severity: SNACKBAR_SEVERITY.SUCCESS
        }
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return true;
    } catch (error) {
      console.error(error);
      const message = new Message({
        title: 'Firmware & Software',
        body: 'Failed to delete Firmware',
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

export const addComment = (firmware, values) => {
  return async (dispatch, _getState) => {
    const { body, attachments, notifyUsers } = values;
    const newFirmware = new Firmware({ ...firmware });
    let uploadedAttachments = [];
    try {
      const serverTime = await getServerTimeInMilliseconds();
      if (attachments.length > 0) {
        uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'firmwares',
            collectionId: firmware.firmwareId,
            folder: serverTime.toString()
          })
        );
      }
      await newFirmware.saveComment(
        body.trim(),
        uploadedAttachments,
        notifyUsers,
        serverTime
      );
      return true;
    } catch (error) {
      console.error(error);
      const message = new Message({
        title: 'Firmware & Software',
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
