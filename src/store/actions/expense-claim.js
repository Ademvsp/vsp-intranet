import ExpenseClaim from '../../models/expense-claim';
import Message from '../../models/message';
import { SET_MESSAGE } from '../../utils/actions';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../../utils/constants';
import * as fileUtils from '../../utils/file-utils';

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
					fileUtils.upload({
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
