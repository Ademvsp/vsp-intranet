import { Button, Grid, withTheme } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import {
	APPROVED,
	SUBMITTED
} from '../../../../data/expense-claim-status-types';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ActionStatusChip from '../../../../components/ActionStatusChip';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { useDispatch } from 'react-redux';
import {
	approveExpenseClaim,
	payExpenseClaim,
	rejectExpenseClaim
} from '../../../../store/actions/expense-claim';

const ActionButtons = withTheme((props) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [showApproveDialog, setShowApproveDialog] = useState(false);
	const [showPayDialog, setShowPayDialog] = useState(false);
	const { isAdmin, isManager, user, expenseClaim } = props;

	const action = [...expenseClaim.actions].pop();
	const actionType = action.actionType;

	const rejectClickHandler = () => {
		setShowRejectDialog(true);
	};

	const rejectConfirmHandler = async () => {
		setLoading(true);
		await dispatch(rejectExpenseClaim(expenseClaim));
		setShowRejectDialog(false);
		setLoading(false);
	};

	const approveClickHandler = () => {
		setShowApproveDialog(true);
	};

	const approveConfirmHandler = async () => {
		setLoading(true);
		await dispatch(approveExpenseClaim(expenseClaim));
		setShowApproveDialog(false);
		setLoading(false);
	};

	const payClickHandler = () => {
		setShowPayDialog(true);
	};

	const payConfirmHandler = async () => {
		setLoading(true);
		await dispatch(payExpenseClaim(expenseClaim));
		setShowPayDialog(false);
		setLoading(false);
	};

	return (
		<Fragment>
			<ConfirmDialog
				open={showRejectDialog}
				cancel={() => setShowRejectDialog(false)}
				title='Confirm Rejection'
				message={`Are you sure you want to Reject ${user.firstName}'s Expense Claim?`}
				confirm={rejectConfirmHandler}
				loading={loading}
			/>
			<ConfirmDialog
				open={showApproveDialog}
				cancel={() => setShowApproveDialog(false)}
				title='Confirm Approval'
				message={`Confirm Approval for ${user.firstName}'s Expense Claim?`}
				confirm={approveConfirmHandler}
				loading={loading}
			/>
			<ConfirmDialog
				open={showPayDialog}
				cancel={() => setShowPayDialog(false)}
				title='Confirm Approval'
				message={`Confirm ${user.firstName}'s Expense Claim has been Paid?`}
				confirm={payConfirmHandler}
				loading={loading}
			/>
			<Grid item container direction='column' spacing={1}>
				<Grid item container justify='flex-end'>
					<Grid item>
						<ActionStatusChip action={action} />
					</Grid>
				</Grid>
				<Grid item container justify='flex-end' spacing={1}>
					{actionType === SUBMITTED && isManager && (
						<Fragment>
							<Grid item>
								<Button
									variant='contained'
									color='default'
									startIcon={<ThumbDownAltIcon />}
									onClick={rejectClickHandler}
								>
									Reject
								</Button>
							</Grid>
							<Grid item>
								<Button
									variant='contained'
									color='secondary'
									startIcon={<ThumbUpAltIcon />}
									onClick={approveClickHandler}
								>
									Approve
								</Button>
							</Grid>
						</Fragment>
					)}
					{actionType === APPROVED && isAdmin && (
						<Grid item>
							<Button
								variant='contained'
								color='secondary'
								startIcon={<AttachMoneyIcon />}
								onClick={payClickHandler}
							>
								Mark as Paid
							</Button>
						</Grid>
					)}
				</Grid>
			</Grid>
		</Fragment>
	);
});

export default ActionButtons;
