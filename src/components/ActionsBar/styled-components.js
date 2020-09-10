import styled from 'styled-components';
import { CircularProgress } from '@material-ui/core';

export const StyledButtonContainer = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 12px;
`;

export const StyledButtonProgress = styled(CircularProgress)`
	position: absolute;
`;
