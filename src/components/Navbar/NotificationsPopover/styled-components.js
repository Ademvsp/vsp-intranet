import styled from 'styled-components';
import { List, Typography, withTheme } from '@material-ui/core/';
import { ClearAll } from '@material-ui/icons';

export const StyledTitle = withTheme(styled(Typography)`
	padding: ${(props) => props.theme.spacing(1.5)}px;
`);

export const StyledList = styled(List)`
	padding-top: 0;
	max-height: 400px;
	overflow-y: auto;
`;

export const StyledClearAllIcon = styled(ClearAll)`
	font-size: 2rem;
`;
