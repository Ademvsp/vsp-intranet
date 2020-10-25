import React, { useRef } from 'react';
import {
	DialogTitle,
	DialogContent,
	TextField,
	Grid,
	FormGroup,
	FormControlLabel,
	Checkbox,
	Tooltip,
	Dialog
} from '@material-ui/core';
import eventTypes from '../../../data/event-types';
import { useSelector } from 'react-redux';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { format } from 'date-fns';
import { StyledTitle } from './styled-components';
import { LONG_DATE_TIME, LONG_DATE } from '../../../utils/date';
import Event from '../../../models/event';

const ViewEventDialog = (props) => {
	const detailsFieldRef = useRef();
	const { users, locations } = useSelector((state) => state.dataState);
	const { open, close, event } = props;

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

	return (
		<Dialog open={open} onClose={close} fullWidth maxWidth='sm'>
			<DialogTitle>
				<StyledTitle>{eventTitle}</StyledTitle>
			</DialogTitle>
			<DialogContent>
				<Grid container direction='column' spacing={1}>
					<Grid item>
						<TextField
							label='Event type'
							fullWidth={true}
							value={initialValues.type.name}
							readOnly={true}
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
		</Dialog>
	);
};

export default ViewEventDialog;
