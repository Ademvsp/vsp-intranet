import { Button, Grid, withTheme } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { REQUESTED } from '../../../../data/product-request-status-types';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import StatusChip from './StatusChip';
import RejectDialog from '../../../../components/ConfirmDialog';
import ApproveDialog from './ApproveDialog';
import { useDispatch } from 'react-redux';
import * as productRequestController from '../../../../controllers/product-request';

const ActionButtons = withTheme((props) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [showApproveDialog, setShowApproveDialog] = useState(false);
	const { isAdmin, productRequest } = props;
	const action = [...productRequest.actions].pop();
	const actionType = action.actionType;

	const rejectClickHandler = () => {
		setShowRejectDialog(true);
	};

	const rejectConfirmHandler = async () => {
		setLoading(true);
		const result = await dispatch(
			productRequestController.rejectProductRequest(productRequest)
		);
		if (result) {
			setShowRejectDialog(false);
		}
		setLoading(false);
	};

	const approveClickHandler = () => {
		setShowApproveDialog(true);
	};

	const approveConfirmHandler = async (values) => {
		setLoading(true);
		const result = await dispatch(
			productRequestController.approveProductRequest(productRequest, values)
		);
		if (result) {
			setShowApproveDialog(false);
		}
		setLoading(false);
	};

	return (
		<Fragment>
			<RejectDialog
				open={showRejectDialog}
				cancel={() => setShowRejectDialog(false)}
				title='Confirm Rejection'
				message={`Are you sure you want to reject ${productRequest.vendorSku}`}
				confirm={rejectConfirmHandler}
				loading={loading}
			/>
			<ApproveDialog
				open={showApproveDialog}
				cancel={() => setShowApproveDialog(false)}
				title='Confirm Approval'
				confirm={approveConfirmHandler}
				loading={loading}
			/>
			<Grid item container direction='column' spacing={1}>
				<Grid item container justify='flex-end'>
					<Grid item>
						<StatusChip action={action} />
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
