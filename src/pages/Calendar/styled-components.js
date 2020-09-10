import styled from 'styled-components';
import { Card } from '@material-ui/core';
import colors from '../../utils/colors';
import { StyledCard } from '../../utils/styled-components';

export const StyledCalendarContainer = styled(Card)`
	padding: 16px;
	width: ${(window.innerHeight - 200) * 1.5}px;
	height: ${window.innerHeight - 200}px;
	& div.rbc-month-view {
		border-radius: 4px;
	}
	& div.rbc-event-content,
	& a.rbc-show-more {
		font-size: smaller;
	}
	& table.rbc-agenda-table td {
		color: ${colors.agendaText};
	}
`;

export const StyledSidePanelContainer = styled(StyledCard)`
	height: ${window.innerHeight - 200}px;
`;
