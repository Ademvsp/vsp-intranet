import styled from 'styled-components';
import { Card } from '@material-ui/core';
import { StyledAvatar as Avatar } from '../../utils/styled-components';

export const StyledChildContainer = styled.div`
	margin: 10px;
`;

export const StyledCard = styled(Card)`
	width: 350px;
`;

export const StyledContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	& .MuiFormControl-root {
		width: -webkit-fill-available;
	}
`;

export const StyledButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	/* width: -webkit-fill-available;
	margin-top: 10px;
	& .MuiButton-root {
		margin-left: 10px;
	} */
`;

export const StyledAvatar = styled(Avatar)`
	margin: auto;
	&:hover {
		cursor: pointer;
		opacity: 0.4;
	}
`;
