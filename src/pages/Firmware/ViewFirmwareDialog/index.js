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
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment } from '../../../store/actions/firmware';
import Comments from '../../../components/Comments';
import Firmware from '../../../models/firmware';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';
import AttachmentsContainer from '../../../components/AttachmentsContainer';
import Avatar from '../../../components/Avatar';

const ViewFirmwareDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.authState);
  const { users } = useSelector((state) => state.dataState);
  const { open, close, firmware } = props;

  const [showComments, setShowComments] = useState(false);

  const [commentLoading, setCommentLoading] = useState(false);

  const firmwareUser = users.find((user) => user.userId === firmware.user);

  const initialValues = {
    attachments: firmware.attachments,
    title: firmware.title,
    products: firmware.products,
    body: firmware.body
  };

  const dialogCloseHandler = () => {
    if (!commentLoading) {
      close();
    }
  };

  const newCommentHandler = async (values) => {
    setCommentLoading(true);
    const result = await dispatch(addComment(firmware, values));
    setCommentLoading(false);
    return result;
  };

  const commentLikeClickHandler = async (reverseIndex) => {
    //Comments get reversed to display newest first, need to switch it back
    const index = firmware.comments.length - reverseIndex - 1;
    const newFirmware = new Firmware({ ...firmware });
    await newFirmware.toggleCommentLike(index);
  };

  const commentsClickHandler = () => {
    setShowComments((prevState) => !prevState);
  };

  let commentIcon = <CommentOutlinedIcon />;
  const commentUsers = firmware.comments.map((comment) => comment.user);
  if (commentUsers.includes(authUser.userId)) {
    commentIcon = <CommentRoundedIcon />;
  }
  const commentToolip = () => {
    const commentUsers = users.filter((user) => {
      const commentUserIds = firmware.comments.map((comment) => comment.user);
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
        <Badge color='secondary' badgeContent={firmware.comments.length}>
          {commentIcon}
        </Badge>
      }
    >
      Comment
    </Button>
  );

  const productRenderInput = (params) => (
    <TextField {...params} label='Products Affected' disabled fullWidth />
  );

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Grid container alignItems='center' spacing={1}>
          <Grid item>
            <Avatar user={firmwareUser} clickable contactCard />
          </Grid>
          <Grid item>View Firmware</Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={1}>
          <Grid item>
            <TextField
              label='Title'
              fullWidth
              value={initialValues.title}
              readOnly
              autoFocus
            />
          </Grid>
          <Grid item>
            <Autocomplete
              filterSelectedOptions
              multiple
              options={[]}
              getOptionLabel={(option) => option}
              getOptionSelected={(option, value) => option === value}
              value={initialValues.products}
              renderInput={productRenderInput}
              readOnly
            />
          </Grid>
          {initialValues.body && (
            <Grid item>
              <TextField
                label='Release Notes'
                multiline
                rows={5}
                rowsMax={5}
                fullWidth
                value={initialValues.body}
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
            {firmware.comments.length > 0 ? (
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
          comments={[...firmware.comments].reverse()}
          actionBarNotificationProps={{
            enabled: true,
            tooltip:
              'The Firmware creator, and all comment participants will be notified automatically'
          }}
          commentLikeClickHandler={commentLikeClickHandler}
        />
      </Collapse>
    </Dialog>
  );
});

export default ViewFirmwareDialog;
