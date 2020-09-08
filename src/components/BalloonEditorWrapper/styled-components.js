/* eslint-disable no-unused-vars */
import React from 'react';
import styled from 'styled-components';
import { Avatar, Card } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';

export const StyledCkEditorContainer = withTheme(styled(
	({ hover, focus, minHeight, maxHeight, borderChange, ...otherProps }) => (
		<Card {...otherProps} />
	)
)`
	border: ${(props) => {
		let border = '1px solid rgba(0, 0, 0, 0.2)';
		if (props.borderChange) {
			if (props.hover) {
				border = '2px solid rgba(0, 0, 0, 0.87)';
			}
			if (props.focus) {
				border = `2px solid ${props.theme.palette.primary.main};`;
			}
		}
		return border;
	}};
	box-shadow: none;
	padding: 0px 8px;
	transition: border 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
	& div.MuiCardContent-root:last-child {
		padding-bottom: 0;
	}

	& div.ck.ck-editor__editable:not(.ck-editor__nested-editable) {
		border: none;
		box-shadow: none;
		font-size: initial;
		min-height: ${(props) => props.minHeight && `${props.minHeight}px`};
		max-height: ${(props) => props.maxHeight && `${props.maxHeight}px`};
	}
	&:hover {
		cursor: text;
	}
`);
