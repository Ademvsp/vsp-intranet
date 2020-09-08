import React from 'react';
import styled from 'styled-components';
import {
	Input,
	DialogContent,
	Card,
	CardContent,
	CardActions,
	Button,
	Snackbar,
	Container,
	Grid
} from '@material-ui/core';

export const StyledPageContainer = styled(Container)`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 50%;
	padding: 0;
	@media (max-width: 767px) {
		width: 100%;
	}
	@media (min-width: 768px) and (max-width: 1024px) {
		width: 75%;
	}
`;

export const StyledButton = styled(Button)`
	width: 100%;
	margin-bottom: 10px;
`;

export const StyledInput = styled(Input)`
	&.MuiInput-underline.Mui-error:after {
		border-bottom-color: #e57373;
	}
`;

export const StyledDialogContent = styled(DialogContent)`
	width: 400px;
`;

export const StyledCard = styled(Card)`
	min-width: 400px;
`;

export const StyledCardContent = styled(CardContent)`
	display: flex;
	flex-direction: column;
`;

export const StyledCardActions = styled(CardActions)`
	display: flex;
	flex-direction: column;
	& > :not(:first-child) {
		margin-left: 0;
	}
`;

// eslint-disable-next-line no-unused-vars
export const StyledSnackbar = styled(({ hover, ...otherProps }) => (
	<Snackbar {...otherProps} />
))`
	&:hover {
		cursor: ${(props) => (props.hover ? 'pointer' : 'default')};
	}
`;

export const StyledCkEditorContainer = styled(Card)`
	border: 1px solid rgba(0, 0, 0, 0.2);
	box-shadow: none;
	flex-grow: 1;
	padding: 0px 8px;
	margin-bottom: 10px;
	& div.MuiCardContent-root:last-child {
		padding-bottom: 0;
	}
	& div.ck.ck-editor__editable:not(.ck-editor__nested-editable) {
		border: none;
		box-shadow: none;
		font-size: initial;
	}
`;

export const GridFlexGrow = styled(Grid)`
	flex-grow: 1;
`;
