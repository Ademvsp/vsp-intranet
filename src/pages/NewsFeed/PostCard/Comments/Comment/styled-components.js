import styled from 'styled-components';
import { ListItem } from '@material-ui/core';

export const StyledListItem = styled(ListItem)`
	display: block;
`;

export const StyledListHeader = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
`;

export const StyledListBody = styled.div`
	overflow-wrap: anywhere;
`;
