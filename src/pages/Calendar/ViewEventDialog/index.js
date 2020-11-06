import React, { useEffect, useRef, useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Dialog,
  DialogActions,
  Badge,
  Collapse,
  Button,
  Typography
} from '@material-ui/core';
import eventTypes from '../../../data/event-types';
import { useDispatch, useSelector } from 'react-redux';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { format } from 'date-fns';
import { LONG_DATE_TIME, LONG_DATE } from '../../../utils/date';
import Event from '../../../models/event';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';
import Comments from '../../../components/Comments';
import { addComment } from '../../../store/actions/event';
import ViewEventMenu from './ViewEventMenu';

const ViewEventDialog = (props) => {
  const dispatch = useDispatch();
  const detailsFieldRef = useRef();
  const { authUser } = useSelector((state) => state.authState);
  const { users, locations } = useSelector((state) => state.dataState);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { open, close, event: propsEvent } = props;
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
          ...snapshot.data(),
          eventId: snapshot.id,
          start: snapshot.data().start.toDate(),
          end: snapshot.data().end.toDate()
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
    type: eventTypes.find((eventType) => eventType.name === event.type),
    details: event.details,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    allCalendars: locations.every((location) =>
      event.locations.includes(location.locationId)
    )
  };

  const tempEvent = new Event({
    details: initialValues.details,
    type: initialValues.type.name,
    user: event.user
  });
  const eventTitle = tempEvent.getEventTitle(users);

  let dateFormat = LONG_DATE_TIME;
  if (initialValues.allDay) {
    dateFormat = LONG_DATE;
  }

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const commentsClickHandler = () => {
    setShowComments((prevState) => !prevState);
  };

  const newCommentHandler = async (values) => {
    setLoading(true);
    const result = await dispatch(addComment(event, values));
    setLoading(false);
    return result;
  };

  const commentLikeClickHandler = async (reverseIndex) => {
    //Comments get reversed to display newest first, need to switch it back
    const index = event.comments.length - reverseIndex - 1;
    const newEvent = new Event({ ...event });
    await newEvent.toggleCommentLike(index);
  };

  let commentIcon = <CommentOutlinedIcon />;
  const commentUsers = event.comments.map((comment) => comment.user);
  if (commentUsers.includes(authUser.userId)) {
    commentIcon = <CommentRoundedIcon />;
  }
  const commentToolip = () => {
    const commentUsers = users.filter((user) => {
      const commentUserIds = event.comments.map((comment) => comment.user);
      return commentUserIds.includes(user.userId);
    });
    const tooltip = commentUsers.map((commentUser) => (
      <div key={commentUser.userId}>{commentUser.getFullName()}</div>
    ));
    return tooltip;
  };

  const commentButton = (
    <Button
      style={{ textTransform: 'unset' }}
      size='small'
      color='secondary'
      onClick={commentsClickHandler}
      startIcon={
        <Badge color='secondary' badgeContent={event.comments.length}>
          {commentIcon}
        </Badge>
      }
    >
      Comment
    </Button>
  );

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Grid container justify='space-between' alignItems='center'>
          <Grid item>
            <Typography stlye={{ overflowWrap: 'anywhere' }}>
              {eventTitle}
            </Typography>
          </Grid>
          <Grid item>
            <ViewEventMenu event={event} />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={2}>
          <Grid item>
            <TextField
              label='Event type'
              fullWidth
              value={initialValues.type.name}
              readOnly
            />
          </Grid>
          {initialValues.type.detailsEditable ? (
            <Grid item>
              <TextField
                inputRef={detailsFieldRef}
                label='Details'
                fullWidth={true}
                value={initialValues.details}
                readOnly={true}
              />
            </Grid>
          ) : null}
          <Grid
            item
            container
            direction='row'
            justify='space-between'
            spacing={2}
          >
            <Grid item style={{ flexGrow: 1 }}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <TextField
                  label='Start'
                  value={format(initialValues.start, dateFormat)}
                  fullWidth={true}
                  readOnly={true}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <TextField
                  label='End'
                  value={format(initialValues.end, dateFormat)}
                  fullWidth={true}
                  readOnly={true}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
          <Grid item>
            <FormGroup row>
              <Tooltip
                title='Event will not have any time boundaries'
                placement='top'
                arrow={true}
              >
                <FormControlLabel
                  control={
                    <Checkbox checked={initialValues.allDay} readOnly={true} />
                  }
                  label='All day event'
                />
              </Tooltip>
              <Tooltip
                title="Event will appear on all state's calendars"
                placement='top'
                arrow={true}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={initialValues.allCalendars}
                      readOnly={true}
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
        <Grid item container direction='row' justify='flex-end'>
          <Grid item>
            {event.comments.length > 0 ? (
              <Tooltip title={commentToolip()}>{commentButton}</Tooltip>
            ) : (
              commentButton
            )}
          </Grid>
        </Grid>
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
  );
};

export default ViewEventDialog;
