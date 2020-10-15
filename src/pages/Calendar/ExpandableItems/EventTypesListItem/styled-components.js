import styled from 'styled-components';
import { Switch } from '@material-ui/core';

export const StyledSwitch = styled(Switch)`
	& .MuiSwitch-colorSecondary.Mui-checked {
		color: ${(props) => props.colors.main};
	}
	& span.MuiSwitch-track {
		background-color: ${(props) => props.colors.light};
	}
	& span.MuiSwitch-colorSecondary.Mui-checked + span.MuiSwitch-track {
		background-color: ${(props) => props.colors.dark};
	}
`;
