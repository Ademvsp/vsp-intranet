import React from 'react';
import styled from 'styled-components';
import { Typography, Toolbar, withTheme } from '@material-ui/core/';
import MenuIcon from '@material-ui/icons/Menu';

// eslint-disable-next-line no-unused-vars
export const StyledToolbar = withTheme(styled(({ authUser, ...otherProps }) => (
	<Toolbar {...otherProps} />
))`
	min-height: ${(props) => props.theme.spacing(10.5)}px;
`);

export const StyledMenuIcon = styled(MenuIcon)`
	font-size: 48px;
`;

export const StyledTitle = styled(Typography)`
	flex-grow: 1;
	text-align: center;
	font-weight: 500;
	position: absolute;
	left: 0;
	right: 0;
	margin: auto;
	width: fit-content;
	&:hover {
		cursor: pointer;
	}
`;
