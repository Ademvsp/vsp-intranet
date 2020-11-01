import React, { useState, Fragment } from 'react';
import { Menu, MenuItem, IconButton } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../../../../models/message';
import {
  SNACKBAR,
  SNACKBAR_VARIANTS,
  SNACKBAR_SEVERITY
} from '../../../../utils/constants';
import { setMessage } from '../../../../store/actions/message';
import Event from '../../../../models/event';

const ViewEvent = (props) => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.authState);
  const [anchorEl, setAnchorEl] = useState(null);
  const { event } = props;

  let subscribeText = 'Subsrcibe';
  if (event.subscribers.includes(authUser.userId)) {
    subscribeText = 'Unsubsribe';
  }

  const copyClickHandler = () => {
    const message = new Message({
      title: 'Staff Calendar',
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
    const newEvent = new Event({ ...event });
    await newEvent.toggleSubscribePost();
    const message = new Message({
      title: 'Staff Calendar',
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
        <CopyToClipboard
          text={`${process.env.REACT_APP_BASE_URL}/calendar/${event.eventId}`}
          onCopy={copyClickHandler}
        >
          <MenuItem>Copy direct link</MenuItem>
        </CopyToClipboard>
        <MenuItem onClick={subscribeHandler}>
          {`${subscribeText} to notifications`}
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

export default ViewEvent;
