import {
  Badge,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Tooltip,
  withTheme
} from '@material-ui/core';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Customer from '../../../models/customer';
import { addComment } from '../../../store/actions/job-document';
import Comments from '../../../components/Comments';
import JobDocument from '../../../models/job-document';
import AttachmentsContainer from '../../../components/AttachmentsContainer';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';
import Avatar from '../../../components/Avatar';

const ViewProjectDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.authState);
  const { users } = useSelector((state) => state.dataState);
  const { open, close, jobDocument } = props;
  const [showComments, setShowComments] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const jobDocumentUser = users.find(
    (user) => user.userId === jobDocument.user
  );

  const initialValues = {
    attachments: jobDocument.attachments,
    notifyUsers: [],
    salesOrder: jobDocument.salesOrder,
    siteReference: jobDocument.siteReference,
    customer: new Customer({ ...jobDocument.customer }),
    body: jobDocument.body
  };

  const dialogCloseHandler = () => {
    if (!commentLoading) {
      close();
    }
  };

  const newCommentHandler = async (values) => {
    setCommentLoading(true);
    const result = await dispatch(addComment(jobDocument, values));
    setCommentLoading(false);
    return result;
  };

  const commentsClickHandler = () => {
    setShowComments((prevState) => !prevState);
  };

  const commentLikeClickHandler = async (reverseIndex) => {
    //Comments get reversed to display newest first, need to switch it back
    const index = jobDocument.comments.length - reverseIndex - 1;
    const newJobDocument = new JobDocument({ ...jobDocument });
    await newJobDocument.toggleCommentLike(index);
  };

  let commentIcon = <CommentOutlinedIcon />;
  const commentUsers = jobDocument.comments.map((comment) => comment.user);
  if (commentUsers.includes(authUser.userId)) {
    commentIcon = <CommentRoundedIcon />;
  }
  const commentToolip = () => {
    const commentUsers = users.filter((user) => {
      const commentUserIds = jobDocument.comments.map(
        (comment) => comment.user
      );
      return commentUserIds.includes(user.userId);
    });
    const tooltip = commentUsers.map((commentUser) => (
      <div key={commentUser.userId}>{commentUser.getFullName()}</div>
    ));
    return tooltip;
  };

  const commentButton = (
    <Button
      style={{ textTransform: 'unset' }}
      size='small'
      color='secondary'
      onClick={commentsClickHandler}
      startIcon={
        <Badge color='secondary' badgeContent={jobDocument.comments.length}>
          {commentIcon}
        </Badge>
      }
    >
      Comment
    </Button>
  );

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Grid container alignItems='center' spacing={1}>
          <Grid item>
            <Avatar user={jobDocumentUser} />
          </Grid>
          <Grid item>View Job Document</Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={1}>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label='Sales Order'
                type='number'
                value={initialValues.salesOrder}
                fullWidth
                readOnly
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='Site Reference'
                value={initialValues.siteReference}
                fullWidth
                readOnly
              />
            </Grid>
          </Grid>
          <Grid item>
            <TextField
              label='Customer'
              value={initialValues.customer.name}
              fullWidth
              readOnly
            />
          </Grid>
          {initialValues.body && (
            <Grid item>
              <TextField
                label='Notes'
                multiline
                rows={5}
                rowsMax={5}
                value={initialValues.body}
                fullWidth
                readOnly
              />
            </Grid>
          )}
          <Grid item>
            <AttachmentsContainer attachments={initialValues.attachments} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Grid item container direction='row' justify='flex-end'>
          <Grid item>
            {jobDocument.comments.length > 0 ? (
              <Tooltip title={commentToolip()}>{commentButton}</Tooltip>
            ) : (
              commentButton
            )}
          </Grid>
        </Grid>
      </DialogActions>
      <Collapse in={showComments} timeout='auto'>
        <Comments
          submitHandler={newCommentHandler}
          comments={[...jobDocument.comments].reverse()}
          actionBarNotificationProps={{
            enabled: true,
            tooltip:
              'The Job Document creator, and all comment participants will be notified automatically'
          }}
          commentLikeClickHandler={commentLikeClickHandler}
        />
      </Collapse>
    </Dialog>
  );
});

export default ViewProjectDialog;
