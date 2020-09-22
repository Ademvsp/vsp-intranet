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
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';
import Message from '../../../models/message';
import * as messageController from '../../../controllers/message';
import {
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../../../utils/constants';
const DragAndDropCalendar = withDragAndDrop(BigCalendar);
moment.locale('en-au', {
	week: { dow: 1 }
});
const localizer = momentLocalizer(moment);

const CalendarContainer = (props) => {
	const history = useHistory();
	const [transformedEvents, setTransformedEvents] = useState();
	const { locations, users } = useSelector((state) => state.dataState);
	const { authUser } = useSelector((state) => state.authState);
	const dispatch = useDispatch();
	const initalRange = {
		startOfMonth: moment(new Date()).startOf('month').toDate(),
		start: moment(new Date()).startOf('month').subtract(1, 'month').toDate(),
		end: moment(new Date()).endOf('month').add(1, 'month').toDate()
	};
	const [range, setRange] = useState(initalRange);
	const { setNewEventPrefillData, setShowAddEventDialog } = props;

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
	useEffect(() => {
		dispatch(eventController.subscribeEventsListener(range.start, range.end));
		return () => {
			eventController.unsubscribeEventsListener();
		};
	}, [range, dispatch]);

	const navigateChangeHandler = (event) => {
		const startOfMonth = moment(event).startOf('month').toDate();
		const start = moment(startOfMonth).subtract(1, 'month').toDate();
		const end = moment(startOfMonth).add(1, 'month').toDate();
		if (startOfMonth.valueOf() !== range.startOfMonth.valueOf()) {
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

	const permissionDeniedMessageHandler = () => {
		const message = new Message(
			'Staff Calendar',
			// eslint-disable-next-line quotes
			"You don't have permission to perform this action.",
			SNACKBAR,
			{
				duration: 2000,
				variant: SNACKBAR_VARIANTS.FILLED,
				severity: SNACKBAR_SEVERITY.WARNING
			}
		);
		dispatch(messageController.setMessage(message));
	};

	const eventDropHandler = ({ event, start, end }) => {
		if (event.user === authUser.userId) {
			const newStart = moment(start);
			const newEnd = moment(end);
			const startTransformed = moment(event.start)
				.set('year', newStart.get('year'))
				.set('month', newStart.get('month'))
				.set('day', newStart.get('day'))
				.toDate();
			const endTransformed = moment(event.end)
				.set('year', newEnd.get('year'))
				.set('month', newEnd.get('month'))
				.set('day', newEnd.get('day'))
				.toDate();
			const values = {
				allDay: event.allDay,
				details: event.details,
				end: endTransformed,
				start: startTransformed,
				type: { eventTypeId: event.type },
				allCalendars: locations.every((location) =>
					event.locations.includes(location.locationId)
				)
			};
			dispatch(eventController.editEvent(event, values, []));
		} else {
			permissionDeniedMessageHandler();
		}
	};

	const eventResizeHandler = ({ event, start, end }) => {
		if (event.user === authUser.userId) {
			const newStart = moment(start);
			const newEnd = moment(end).clone().add(moment.duration(-1, 'day'));
			const startTransformed = moment(event.start)
				.set('year', newStart.get('year'))
				.set('month', newStart.get('month'))
				.set('day', newStart.get('day'))
				.toDate();
			const endTransformed = moment(event.end)
				.set('year', newEnd.get('year'))
				.set('month', newEnd.get('month'))
				.set('day', newEnd.get('day'))
				.toDate();
			const values = {
				allDay: event.allDay,
				details: event.details,
				end: endTransformed,
				start: startTransformed,
				type: { eventTypeId: event.type },
				allCalendars: locations.every((location) =>
					event.locations.includes(location.locationId)
				)
			};
			dispatch(eventController.editEvent(event, values, []));
		} else {
			permissionDeniedMessageHandler();
		}
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
		<DragAndDropCalendar
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
			onEventDrop={eventDropHandler}
			onEventResize={eventResizeHandler}
		/>
	);
};

export default CalendarContainer;
