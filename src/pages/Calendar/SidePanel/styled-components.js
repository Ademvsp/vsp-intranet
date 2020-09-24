import styled from 'styled-components';
import { CardContent } from '@material-ui/core';

export const StyledPanelContainer = styled(CardContent)`
	height: ${window.innerHeight - 150}px;
	width: 250px;
	overflow-y: overlay;
`;
