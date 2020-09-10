import styled from 'styled-components';
import { Container } from '@material-ui/core';

export const StyledPageContainer = styled(Container)`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: ${(props) => (props.width ? props.width : '50')}%;
	@media (max-width: 767px) {
		width: 100%;
	}
	@media (min-width: 768px) and (max-width: 1024px) {
		width: ${(props) => (props.width ? (props.width + 100) / 2 : '75')}%;
	}
`;
