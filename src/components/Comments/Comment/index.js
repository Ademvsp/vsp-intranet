import React, { useState } from 'react';
import {
  Badge,
  Button,
  Grid,
  ListItemAvatar,
  ListItemText,
  Tooltip
} from '@material-ui/core';
import { format } from 'date-fns';
import InnerHtml from '../../InnerHtml';
import AttachmentsContainer from '../../AttachmentsContainer';
import Avatar from '../../Avatar';
import { useSelector } from 'react-redux';
import { LONG_DATE_TIME } from '../../../utils/date';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import ThumbUpRoundedIcon from '@material-ui/icons/ThumbUpRounded';

const Comment = (props) => {
  const { authUser } = useSelector((state) => state.authState);
  const { users } = useSelector((state) => state.dataState);
  const [loading, setLoading] = useState(false);
  const { comment, commentLikeClickHandler } = props;
  const commentDate = comment.metadata.createdAt.toDate();
  const user = users.find((user) => user.userId === comment.user);

  const likeClickHandler = async () => {
    setLoading(true);
    await commentLikeClickHandler();
    setLoading(false);
  };

  let likeIcon = <ThumbUpOutlinedIcon />;
  if (comment.likes.includes(authUser.userId)) {
    likeIcon = <ThumbUpRoundedIcon />;
  }

  const likeTooltip = () => {
    const likeUsers = users.filter((user) => {
      return comment.likes.includes(user.userId);
    });
    const tooltip = likeUsers.map((likeUser) => (
      <div key={likeUser.userId}>{likeUser.getFullName()}</div>
    ));
    return tooltip;
  };

  const likeButton = (
    <Button
      style={{ textTransform: 'unset' }}
      size='small'
      color='secondary'
      onClick={likeClickHandler}
      disabled={loading}
      startIcon={
        <Badge color='secondary' badgeContent={comment.likes.length}>
          {likeIcon}
        </Badge>
      }
    >
      Like
    </Button>
  );

  return (
    <Grid container direction='column' spacing={1}>
      <Grid item container alignItems='center'>
        <Grid item>
          <ListItemAvatar>
            <Avatar user={user} clickable={true} contactCard={true} />
          </ListItemAvatar>
        </Grid>
        <Grid item>
          <ListItemText
            primary={user.getFullName()}
            secondary={format(commentDate, LONG_DATE_TIME)}
          />
        </Grid>
      </Grid>
      <Grid item>
        <InnerHtml html={comment.body} />
      </Grid>
      <Grid item>
        <AttachmentsContainer attachments={comment.attachments} />
      </Grid>
      <Grid item container justify='flex-end'>
        <Grid item>
          {comment.likes.length > 0 && !loading ? (
            <Tooltip title={likeTooltip()}>{likeButton}</Tooltip>
          ) : (
            likeButton
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Comment;
