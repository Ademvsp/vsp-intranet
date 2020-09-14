import React, { useRef } from 'react';
import {
	DialogTitle,
	DialogContent,
	TextField,
	Grid,
	FormGroup,
	FormControlLabel,
	Checkbox,
	Tooltip
} from '@material-ui/core';
import eventTypes from '../../../utils/event-types';
import { StyledDialog, GridFlexGrow } from '../../../utils/styled-components';
import { useSelector } from 'react-redux';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import moment from 'moment';
import MomentUtils from '@date-io/moment';
import { getReadableTitle } from '../../../controllers/event';
import { StyledTitle } from './styled-components';

const ViewEventDialog = (props) => {
	const detailsFieldRef = useRef();
	const { users, locations } = useSelector((state) => state.dataState);
	const { open, close, event } = props;

	const initialValues = {
		type: eventTypes.find((eventType) => eventType.eventTypeId === event.type),
		details: event.details,
		start: event.start,
		end: event.end,
		allDay: event.allDay,
		allCalendars: locations.every((location) =>
			event.locations.includes(location.locationId)
		)
	};

	const readableTitle = getReadableTitle(
		{
			details: initialValues.details,
			type: initialValues.type.eventTypeId,
			user: event.user
		},
		users
	);
	let dateFormat = 'ddd, D MMM YYYY, h:mm a';
	if (initialValues.allDay) {
		dateFormat = 'ddd, D MMM YYYY';
	}

	return (
		<StyledDialog open={open} onClose={() => close()} width={500}>
			<DialogTitle>
				<StyledTitle>{readableTitle}</StyledTitle>
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
						<GridFlexGrow item>
							<MuiPickersUtilsProvider utils={MomentUtils}>
								<TextField
									label='Start'
									value={moment(initialValues.start).format(dateFormat)}
									fullWidth={true}
									readOnly={true}
								/>
							</MuiPickersUtilsProvider>
						</GridFlexGrow>
						<GridFlexGrow item>
							<MuiPickersUtilsProvider utils={MomentUtils}>
								<TextField
									label='End'
									value={moment(initialValues.end).format(dateFormat)}
									fullWidth={true}
									readOnly={true}
								/>
							</MuiPickersUtilsProvider>
						</GridFlexGrow>
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
		</StyledDialog>
	);
};

export default ViewEventDialog;
