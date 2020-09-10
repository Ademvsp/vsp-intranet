import styled from 'styled-components';
import { Card, Chip } from '@material-ui/core';

export const StyledCard = styled(Card)`
	width: -webkit-fill-available;
	margin-bottom: 16px;
	.MuiCardContent-root:last-child {
		padding-bottom: 16px;
	}
`;
export const StyledChip = styled(Chip)`
	width: -webkit-fill-available;
	justify-content: flex-start;
`;
