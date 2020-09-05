import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardContent, Button } from '@material-ui/core';

export const StyledCard = styled(Card)`
	width: -webkit-fill-available;
	margin-bottom: 30px;
`;

// eslint-disable-next-line no-unused-vars
export const StyledCardHeader = styled(({ skeleton, ...otherProps }) => (
	<CardHeader {...otherProps} />
))`
	padding-bottom: 0;
	& span.MuiCardHeader-title > span.MuiSkeleton-text {
		margin-bottom: ${(props) => props.skeleton && '10px'};
	}
`;

// eslint-disable-next-line no-unused-vars
export const StyledCardContent = styled(({ skeleton, ...otherProps }) => (
	<CardContent {...otherProps} />
))`
	padding: ${(props) => !props.skeleton && '0px 16px'};
	overflow-wrap: anywhere;
`;

export const StyledAttachmentsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	& a.MuiChip-root {
		margin-bottom: 5px;
	}
`;

export const StyledCardActions = styled(CardContent)`
	padding-top: 0;
	display: flex;
	justify-content: space-between;
	padding: 0px 16px 16px 16px;
	& span.MuiTypography-root {
		font-size: 13px;
	}
`;

export const StyledButton = styled(Button)`
	text-transform: unset;
`;

// export const StyledButtonContainer = styled.div`
// 	display: flex;
// 	flex-direction: row;
// 	justify-content: flex-end;
// 	width: -webkit-fill-available;
// 	margin-top: 10px;
// 	& .MuiButton-root {
// 		margin-left: 10px;
// 	}
// `;

// export const StyledStepper = styled(Stepper)`
// 	background-color: inherit;
// `;
