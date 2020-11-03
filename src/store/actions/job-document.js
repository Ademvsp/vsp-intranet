import Message from '../../models/message';
import { SET_MESSAGE } from '../../utils/actions';
import {
  DIALOG,
  SNACKBAR,
  SNACKBAR_SEVERITY,
  SNACKBAR_VARIANTS
} from '../../utils/constants';
import { compareAndDelete, upload } from '../../utils/file-utils';
import JobDocument from '../../models/job-document';
import { getServerTimeInMilliseconds } from '../../utils/firebase';

export const addJobDocument = (values) => {
  return async (dispatch, getState) => {
    const {
      attachments,
      notifyUsers,
      salesOrder,
      siteReference,
      customer,
      body
    } = values;
    const { authUser } = getState().authState;
    const newJobDocument = new JobDocument({
      //The rest of .actions will be filled out in the model when you .save()
      actions: [{ notifyUsers: notifyUsers }],
      attachments: [],
      body: body.trim(),
      comments: [],
      customer: {
        customerId: customer.customerId,
        name: customer.name
      },
      salesOrder: salesOrder,
      siteReference: siteReference.trim(),
      user: authUser.userId
    });
    try {
      await newJobDocument.save();
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'job-documents',
            collectionId: newJobDocument.jobDocumentId,
            folder: newJobDocument.metadata.createdAt.getTime().toString()
          })
        );
      }
      newJobDocument.attachments = uploadedAttachments;
      await newJobDocument.save();
      const message = new Message({
        title: 'Job Documents',
        body: 'Job Document added successfully',
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
      const message = new Message({
        title: 'Job Documents',
        body: 'Failed to add Job Document',
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

export const editJobDocument = (jobDocument, values) => {
  return async (dispatch, _getState) => {
    const {
      attachments,
      notifyUsers,
      salesOrder,
      siteReference,
      customer,
      body
    } = values;
    //Handle any attachment deletions
    const existingAttachments = attachments.filter(
      (attachment) => !(attachment instanceof File)
    );
    await compareAndDelete({
      oldAttachments: jobDocument.attachments,
      newAttachments: existingAttachments,
      collection: 'job-documents',
      collectionId: jobDocument.jobDocumentId,
      folder: jobDocument.metadata.createdAt.getTime().toString()
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
          collection: 'job-documents',
          collectionId: jobDocument.jobDocumentId,
          folder: jobDocument.metadata.createdAt.getTime().toString()
        })
      );
    }
    const newJobDocument = new JobDocument({
      jobDocumentId: jobDocument.jobDocumentId,
      actions: [...jobDocument.actions, { notifyUsers: notifyUsers }],
      attachments: [...existingAttachments, ...uploadedAttachments],
      body: body.trim(),
      comments: jobDocument.comments,
      customer: { ...customer },
      metadata: jobDocument.metadata,
      salesOrder: salesOrder,
      siteReference: siteReference.trim(),
      user: jobDocument.user
    });
    try {
      await newJobDocument.save();
      const message = new Message({
        title: 'Job Documents',
        body: 'Job Document updated successfully',
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
      const message = new Message({
        title: 'Job Document',
        body: 'Failed to update Job Document',
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

export const deleteJobDocument = (jobDocument) => {
  return async (dispatch, _getState) => {
    try {
      const newJobDocument = new JobDocument({ ...jobDocument });
      const promises = [];
      promises.push(newJobDocument.delete());
      await Promise.all(promises);
      const message = new Message({
        title: 'Job Documents',
        body: 'Job Document deleted successfully',
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
      const message = new Message({
        title: 'Job Documents',
        body: 'Failed to delete Job Document',
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

export const addComment = (jobDocument, values) => {
  return async (dispatch, _getState) => {
    const { body, attachments, notifyUsers } = values;
    const newJobDocument = new JobDocument({ ...jobDocument });
    let uploadedAttachments = [];
    try {
      const serverTime = await getServerTimeInMilliseconds();
      if (attachments.length > 0) {
        uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'job-documents',
            collectionId: jobDocument.jobDocumentId,
            folder: serverTime.toString()
          })
        );
      }
      await newJobDocument.saveComment(
        body.trim(),
        uploadedAttachments,
        notifyUsers,
        serverTime
      );
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Job Documents',
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
