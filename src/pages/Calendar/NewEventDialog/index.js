import React, { useState, useEffect, useRef } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Dialog,
  withTheme,
  ListItemAvatar,
  ListItemText
} from '@material-ui/core';
import ActionsBar from '../../../components/ActionsBar';
import { useFormik } from 'formik';
import * as yup from 'yup';
import eventTypes, {
  ANNUAL_LEAVE,
  OTHER_LEAVE
} from '../../../data/event-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  DateTimePicker,
  DatePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { isAfter, set, addHours } from 'date-fns';
import { StyledTitle } from './styled-components';
import { LONG_DATE, LONG_DATE_TIME } from '../../../utils/date';
import Event from '../../../models/event';
import { addEvent } from '../../../store/actions/event';
import Avatar from '../../../components/Avatar';
import { useHistory } from 'react-router-dom';
import Message from '../../../models/message';
import { DIALOG } from '../../../utils/constants';
import { setMessage } from '../../../store/actions/message';

const NewEventDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const detailsFieldRef = useRef();
  const { authUser } = useSelector((state) => state.authState);
  const { users, activeUsers } = useSelector((state) => state.dataState);
  const [loading, setLoading] = useState();
  const [validatedOnMount, setValidatedOnMount] = useState(false);
  const { open, close, newEventPrefillData, permissions } = props;

  const initialValues = {
    notifyUsers: [],
    type: eventTypes[0],
    details: '',
    start: newEventPrefillData
      ? newEventPrefillData.start
      : set(new Date(), { hours: 8, minutes: 0 }),
    end: newEventPrefillData
      ? newEventPrefillData.end
      : set(new Date(), { hours: 9, minutes: 0 }),
    allDay: false,
    allCalendars: false,
    user: authUser.userId
  };

  const validationSchema = yup.object().shape({
    notifyUsers: yup.array().notRequired(),
    type: yup
      .object()
      .label('Event type')
      .required()
      .test('isValidArrayElement', 'Event type not valid', (value) =>
        eventTypes.find((eventType) => eventType.name === value.name)
      ),
    details: yup
      .string()
      .label('Details')
      .when('type', {
        is: (value) => value.detailsEditable,
        then: yup.string().trim().required(),
        otherwise: yup.string().trim().notRequired()
      }),
    start: yup.date().label('Start date').required(),
    end: yup.date().label('End date').required().min(yup.ref('start')),
    allDay: yup.boolean().label('All day').required(),
    allCalendars: yup.boolean().label('All Calendars').required(),
    user: yup
      .string()
      .label('User')
      .required()
      .test('isValidArrayElement', 'User is invalid', (value) =>
        activeUsers.map((user) => user.userId).includes(value)
      )
  });

  const submitHandler = async (values) => {
    setLoading(true);
    const result = await dispatch(addEvent(values));
    setLoading(false);
    if (result) {
      formik.setValues(initialValues);
      close();
    }
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: submitHandler,
    validationSchema: validationSchema
  });
  const { start, end, type } = formik.values;
  const { setFieldValue, validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  useEffect(() => {
    if (type) {
      //Autofocus details field
      if (type.detailsEditable) {
        if (detailsFieldRef.current) {
          detailsFieldRef.current.select();
        }
      }
      //Set public events checkbox
      if (type.allCalendars) {
        setFieldValue('allCalendars', type.allCalendars);
      }
      //If Annual Leave or Other Leave, and not Admin, push to Leave Request Page
      const isLeaveType =
        type.name === ANNUAL_LEAVE || type.name === OTHER_LEAVE;
      const isAdmin = permissions.admins;
      if (isLeaveType && !isAdmin) {
        const message = new Message({
          title: 'Staff Calendar',
          body: 'You will now be redirected to the leave requests page',
          feedback: DIALOG,
          options: {
            closeAction: () => push('/leave-requests')
          }
        });
        dispatch(setMessage(message));
      }
    }
  }, [type, setFieldValue, push, permissions, dispatch]);
  //Add 1 hour if end date is set to less than start date
  useEffect(() => {
    if (isAfter(start, end)) {
      setFieldValue('end', addHours(start, 1));
    }
  }, [start, end, setFieldValue]);

  const userField = () => {
    let usersSource = activeUsers;
    if (permissions.managers) {
      usersSource = activeUsers.filter(
        (user) =>
          user.manager === authUser.userId || user.userId === authUser.userId
      );
    }
    if (permissions.admins) {
      //If admin user & manager, admin gets priority
      usersSource = activeUsers;
    }
    return (
      <TextField
        label='Staff Member'
        select={true}
        fullWidth={true}
        value={formik.values.user}
        onBlur={formik.handleBlur('user')}
        onChange={formik.handleChange('user')}
        helperText={
          formik.errors.user && formik.touched.user ? formik.errors.user : null
        }
        FormHelperTextProps={{
          style: {
            color: props.theme.palette.error.main
          }
        }}
      >
        {usersSource.map((user) => (
          <MenuItem key={user.userId} value={user.userId}>
            <Grid container direction='row' spacing={1}>
              <Grid item>
                <ListItemAvatar>
                  <Avatar user={user} />
                </ListItemAvatar>
              </Grid>
              <Grid item>
                <ListItemText primary={user.getFullName()} />
              </Grid>
            </Grid>
          </MenuItem>
        ))}
      </TextField>
    );
  };
  const showUserField = permissions.admins || permissions.managers;

  const tempEvent = new Event({
    details: formik.values.details,
    type: formik.values.type.name,
    user: formik.values.user
  });
  const eventTitle = tempEvent.getEventTitle(users);

  let StartPicker = DateTimePicker;
  let EndPicker = DateTimePicker;
  let dateFormat = LONG_DATE_TIME;
  if (formik.values.allDay) {
    StartPicker = DatePicker;
    EndPicker = DatePicker;
    dateFormat = LONG_DATE;
  }

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogTitle>
        <StyledTitle>{`Title Preview: ${eventTitle}`}</StyledTitle>
      </DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={2}>
          {showUserField && <Grid item>{userField()}</Grid>}
          <Grid item>
            <TextField
              label='Event type'
              select={true}
              fullWidth={true}
              value={formik.values.type}
              onBlur={formik.handleBlur('type')}
              onChange={formik.handleChange('type')}
              helperText={
                formik.errors.type && formik.touched.type
                  ? formik.errors.type
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
            >
              {eventTypes.map((eventType) => (
                <MenuItem key={eventType.name} value={eventType}>
                  {eventType.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {formik.values.type.detailsEditable && (
            <Grid item>
              <TextField
                inputRef={detailsFieldRef}
                label='Details'
                fullWidth={true}
                value={formik.values.details}
                onBlur={formik.handleBlur('details')}
                onChange={formik.handleChange('details')}
                autoFocus={true}
                helperText={
                  formik.errors.details && formik.touched.details
                    ? formik.errors.details
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              />
            </Grid>
          )}
          <Grid
            item
            container
            direction='row'
            justify='space-between'
            spacing={2}
          >
            <Grid item style={{ flexGrow: 1 }}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <StartPicker
                  label='Start'
                  value={formik.values.start}
                  onChange={(value) => formik.setFieldValue('start', value)}
                  onBlur={formik.handleBlur('start')}
                  format={dateFormat}
                  fullWidth={true}
                  helperText={
                    formik.errors.start && formik.touched.start
                      ? formik.errors.start
                      : null
                  }
                  FormHelperTextProps={{
                    style: {
                      color: props.theme.palette.error.main
                    }
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <EndPicker
                  label='End'
                  value={formik.values.end}
                  onChange={(value) => formik.setFieldValue('end', value)}
                  onBlur={formik.handleBlur('end')}
                  format={dateFormat}
                  fullWidth={true}
                  minDate={formik.values.start}
                  helperText={
                    formik.errors.end && formik.touched.end
                      ? formik.errors.end
                      : null
                  }
                  FormHelperTextProps={{
                    style: {
                      color: props.theme.palette.error.main
                    }
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
          <Grid item>
            <FormGroup row>
              <Tooltip
                title='Event will not have any time boundaries'
                arrow={true}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.allDay}
                      onChange={formik.handleChange('allDay')}
                      onBlur={formik.handleBlur('allDay')}
                    />
                  }
                  label='All day event'
                />
              </Tooltip>
              <Tooltip
                title="Event will appear on all state's calendars"
                arrow={true}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.allCalendars}
                      onChange={formik.handleChange('allCalendars')}
                      onBlur={formik.handleBlur('allCalendars')}
                    />
                  }
                  label='Publish to all calendars'
                />
              </Tooltip>
            </FormGroup>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <ActionsBar
          notifications={{
            enabled: true,
            notifyUsers: formik.values.notifyUsers,
            setNotifyUsers: (notifyUsers) =>
              formik.setFieldValue('notifyUsers', notifyUsers)
          }}
          buttonLoading={loading}
          disabled={loading || !validatedOnMount}
          isValid={formik.isValid}
          onClick={formik.handleSubmit}
          tooltipPlacement='top'
          actionButtonText='Create'
        />
      </DialogActions>
    </Dialog>
  );
});

export default NewEventDialog;
