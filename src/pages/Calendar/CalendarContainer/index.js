import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import { Grid, Typography } from '@material-ui/core';
import colors from '../../../utils/colors';
import { useHistory } from 'react-router-dom';
import { set } from 'date-fns';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import { PUBLIC_HOLIDAY } from '../../../data/event-types';
import Event from '../../../models/event';

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
  const { authUser } = useSelector((state) => state.authState);
  const { userId } = authUser;
  const [transformedEvents, setTransformedEvents] = useState();
  const { locations, users } = useSelector((state) => state.dataState);
  const [view, setView] = useState('month');
  const {
    setNewEventPrefillData,
    setShowAddEventDialog,
    range,
    setRange
  } = props;

  useEffect(() => {
    if (props.events) {
      const newTransformedEvents = props.events.map((event) => ({
        ...event,
        title: event.getEventTitle(users),
        start: event.start,
        end: event.end
      }));
      setTransformedEvents(newTransformedEvents);
    }
  }, [props.events, users, userId]);

  const navigateChangeHandler = (event) => {
    //Make initial range 1 month before and 1 month after current month
    const startOfEventMonth = startOfMonth(event);
    const start = sub(startOfEventMonth, { months: 1 });
    const end = add(startOfEventMonth, { months: 2 });
    if (startOfEventMonth.valueOf() !== range.startOfMonth.valueOf()) {
      //No need to set new range if still navigating through weeks of same month
      setRange({
        startOfMonth: startOfEventMonth,
        start: start,
        end: end
      });
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

  const titleAccessor = (event) => {
    const newEvent = new Event({ ...event });
    const title = newEvent.getEventTitle(users);
    const isEventUser = event.user === userId;
    const isSubscriber = event.subscribers.includes(userId);
    const isPublicHolliday = event.type === PUBLIC_HOLIDAY;
    const showNotificationIcon =
      isEventUser || isSubscriber || isPublicHolliday;
    return (
      <Grid container alignItems='center' wrap='nowrap'>
        {showNotificationIcon && <NotificationsActiveIcon fontSize='inherit' />}
        <Typography variant='caption'>{title}</Typography>
      </Grid>
    );
  };

  const selectSlotHandler = (event) => {
    if (view === 'month') {
      //If on month view, prevent new event from showing 12:00am to 12:00am
      setNewEventPrefillData({
        start: set(event.start, { hours: 8, minutes: 0 }),
        end: set(event.end, { hours: 9, minutes: 0 })
      });
    } else {
      //All other views, the time follow the slot the user clicks on
      setNewEventPrefillData({ start: event.start, end: event.end });
    }
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
      onSelectEvent={(event) => history.push(`/calendar/${event.eventId}`)}
      onSelectSlot={selectSlotHandler}
      view={view}
      onView={(newView) => setView(newView)}
      titleAccessor={titleAccessor}
    />
  );
};

export default CalendarContainer;
