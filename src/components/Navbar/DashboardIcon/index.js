import { IconButton, Tooltip } from '@material-ui/core';
import React from 'react';
import AppsIcon from '@material-ui/icons/Apps';
import { useHistory } from 'react-router-dom';

const DashBoardIcon = (props) => {
  const { push } = useHistory();
  return (
    <Tooltip title='Dashboard'>
      <IconButton
        edge='start'
        color='inherit'
        onClick={() => push('/dashboard')}
      >
        <AppsIcon />
      </IconButton>
    </Tooltip>
  );
};

export default DashBoardIcon;
