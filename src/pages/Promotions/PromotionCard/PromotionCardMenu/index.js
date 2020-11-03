import React, { useState, Fragment } from 'react';
import { Menu, MenuItem, IconButton } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDispatch } from 'react-redux';
import Message from '../../../../models/message';
import {
  SNACKBAR,
  SNACKBAR_VARIANTS,
  SNACKBAR_SEVERITY
} from '../../../../utils/constants';
import { setMessage } from '../../../../store/actions/message';

const PostCardMenu = (props) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    promotion,
    isAdmin,
    setShowEditPromotionDialog,
    setShowDeleteConfirmDialog
  } = props;

  const copyClickHandler = () => {
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

  const editClickHandler = () => {
    setShowEditPromotionDialog(true);
    setAnchorEl(null);
  };

  const deleteClickHandler = () => {
    setShowDeleteConfirmDialog(true);
    setAnchorEl(null);
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
        <CopyToClipboard
          text={`${process.env.REACT_APP_BASE_URL}/promotions/${promotion.promotionId}`}
          onCopy={copyClickHandler}
        >
          <MenuItem>Copy direct link</MenuItem>
        </CopyToClipboard>
        {isAdmin && (
          <MenuItem onClick={editClickHandler}>Edit promotion</MenuItem>
        )}
        {isAdmin && (
          <MenuItem onClick={deleteClickHandler}>Delete promotion</MenuItem>
        )}
      </Menu>
    </Fragment>
  );
};

export default PostCardMenu;
