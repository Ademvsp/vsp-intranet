import styled from 'styled-components';
import { Card as MaterialCard } from '@material-ui/core';
import colors from '../../utils/colors';
import Card from '../../components/Card';

export const StyledCalendarContainer = styled(MaterialCard)`
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

export const StyledSidePanelContainer = styled(Card)`
	height: ${window.innerHeight - 200}px;
`;
