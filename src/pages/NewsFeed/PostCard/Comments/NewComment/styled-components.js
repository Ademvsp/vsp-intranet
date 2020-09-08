import styled from 'styled-components';
import { CardActions } from '@material-ui/core';

export const StyledContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
`;

export const StyledCardActions = styled(CardActions)`
	justify-content: flex-end;
	padding: 0;
`;
