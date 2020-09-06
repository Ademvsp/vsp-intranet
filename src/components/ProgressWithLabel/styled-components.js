import styled from 'styled-components';

export const StyledProgressContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	& .MuiLinearProgress-root {
		flex-grow: 1;
		margin-right: 10px;
	border-radius: 10px;
	}
`;