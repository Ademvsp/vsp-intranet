import { Container } from '@material-ui/core';
import styled from 'styled-components';
import { withTheme } from '@material-ui/core/styles';

export const StyledListContainer = withTheme(styled(Container)`
	padding-top: ${(props) => props.theme.spacing(2)}px;
	padding-bottom: ${(props) => props.theme.spacing(2)}px;
	padding-left: ${(props) => props.theme.spacing(1)}px;
	padding-right: ${(props) => props.theme.spacing(1)}px;
	width: 300px;
`);
