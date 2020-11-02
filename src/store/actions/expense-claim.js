import {
  APPROVED,
  PAID,
  REJECTED
} from '../../data/expense-claim-status-types';
import ExpenseClaim from '../../models/expense-claim';
import Message from '../../models/message';
import { SET_MESSAGE } from '../../utils/actions';
import {
  DIALOG,
  SNACKBAR,
  SNACKBAR_SEVERITY,
  SNACKBAR_VARIANTS
} from '../../utils/constants';
import { upload } from '../../utils/file-utils';
import { getServerTimeInMilliseconds } from '../../utils/firebase';

export const addExpense = (values) => {
  return async (dispatch, getState) => {
    const { expenses, attachments } = values;
    const { authUser } = getState().authState;

    const newExpenseClaim = new ExpenseClaim({
      attachments: [],
      comments: [],
      expenses: expenses,
      manager: authUser.manager,
      user: authUser.userId
    });

    try {
      await newExpenseClaim.save();
      if (attachments.length > 0) {
        const uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'expense-claims',
            collectionId: newExpenseClaim.expenseClaimId,
            folder: newExpenseClaim.metadata.createdAt.getTime().toString()
          })
        );
        newExpenseClaim.attachments = uploadedAttachments;
        await newExpenseClaim.save();
      }
      const message = new Message({
        title: 'Expense Claims',
        body: 'Expense Claim submitted successfully',
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
        title: 'Expense Claims',
        body: 'Failed to submit Expense Claim',
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

export const addComment = (expenseClaim, values) => {
  return async (dispatch, _getState) => {
    const { body, attachments } = values;
    const newExpenseClaim = new ExpenseClaim({ ...expenseClaim });
    let uploadedAttachments = [];
    try {
      const serverTime = await getServerTimeInMilliseconds();
      if (attachments.length > 0) {
        uploadedAttachments = await dispatch(
          upload({
            files: attachments,
            collection: 'expense-claims',
            collectionId: expenseClaim.expenseId,
            folder: serverTime.toString()
          })
        );
      }
      await newExpenseClaim.saveComment(
        body.trim(),
        uploadedAttachments,
        serverTime
      );
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Expense Claims',
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

export const approveExpenseClaim = (expenseClaim) => {
  return async (dispatch, _getState) => {
    const newExpenseClaim = new ExpenseClaim({ ...expenseClaim });
    try {
      await newExpenseClaim.saveAction(APPROVED);
      const message = new Message({
        title: 'Expense Claims',
        body: 'Expense Claim approved successfully',
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
        title: 'Expense Claims',
        body: 'The Expense Claim failed to approve',
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

export const rejectExpenseClaim = (expenseClaim) => {
  return async (dispatch, _getState) => {
    const newExpenseClaim = new ExpenseClaim({ ...expenseClaim });
    try {
      await newExpenseClaim.saveAction(REJECTED);
      const message = new Message({
        title: 'Expense Claims',
        body: 'Expense Claim rejected successfully',
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
        title: 'Expense Claims',
        body: 'The Expense Claim failed to reject',
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

export const payExpenseClaim = (expenseClaim) => {
  return async (dispatch, _getState) => {
    const newExpenseClaim = new ExpenseClaim({ ...expenseClaim });
    try {
      await newExpenseClaim.saveAction(PAID);
      const message = new Message({
        title: 'Expense Claims',
        body: 'Expense Claim paid successfully',
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
        title: 'Expense Claims',
        body: 'The Expense Claim failed to be paid',
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
