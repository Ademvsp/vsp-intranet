import { Fab, Tooltip, withTheme } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

export const StyledFab = withTheme(styled(Fab)`
	position: fixed;
	bottom: ${(props) => props.theme.spacing(2)}px;
	right: ${(props) => props.theme.spacing(2)}px;
`);

const FloatingActionButton = (props) => {
	return (
		<Tooltip title={props.tooltip}>
			<StyledFab {...props}>{props.children}</StyledFab>
		</Tooltip>
	);
};

export default FloatingActionButton;
