import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as eventController from '../../../controllers/event';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import { Skeleton } from '@material-ui/lab';
import { Grid } from '@material-ui/core';
import colors from '../../../utils/colors';
import { useHistory } from 'react-router-dom';
const DragAndDropCalendar = withDragAndDrop(BigCalendar);
moment.locale('en-au', {
	week: { dow: 1 }
});
const localizer = momentLocalizer(moment);

const CalendarContainer = (props) => {
	const history = useHistory();
	const [transformedEvents, setTransformedEvents] = useState();
	const { locations, users } = useSelector((state) => state.dataState);
	const dispatch = useDispatch();
	const initalRange = {
		startOfMonth: moment(new Date()).startOf('month').toDate(),
		start: moment(new Date()).startOf('month').subtract(1, 'month').toDate(),
		end: moment(new Date()).endOf('month').add(1, 'month').toDate()
	};
	const [range, setRange] = useState(initalRange);

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

	const navigateChangeHandler = (event) => {
		const startOfMonth = moment(event).startOf('month').toDate();
		const start = moment(startOfMonth).subtract(1, 'month').toDate();
		const end = moment(startOfMonth).add(1, 'month').toDate();
		if (startOfMonth.valueOf() !== range.startOfMonth.valueOf()) {
			setRange({ startOfMonth, start, end });
		}
	};

	useEffect(() => {
		dispatch(eventController.subscribeEventsListener(range.start, range.end));
		return () => {
			eventController.unsubscribeEventsListener();
		};
	}, [range, dispatch]);

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
		<DragAndDropCalendar
			events={transformedEvents}
			localizer={localizer}
			onNavigate={navigateChangeHandler}
			selectable={true}
			popup={true}
			showMultiDayTimes={true}
			longPressThreshold={50}
			eventPropGetter={eventPropGetterHandler}
			onSelectEvent={(event) =>
				history.push(`/calendar/event?eventId=${event.eventId}`)
			}
		/>
	);
};

export default CalendarContainer;
