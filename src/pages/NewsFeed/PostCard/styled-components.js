import styled from 'styled-components';
import {
	Card,
	CardHeader,
	CardContent,
	Button,
	CardActions
} from '@material-ui/core';

export const StyledCard = styled(Card)`
	width: -webkit-fill-available;
	margin-bottom: 30px;
`;

export const StyledCardHeader = styled(CardHeader)`
	padding-bottom: 0;
`;

export const StyledCardContent = styled(CardContent)`
	padding: 0px 16px;
	overflow-wrap: anywhere;
`;

export const StyledCardActions = styled(CardActions)`
	padding-top: 0;
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
