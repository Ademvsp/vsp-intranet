import styled from 'styled-components';
import { Paper } from '@material-ui/core';

export const StyledInnerContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

export const StyledPaper = styled(Paper)`
	width: 450px;
`;

export const StyledLink = styled.a`
	text-decoration: none;
	color: inherit;
`;
