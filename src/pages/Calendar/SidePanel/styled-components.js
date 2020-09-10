import styled from 'styled-components';
import { CardContent, Button } from '@material-ui/core';

export const StyledPanelContainer = styled(CardContent)`
	height: ${window.innerHeight - 150}px;
	width: 250px;
	overflow-y: overlay;
`;

export const StyledButton = styled(Button)`
	border-radius: 24px;
	width: -webkit-fill-available;
`;
