import styled from 'styled-components';
import { Card, CardActions, CardContent } from '@material-ui/core';

export const StyledContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
`;

export const StyledCard = styled(Card)`
	border: 1px solid rgba(0, 0, 0, 0.2);
	box-shadow: none;
	flex-grow: 1;
	padding: 0;
	margin-bottom: 10px;
	& div.MuiCardContent-root:last-child {
		padding-bottom: 0;
	}
`;

export const StyledCardContent = styled(CardContent)`
	padding: 0px 8px;
	& div.ck.ck-editor__editable:not(.ck-editor__nested-editable) {
		border: none;
		box-shadow: none;
	}
`;

export const StyledCardActions = styled(CardActions)`
	justify-content: flex-end;
	padding: 0;
`;

export const StyledTextAreaContainer = styled.div`
	flex-grow: 1;
`;
