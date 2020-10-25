import { Button, Grid, withTheme } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { REQUESTED } from '../../../../data/leave-request-status-types';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ActionStatusChip from '../../../../components/ActionStatusChip';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { useDispatch } from 'react-redux';

const ActionButtons = withTheme((props) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [showApproveDialog, setShowApproveDialog] = useState(false);
	const { isAdmin, user, leaveRequest } = props;

	const action = [...leaveRequest.actions].pop();
	const actionType = action.actionType;

	const rejectClickHandler = () => {
		setShowRejectDialog(true);
	};

	const rejectConfirmHandler = async () => {
		setLoading(true);
		// const result = await dispatch(
		// 	leaveRequestController.rejectProductRequest(leaveRequest)
		// );
		// if (result) {
		// 	setShowRejectDialog(false);
		// }
		setLoading(false);
	};

	const approveClickHandler = () => {
		setShowApproveDialog(true);
	};

	const approveConfirmHandler = async (values) => {
		setLoading(true);
		// const result = await dispatch(
		// 	leaveRequestController.approveProductRequest(leaveRequest, values)
		// );
		// if (result) {
		// 	setShowApproveDialog(false);
		// }
		setLoading(false);
	};

	return (
		<Fragment>
			<ConfirmDialog
				open={showRejectDialog}
				cancel={() => setShowRejectDialog(false)}
				title='Confirm Rejection'
				message={`Are you sure you want to reject ${user.firstName}'s ${leaveRequest.type} request?`}
				confirm={rejectConfirmHandler}
				loading={loading}
			/>
			<ConfirmDialog
				open={showApproveDialog}
				cancel={() => setShowApproveDialog(false)}
				title='Confirm Rejection'
				message={`Confirm approval for ${user.firstName}'s ${leaveRequest.type} request?`}
				confirm={approveConfirmHandler}
				loading={loading}
			/>
			<Grid item container direction='column' spacing={1}>
				<Grid item container justify='flex-end'>
					<Grid item>
						<ActionStatusChip action={action} />
					</Grid>
				</Grid>
				{actionType === REQUESTED && isAdmin && (
					<Grid item container justify='flex-end' spacing={1}>
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
					</Grid>
				)}
			</Grid>
		</Fragment>
	);
});

export default ActionButtons;
