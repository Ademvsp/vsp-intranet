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

export const addPost = (values) => {
  return async (dispatch, getState) => {
    const { attachments, notifyUsers, title, body } = values;
    const { authUser } = getState().authState;
    const newPost = new Post({
      //The rest of .actions will be filled out in the model
      actions: [{ notifyUsers: notifyUsers }],
      attachments: [],
      body: body.trim(),
      comments: [],
      likes: [],
      metadata: null,
      subscribers: [authUser.userId],
      title: title.trim(),
      user: authUser.userId
    });
    try {
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

export const addComment = (post, values) => {
  return async (dispatch, _getState) => {
    const newPost = new Post({ ...post });
    const { body, attachments, notifyUsers } = values;
    let uploadedAttachments = [];
    try {
      const serverTime = await getServerTimeInMilliseconds();
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
      await newPost.saveComment(
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
