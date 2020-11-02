import Message from '../../models/message';
import Promotion from '../../models/promotion';
import { SET_MESSAGE } from '../../utils/actions';
import { DIALOG } from '../../utils/constants';
import { upload } from '../../utils/file-utils';
import { getServerTimeInMilliseconds } from '../../utils/firebase';

export const addComment = (promotion, values) => {
  return async (dispatch, _getState) => {
    const { body, attachments, notifyUsers } = values;
    const newPromotion = new Promotion({ ...promotion });
    let uploadedAttachments = [];
    try {
      const serverTime = await getServerTimeInMilliseconds();
      if (attachments.length > 0) {
        uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'promotions-new',
            collectionId: promotion.promotionId,
            folder: serverTime.toString()
          })
        );
      }
      await newPromotion.saveComment(
        body.trim(),
        uploadedAttachments,
        notifyUsers,
        serverTime
      );
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Promotions',
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
