/* eslint-disable no-unused-vars */
import React from 'react';
import styled from 'styled-components';
import { Avatar } from '@material-ui/core';
import * as colors from '../../utils/colors';

const FONT_SIZE = 2; //rem
const WIDTH = 64; //px
const HEIGHT = 64; //px

// eslint-disable-next-line no-unused-vars
export const StyledAvatar = styled(
	({
		darkMode,
		clickable,
		contactCard,
		iconFallback,
		customFallback,
		...otherProps
	}) => <Avatar {...otherProps} />
)`
	width: ${(props) => WIDTH * props.size}px;
	height: ${(props) => HEIGHT * props.size}px;
	font-size: ${(props) => FONT_SIZE * props.size}rem;
	background-color: ${(props) =>
		props.dark
			? colors.default.secondary.light
			: colors.default.secondary.dark};
	&:hover {
		cursor: ${(props) => props.clickable && 'pointer'};
	}
`;
