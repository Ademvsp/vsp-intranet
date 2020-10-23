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
	Dialog
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
import { isAfter, set, addHours } from 'date-fns';
import { getReadableTitle } from '../../../controllers/event';
import { StyledTitle } from './styled-components';
import * as eventController from '../../../controllers/event';
import { LONG_DATE, LONG_DATE_TIME } from '../../../utils/date';

const NewEventDialog = (props) => {
	const dispatch = useDispatch();
	const detailsFieldRef = useRef();
	const { authUser } = useSelector((state) => state.authState);
	const { users } = useSelector((state) => state.dataState);
	const [notifyUsers, setNotifyUsers] = useState([]);
	const [loading, setLoading] = useState();
	const [validatedOnMount, setValidatedOnMount] = useState(false);
	const { open, close, newEventPrefillData } = props;

	const initialValues = {
		type: eventTypes[0],
		details: '',
		start: newEventPrefillData
			? newEventPrefillData.start
			: set(new Date(), { hours: 8, minutes: 0 }),
		end: newEventPrefillData
			? newEventPrefillData.end
			: set(new Date(), { hours: 9, minutes: 0 }),
		allDay: false,
		allCalendars: false
	};

	const validationSchema = yup.object().shape({
		type: yup
			.object()
			.label('Event type')
			.required()
			.test('isValidArrayElement', 'Event type not valid', (value) =>
				eventTypes.find((type) => type.eventTypeId === value.eventTypeId)
			),
		details: yup
			.string()
			.label('Details')
			.when('type', {
				is: (value) => value.detailsEditable,
				then: yup.string().required(),
				otherwise: yup.string().notRequired()
			}),
		start: yup.date().label('Start date').required(),
		end: yup.date().label('End date').required().min(yup.ref('start')),
		allDay: yup.boolean().label('All day').required(),
		allCalendars: yup.boolean().label('allCalendars').required()
	});

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await dispatch(
			eventController.addEvent(values, notifyUsers)
		);
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
		}
	}, [type, setFieldValue]);
	//Add 1 hour if end date is set to less than start date
	useEffect(() => {
		if (isAfter(start, end)) {
			setFieldValue('end', addHours(start, 1));
		}
	}, [start, end, setFieldValue]);

	const readableTitle = getReadableTitle(
		{
			details: formik.values.details,
			type: formik.values.type.eventTypeId,
			user: authUser.userId
		},
		users
	);

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
				<StyledTitle>{`Title Preview: ${readableTitle}`}</StyledTitle>
			</DialogTitle>
			<DialogContent>
				<Grid container direction='column' spacing={1}>
					<Grid item>
						<TextField
							label='Event type'
							select={true}
							fullWidth={true}
							value={formik.values.type}
							onBlur={formik.handleBlur('type')}
							onChange={formik.handleChange('type')}
						>
							{eventTypes.map((type) => (
								<MenuItem key={type.eventTypeId} value={type}>
									{type.name}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					{formik.values.type.detailsEditable ? (
						<Grid item>
							<TextField
								inputRef={detailsFieldRef}
								label='Details'
								fullWidth={true}
								value={formik.values.details}
								onBlur={formik.handleBlur('details')}
								onChange={formik.handleChange('details')}
								autoFocus={true}
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
								<StartPicker
									label='Start'
									value={formik.values.start}
									onChange={(value) => formik.setFieldValue('start', value)}
									onBlur={formik.handleBlur('start')}
									format={dateFormat}
									fullWidth={true}
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
						notifyUsers: notifyUsers,
						setNotifyUsers: setNotifyUsers
					}}
					buttonLoading={loading}
					loading={loading || !validatedOnMount}
					isValid={formik.isValid}
					onClick={formik.handleSubmit}
					tooltipPlacement='top'
					actionButtonText='Create'
				/>
			</DialogActions>
		</Dialog>
	);
};

export default NewEventDialog;
