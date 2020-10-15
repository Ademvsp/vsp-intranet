import styled from 'styled-components';
import { List } from '@material-ui/core';

export const StyledList = styled(List)`
	height: ${window.innerHeight - 361}px;
	/* width: 300px; */
	overflow: auto;
`;
