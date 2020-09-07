import styled from 'styled-components';
import { Card, CardMedia } from '@material-ui/core';

export const StyledInnerContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

export const StyledCard = styled(Card)`
	display: flex;
	flex-direction: row;
`;

export const StyledCardMedia = styled(CardMedia)`
	width: 200px;
`;

export const StyledLink = styled.a`
	text-decoration: none;
	color: inherit;
`;
