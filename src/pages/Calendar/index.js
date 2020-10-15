import React, { createContext, useState, useEffect, Fragment } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Grid, Container, Button, CardContent } from '@material-ui/core';
import ExpandableItems from './ExpandableItems';
import CalendarContainer from './CalendarContainer';
import { useSelector } from 'react-redux';
import eventTypes from '../../utils/event-types';
import { Add as AddIcon } from '@material-ui/icons';
import NewEventDialog from './NewEventDialog';
import { StyledCalendarCard, StyledSidePanelCard } from './styled-components';
import WorkFromHomeSwitch from './WorkFromHomeSwitch';
import { Skeleton } from '@material-ui/lab';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import ViewEventDialog from './ViewEventDialog';
import EditEventDialog from './EditEventDialog';
import Event from '../../models/event';

export const EventContext = createContext();

const Calendar = (props) => {
	const history = useHistory();
	const location = useLocation();
	const { events } = useSelector((state) => state.dataState);
	const { authUser } = useSelector((state) => state.authState);
	const [newEventPrefillData, setNewEventPrefillData] = useState();
	const [showAddEventDialog, setShowAddEventDialog] = useState(false);
	const [filteredEvents, setFilteredEvents] = useState();
	const [selectedLocations, setSelectedLocations] = useState([
		authUser.location
	]);
	const [selectedEventTypes, setSelectedEventTypes] = useState(
		eventTypes.map((eventType) => eventType.eventTypeId)
	);
	const [showViewEventDialog, setShowViewEventDialog] = useState(false);
	const [showEditEventDialog, setShowEditEventDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState();

	useEffect(() => {
		if (events) {
			const newFilteredEvents = [];
			events.forEach((event) => {
				const locationMatch = event.locations.some((eventLocation) =>
					selectedLocations.includes(eventLocation)
				);
				const eventTypeMatch = selectedEventTypes.includes(event.type);
				if (locationMatch && eventTypeMatch) {
					newFilteredEvents.push(event);
				}
				setFilteredEvents(newFilteredEvents);
			});
		}
	}, [events, selectedLocations, selectedEventTypes]);

	useEffect(() => {
		const asyncFunction = async () => {
			if (location.pathname === '/calendar/event') {
				const { eventId } = queryString.parse(location.search);
				if (eventId) {
					const event = await Event.get(eventId);
					if (event) {
						setSelectedEvent(event);
						if (event.user === authUser.userId) {
							setShowEditEventDialog(true);
						} else {
							setShowViewEventDialog(true);
						}
					} else {
						history.push('/calendar');
					}
				} else {
					history.push('/calendar');
				}
			}
		};

		asyncFunction();
	}, [location.pathname, location.search, history, authUser.userId]);

	const addEventClickHandler = () => {
		setNewEventPrefillData(null);
		setShowAddEventDialog(true);
	};

	const closeDialogHandler = () => {
		setSelectedEvent(null);
		setShowEditEventDialog(false);
		history.replace('/calendar');
	};

	const skeleton = (
		<Grid container direction='column' spacing={1}>
			<Grid item>
				<Skeleton animation='pulse' variant='rect' height={40} />
			</Grid>
			<Grid item>
				<Skeleton animation='pulse' variant='rect' height={20} />
			</Grid>
		</Grid>
	);

	return (
		<EventContext.Provider
			value={{
				selectedLocations,
				setSelectedLocations,
				selectedEventTypes,
				setSelectedEventTypes
			}}
		>
			{showAddEventDialog && (
				<NewEventDialog
					open={showAddEventDialog}
					close={() => setShowAddEventDialog(false)}
					newEventPrefillData={newEventPrefillData}
				/>
			)}
			{selectedEvent && (
				<Fragment>
					<ViewEventDialog
						open={showViewEventDialog}
						close={closeDialogHandler}
						event={selectedEvent}
					/>
					<EditEventDialog
						open={showEditEventDialog}
						close={closeDialogHandler}
						event={selectedEvent}
					/>
				</Fragment>
			)}
			<Container disableGutters maxWidth='xl'>
				<Grid container direction='row' spacing={1} justify='center'>
					<Grid item>
						<StyledCalendarCard elevation={2}>
							<CalendarContainer
								events={filteredEvents}
								setShowAddEventDialog={setShowAddEventDialog}
								setNewEventPrefillData={setNewEventPrefillData}
							/>
						</StyledCalendarCard>
					</Grid>
					<Grid item>
						<StyledSidePanelCard elevation={2}>
							<CardContent>
								<Grid container direction='column' spacing={1}>
									{filteredEvents ? (
										<Fragment>
											<Grid item>
												<Button
													fullWidth
													variant='contained'
													color='primary'
													startIcon={<AddIcon />}
													size='large'
													onClick={addEventClickHandler}
												>
													Add event
												</Button>
											</Grid>
											<Grid item>
												<WorkFromHomeSwitch />
											</Grid>
										</Fragment>
									) : (
										skeleton
									)}
									<Grid item>
										<ExpandableItems />
									</Grid>
								</Grid>
							</CardContent>
						</StyledSidePanelCard>
					</Grid>
				</Grid>
			</Container>
		</EventContext.Provider>
	);
};

export default Calendar;
