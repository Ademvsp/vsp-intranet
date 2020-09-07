import styled from 'styled-components';
import { Card } from '@material-ui/core';

export const StyledPageContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 50%;
`;

export const StyledCard = styled(Card)`
	width: -webkit-fill-available;
	margin-bottom: 16px;
`;
