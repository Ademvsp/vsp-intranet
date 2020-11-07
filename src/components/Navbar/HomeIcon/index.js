import { IconButton, Tooltip } from '@material-ui/core';
import React from 'react';
import HomeIcon from '@material-ui/icons/Home';
import { useHistory } from 'react-router-dom';

const DashBoardIcon = (props) => {
  const { push } = useHistory();
  return (
    <Tooltip title='Home'>
      <IconButton
        edge='start'
        color='inherit'
        onClick={() => push('/dashboard')}
      >
        <HomeIcon />
      </IconButton>
    </Tooltip>
  );
};

export default DashBoardIcon;
