import styled from 'styled-components';
import {
	ListItem,
	DialogContent,
	ListItemText,
	DialogTitle
} from '@material-ui/core';

export const StyledListItemText = styled(ListItemText)`
	text-align: end;
`;

export const StyledListItem = styled(ListItem)`
	padding-left: 0;
	&:hover {
		cursor: pointer;
	}
`;

export const StyledTitleListItem = styled(ListItem)`
	padding-left: 0;
`;

export const StyledDialogTitle = styled(DialogTitle)`
	padding: 0 24px;
`;

export const StyledDialogContent = styled(DialogContent)`
	max-height: 300px;
	width: 400px;
	@media (min-width: 768px) and (max-width: 1024px) {
		width: 400px;
	}
	@media (max-width: 767px) {
		width: unset;
	}
	overflow-y: overlay;
`;
