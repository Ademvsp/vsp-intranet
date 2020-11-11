import Message from '../../models/message';
import Project from '../../models/project';
import { SET_MESSAGE } from '../../utils/actions';
import {
  DIALOG,
  SNACKBAR,
  SNACKBAR_SEVERITY,
  SNACKBAR_VARIANTS
} from '../../utils/constants';
import { upload, compareAndDelete } from '../../utils/file-utils';
import { getServerTimeInMilliseconds } from '../../utils/firebase';

export const addProject = (values) => {
  return async (dispatch, getState) => {
    const {
      attachments,
      name,
      description,
      customer,
      vendors,
      owners,
      status,
      reminder,
      value
    } = values;
    const { authUser } = getState().authState;
    const newProject = new Project({
      //The rest of .actions will be filled out in the model when you .save()
      actions: [{ actionType: status.name }],
      attachments: [],
      comments: [],
      customer: {
        customerId: customer.customerId,
        name: customer.name
      },
      description: description.trim(),
      metadata: null,
      name: name.trim(),
      owners: owners.map((owner) => owner.userId),
      reminder: reminder,
      user: authUser.userId,
      value: value,
      vendors: vendors.map((vendor) => ({
        vendorId: vendor.vendorId,
        name: vendor.name
      }))
    });
    try {
      await newProject.save();
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'projects-new',
            collectionId: newProject.projectId,
            folder: newProject.metadata.createdAt.getTime().toString()
          })
        );
      }
      newProject.attachments = uploadedAttachments;
      await newProject.save();
      const message = new Message({
        title: 'Projects',
        body: 'Project added successfully',
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
        title: 'Projects',
        body: 'Failed to add Project',
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

export const editProject = (project, values) => {
  return async (dispatch, getState) => {
    const {
      attachments,
      name,
      description,
      customer,
      vendors,
      owners,
      status,
      reminder,
      value
    } = values;
    const { authUser } = getState().authState;
    //Handle any attachment deletions
    let existingAttachments = attachments.filter(
      (attachment) => !(attachment instanceof File)
    );
    await compareAndDelete({
      oldAttachments: project.attachments,
      newAttachments: existingAttachments,
      collection: 'projects-new',
      collectionId: project.projectId,
      folder: project.metadata.createdAt.getTime().toString()
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
          collection: 'projects-new',
          collectionId: project.projectId,
          folder: project.metadata.createdAt.getTime().toString()
        })
      );
    }

    const newProject = new Project({
      projectId: project.projectId,
      actions: [
        ...project.actions,
        {
          actionType: status.name,
          actionedAt: null,
          actionedBy: authUser.userId
        }
      ],
      attachments: [...existingAttachments, ...uploadedAttachments],
      comments: project.comments,
      customer: {
        customerId: customer.customerId,
        name: customer.name
      },
      description: description.trim(),
      metadata: project.metadata,
      name: name.trim(),
      owners: owners.map((owner) => owner.userId),
      reminder: reminder,
      user: authUser.userId,
      value: value,
      vendors: vendors.map((vendor) => ({
        vendorId: vendor.vendorId,
        name: vendor.name
      }))
    });
    try {
      await newProject.save();
      const message = new Message({
        title: 'Projects',
        body: 'Project updated successfully',
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
        title: 'Projects',
        body: 'Failed to update project',
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

export const addComment = (project, values) => {
  return async (dispatch, _getState) => {
    const newProject = new Project({ ...project });
    const { body, attachments } = values;
    let uploadedAttachments = [];
    try {
      const serverTime = await getServerTimeInMilliseconds();
      if (attachments.length > 0) {
        uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'projects-new',
            collectionId: project.projectId,
            folder: serverTime.toString()
          })
        );
      }
      await newProject.saveComment(
        body.trim(),
        uploadedAttachments,
        serverTime
      );
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Projects',
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
