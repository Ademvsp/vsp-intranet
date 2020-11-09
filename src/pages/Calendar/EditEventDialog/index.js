import React, { useState, useEffect, useRef, Fragment } from 'react';
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
  Collapse,
  ListItemAvatar,
  ListItemText
} from '@material-ui/core';
import ActionsBar from '../../../components/ActionsBar';
import { useFormik } from 'formik';
import * as yup from 'yup';
import eventTypes from '../../../data/event-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  DateTimePicker,
  DatePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { isAfter, addHours } from 'date-fns';
import { StyledTitle } from './styled-components';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { LONG_DATE, LONG_DATE_TIME } from '../../../utils/date';
import Event from '../../../models/event';
import {
  addComment,
  deleteEvent,
  editEvent
} from '../../../store/actions/event';
import Comments from '../../../components/Comments';
import Avatar from '../../../components/Avatar';

const EditEventDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const detailsFieldRef = useRef();
  const { authUser } = useSelector((state) => state.authState);
  const { users, activeUsers, locations } = useSelector(
    (state) => state.dataState
  );
  const [commentLoading, setCommentLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validatedOnMount, setValidatedOnMount] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const loading = deleteLoading || editLoading || commentLoading;

  const { open, close, event: propsEvent, permissions } = props;
  const [event, setEvent] = useState(propsEvent);
  //Start listener for current event, as static event is sent through props
  //Props event is static as collection listener is only for calendar 3 month range
  //This event could be outside that range, hence why it's static
  useEffect(() => {
    let eventListener;
    const asyncFunction = async () => {
      eventListener = await Event.getEventListener(
        propsEvent.eventId
      ).onSnapshot((snapshot) => {
        const newEvent = new Event({
          eventId: snapshot.id,
          ...snapshot.data()
        });
        setEvent(newEvent);
      });
    };
    asyncFunction();
    return () => {
      if (eventListener) {
        eventListener();
      }
    };
  }, [propsEvent]);

  const initialValues = {
    notifyUsers: [],
    type: eventTypes.find((eventType) => eventType.name === event.type),
    details: event.details,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    allCalendars: locations.every((location) =>
      event.locations.includes(location.locationId)
    ),
    user: event.user
  };

  const validationSchema = yup.object().shape({
    notifyUsers: yup.array().notRequired(),
    type: yup
      .object()
      .label('Event type')
      .required()
      .test('isValidArrayElement', 'Event type not valid', (value) =>
        eventTypes.find((type) => type.name === value.name)
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
    allCalendars: yup.boolean().label('allCalendars').required(),
    user: yup
      .string()
      .label('User')
      .required()
      .test('isValidArrayElement', 'User is invalid', (value) =>
        activeUsers.map((user) => user.userId).includes(value)
      )
  });

  const submitHandler = async (values) => {
    setEditLoading(true);
    const result = await dispatch(editEvent(event, values));
    setEditLoading(false);
    if (result) {
      close();
    }
  };

  const deleteHandler = async () => {
    setDeleteLoading(true);
    await dispatch(deleteEvent(event, formik.values.notifyUsers));
    setDeleteLoading(false);
    close();
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const newCommentHandler = async (values) => {
    setCommentLoading(true);
    const result = await dispatch(addComment(event, values));
    setCommentLoading(false);
    return result;
  };

  const commentsClickHandler = () => {
    setShowComments((prevState) => !prevState);
  };

  const commentLikeClickHandler = async (reverseIndex) => {
    //Comments get reversed to display newest first, need to switch it back
    const index = event.comments.length - reverseIndex - 1;
    const newEvent = new Event({ ...event });
    await newEvent.toggleCommentLike(index);
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: submitHandler,
    validationSchema: validationSchema
  });

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  const { start, end, type } = formik.values;
  const { setFieldValue } = formik;

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
    }
  }, [type, setFieldValue]);
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
    <Fragment>
      <ConfirmDialog
        open={showConfirmDialog}
        cancel={() => setShowConfirmDialog(false)}
        confirm={deleteHandler}
        title='Staff Calendar'
        message='Are you sure you want to delete this event?'
        loading={deleteLoading}
      />
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
            comments={{
              enabled: true,
              comments: event.comments,
              clickHandler: commentsClickHandler
            }}
            buttonLoading={editLoading}
            disabled={loading || !validatedOnMount}
            isValid={formik.isValid}
            onClick={formik.handleSubmit}
            tooltipPlacement='top'
            actionButtonText='Update'
            additionalButtons={[
              {
                buttonText: 'Delete',
                onClick: () => setShowConfirmDialog(true),
                buttonLoading: deleteLoading
              }
            ]}
          />
        </DialogActions>
        <Collapse in={showComments} timeout='auto'>
          <Comments
            submitHandler={newCommentHandler}
            comments={[...event.comments].reverse()}
            actionBarNotificationProps={{
              enabled: true,
              tooltip:
                'The event user, and all comment participants will be notified automatically'
            }}
            commentLikeClickHandler={commentLikeClickHandler}
          />
        </Collapse>
      </Dialog>
    </Fragment>
  );
});

export default EditEventDialog;
