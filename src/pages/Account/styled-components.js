import styled from 'styled-components';

export const StyledChildContainer = styled.div`
	margin: 10px;
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
`;
