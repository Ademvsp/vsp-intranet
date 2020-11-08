import React, { useState, Fragment } from 'react';
import { Menu, MenuItem, IconButton } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../../../../models/message';
import {
  SNACKBAR,
  SNACKBAR_VARIANTS,
  SNACKBAR_SEVERITY
} from '../../../../utils/constants';
import { setMessage } from '../../../../store/actions/message';
import Post from '../../../../models/post';

const PostCardMenu = (props) => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.authState);
  const [anchorEl, setAnchorEl] = useState(null);
  const { post } = props;

  let subscribeText = 'Subsrcibe';
  if (post.subscribers.includes(authUser.userId)) {
    subscribeText = 'Unsubsribe';
  }

  const copyClickHandler = () => {
    navigator.clipboard.writeText(
      `${process.env.REACT_APP_BASE_URL}/newsfeed/${post.postId}`
    );
    const message = new Message({
      title: 'News Feed',
      body: 'Link copied to clipboard',
      feedback: SNACKBAR,
      options: {
        duration: 2000,
        variant: SNACKBAR_VARIANTS.FILLED,
        severity: SNACKBAR_SEVERITY.INFO
      }
    });
    dispatch(setMessage(message));
    setAnchorEl(null);
  };

  const subscribeHandler = async () => {
    setAnchorEl(null);
    const newPost = new Post({ ...post });
    await newPost.toggleSubscribePost();
    const message = new Message({
      title: 'News Feed',
      body: `${subscribeText}d successfully`,
      feedback: SNACKBAR,
      options: {
        duration: 2000,
        variant: SNACKBAR_VARIANTS.FILLED,
        severity: SNACKBAR_SEVERITY.INFO
      }
    });
    dispatch(setMessage(message));
  };
  return (
    <Fragment>
      <IconButton
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted={true}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={copyClickHandler}>Copy Direct Link</MenuItem>
        <MenuItem onClick={subscribeHandler}>
          {`${subscribeText} to notifications`}
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

export default PostCardMenu;
