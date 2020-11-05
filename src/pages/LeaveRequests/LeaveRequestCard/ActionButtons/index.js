import { Button, Grid, withTheme } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { REQUESTED } from '../../../../data/leave-request-status-types';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ActionStatusChip from '../../../../components/ActionStatusChip';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { useDispatch } from 'react-redux';
import {
  approveLeaveRequest,
  rejectLeaveRequest
} from '../../../../store/actions/leave-request';

const ActionButtons = withTheme((props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const { isManager, user, leaveRequest } = props;

  const action = [...leaveRequest.actions].pop();
  const actionType = action.actionType;

  const rejectClickHandler = () => {
    setShowRejectDialog(true);
  };

  const rejectConfirmHandler = async () => {
    setLoading(true);
    await dispatch(rejectLeaveRequest(leaveRequest));
    setShowRejectDialog(false);
    setLoading(false);
  };

  const approveClickHandler = () => {
    setShowApproveDialog(true);
  };

  const approveConfirmHandler = async () => {
    setLoading(true);
    await dispatch(approveLeaveRequest(leaveRequest));
    setShowApproveDialog(false);
    setLoading(false);
  };

  return (
    <Fragment>
      <ConfirmDialog
        open={showRejectDialog}
        cancel={() => setShowRejectDialog(false)}
        title='Confirm Rejection'
        message={`Are you sure you want to Reject ${user.firstName}'s ${leaveRequest.type} Request?`}
        confirm={rejectConfirmHandler}
        loading={loading}
      />
      <ConfirmDialog
        open={showApproveDialog}
        cancel={() => setShowApproveDialog(false)}
        title='Confirm Approval'
        message={`Confirm Approval for ${user.firstName}'s ${leaveRequest.type} Request?`}
        confirm={approveConfirmHandler}
        loading={loading}
      />
      <Grid item container direction='column' spacing={1}>
        <Grid item container justify='flex-end'>
          <Grid item>
            <ActionStatusChip action={action} />
          </Grid>
        </Grid>
        {actionType === REQUESTED && isManager && (
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
