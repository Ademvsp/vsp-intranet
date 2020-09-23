import styled from 'styled-components';
import { CardContent, Stepper } from '@material-ui/core';
import Card from '../../components/Card';

export const StyledChildContainer = styled.div`
	margin: 10px;
`;

export const StyledCard = styled(Card)`
	width: 400px;
`;

export const StyledContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	& .MuiFormControl-root {
		width: -webkit-fill-available;
	}
`;

export const StyledCardContent = styled(CardContent)`
	height: -webkit-fill-available;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	& .MuiFormControl-root {
		width: -webkit-fill-available;
	}
`;

export const StyledSpinnerContainer = styled.div`
	display: flex;
	flex-grow: 1;
	align-items: center;
`;

export const StyledButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	width: -webkit-fill-available;
	margin-top: 10px;
	& .MuiButton-root {
		margin-left: 10px;
	}
`;

export const StyledStepper = styled(Stepper)`
	background-color: inherit;
`;
