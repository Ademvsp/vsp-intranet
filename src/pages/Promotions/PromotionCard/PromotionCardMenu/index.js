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
  const { promotion, isAdmin } = props;

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
          <MenuItem>Copy Direct Link</MenuItem>
        </CopyToClipboard>
        {isAdmin && <MenuItem onClick={() => {}}>Edit Promotion</MenuItem>}
        {isAdmin && <MenuItem onClick={() => {}}>Delete Promotion</MenuItem>}
      </Menu>
    </Fragment>
  );
};

export default PostCardMenu;
