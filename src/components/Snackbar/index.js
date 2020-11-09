import React from 'react';
import styled from 'styled-components';
import { Snackbar as MaterialSnackbar } from '@material-ui/core';

// eslint-disable-next-line no-unused-vars
const Snackbar = styled(({ hover, ...otherProps }) => (
  <MaterialSnackbar {...otherProps} />
))`
  &:hover {
    cursor: ${(props) => (props.hover ? 'pointer' : 'default')};
  }
`;
export default Snackbar;
