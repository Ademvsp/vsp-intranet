import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as eventController from '../../../controllers/event';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import {
	format,
	parse,
	startOfWeek,
	getDay,
	startOfMonth,
	sub,
	add
} from 'date-fns';
import { Skeleton } from '@material-ui/lab';
import { Grid } from '@material-ui/core';
import colors from '../../../utils/colors';
import { useHistory } from 'react-router-dom';

const locales = {
	'en-AU': import('date-fns/locale/en-AU')
};
const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales
});

const CalendarContainer = (props) => {
	const history = useHistory();
	const [transformedEvents, setTransformedEvents] = useState();
	const { locations, users } = useSelector((state) => state.dataState);
	// const dispatch = useDispatch();
	// const [range, setRange] = useState(initalRange);
	const {
		setNewEventPrefillData,
		setShowAddEventDialog,
		range,
		setRange
	} = props;

	useEffect(() => {
		if (props.events) {
			const newTransformedEvents = props.events.map((event) => {
				const title = eventController.getReadableTitle(
					{
						details: event.details,
						type: event.type,
						user: event.user
					},
					users
				);
				return {
					...event,
					title,
					start: event.start,
					end: event.end
				};
			});
			setTransformedEvents(newTransformedEvents);
		}
	}, [props.events, users]);

	// useEffect(() => {
	// 	dispatch(eventController.subscribeEventsListener(range.start, range.end));
	// 	return () => {
	// 		eventController.unsubscribeEventsListener();
	// 	};
	// }, [range, dispatch]);

	const navigateChangeHandler = (event) => {
		const startOfEventMonth = startOfMonth(event);
		const start = sub(startOfEventMonth, { months: 1 });
		const end = add(startOfEventMonth, { months: 1 });
		if (startOfEventMonth.valueOf() !== range.startOfMonth.valueOf()) {
			setRange({ startOfMonth, start, end });
		}
	};

	const eventPropGetterHandler = (event) => {
		const eventLocation = locations.find(
			(location) => location.locationId === event.locations[0]
		);
		let backgroundColor = eventLocation.colors.main;
		if (event.locations.length > 1) {
			backgroundColor = colors.globalEvent;
		}
		return {
			style: {
				backgroundColor
			}
		};
	};

	const selectSlotHandler = (event) => {
		setNewEventPrefillData({ start: event.start, end: event.end });
		setShowAddEventDialog(true);
	};

	if (!transformedEvents) {
		return (
			<Grid container direction='column'>
				<Grid container item direction='row' justify='space-between'>
					<Grid item>
						<Skeleton animation='pulse' height={50} width={200} />
					</Grid>
					<Grid item>
						<Skeleton animation='pulse' height={50} width={200} />
					</Grid>
					<Grid item>
						<Skeleton animation='pulse' height={50} width={200} />
					</Grid>
				</Grid>
				<Grid item>
					<Skeleton animation='pulse' height={500} />
				</Grid>
			</Grid>
		);
	}

	return (
		<BigCalendar
			events={transformedEvents}
			localizer={localizer}
			onNavigate={navigateChangeHandler}
			selectable={true}
			popup={true}
			showMultiDayTimes={true}
			drilldownView='agenda'
			longPressThreshold={50}
			eventPropGetter={eventPropGetterHandler}
			onSelectEvent={(event) =>
				history.push(`/calendar/event?eventId=${event.eventId}`)
			}
			onSelectSlot={selectSlotHandler}
		/>
	);
};

export default CalendarContainer;
