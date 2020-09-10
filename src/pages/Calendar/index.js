import React, { createContext, useState, useEffect } from 'react';
import PageContainer from '../../components/PageContainer';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Grid, CardHeader } from '@material-ui/core';
import Panel from './SidePanel';
import CalendarContainer from './CalendarContainer';
import { useSelector } from 'react-redux';
import eventTypes from '../../utils/event-types';
import { StyledButton } from './SidePanel/styled-components';
import { Add as AddIcon } from '@material-ui/icons';
import AddEventDialog from './NewEventDialog';
import {
	StyledCalendarContainer,
	StyledSidePanelContainer
} from './styled-components';

export const EventContext = createContext();

const Calendar = (props) => {
	const { events } = useSelector((state) => state.dataState);
	const { authUser } = useSelector((state) => state.authState);
	const [showAddEventDialog, setShowAddEventDialog] = useState(false);
	const [filteredEvents, setFilteredEvents] = useState();
	const [selectedLocations, setSelectedLocations] = useState([
		authUser.location
	]);
	const [selectedEventTypes, setSelectedEventTypes] = useState(
		eventTypes.map((eventType) => eventType.eventTypeId)
	);

	useEffect(() => {
		if (events) {
			const newFilteredEvents = [];
			events.forEach((event) => {
				const locationMatch = event.locations.some((eventLocation) => {
					return selectedLocations.includes(eventLocation);
				});
				const eventTypeMatch = selectedEventTypes.includes(event.type);
				if (locationMatch && eventTypeMatch) {
					newFilteredEvents.push(event);
				}
				setFilteredEvents(newFilteredEvents);
			});
		}
	}, [events, selectedLocations, selectedEventTypes]);

	return (
		<EventContext.Provider
			value={{
				selectedLocations,
				setSelectedLocations,
				selectedEventTypes,
				setSelectedEventTypes
			}}
		>
			<PageContainer width={100}>
				<Grid container direction='row' spacing={1} justify='center'>
					<Grid item>
						<StyledCalendarContainer elevation={2}>
							<CalendarContainer events={filteredEvents} />
						</StyledCalendarContainer>
					</Grid>
					<Grid item>
						<StyledSidePanelContainer
							headerPadding='16px 16px 0 16px'
							contentPadding='0 16px'
							elevation={2}
						>
							<CardHeader
								title={
									<StyledButton
										variant='contained'
										color='primary'
										startIcon={<AddIcon />}
										size='large'
										onClick={() => setShowAddEventDialog(true)}
									>
										Add event
									</StyledButton>
								}
							/>
							<AddEventDialog
								open={showAddEventDialog}
								close={() => setShowAddEventDialog(false)}
							/>
							<Panel />
						</StyledSidePanelContainer>
					</Grid>
				</Grid>
			</PageContainer>
		</EventContext.Provider>
	);
};

export default Calendar;
