import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  withTheme
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import leaveTypes from '../../../data/leave-types';
import ActionsBar from '../../../components/ActionsBar';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { LONG_DATE } from '../../../utils/date';
import { isAfter } from 'date-fns';
import { addLeaveRequest } from '../../../store/actions/leave-request';

const NewLeaveRequestDialog = withTheme((props) => {
  const dispatch = useDispatch();

  const { open, close } = props;
  const [loading, setLoading] = useState();
  const [validatedOnMount, setValidatedOnMount] = useState(false);

  const validationSchema = yup.object().shape({
    start: yup.date().label('Start date').required(),
    end: yup.date().label('End date').required().min(yup.ref('start')),
    type: yup
      .object()
      .typeError('Vendor a required field')
      .label('Vendor')
      .required()
      .test('isValidArrayElement', 'Leave type not valid', (value) =>
        leaveTypes.find((leaveType) => leaveType.name === value.name)
      ),
    reason: yup.string().trim().label('Reason').required().max(100)
  });

  const initialValues = {
    start: new Date(),
    end: new Date(),
    type: leaveTypes[0],
    reason: ''
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const submitHandler = async (values) => {
    setLoading(true);
    const result = await dispatch(addLeaveRequest(values));
    setLoading(false);
    if (result) {
      formik.setValues(initialValues);
      close();
    }
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: submitHandler,
    validationSchema: validationSchema
  });

  const { validateForm, setFieldValue, values } = formik;
  const { start, end } = values;
  //Add 1 hour if end date is set to less than start date
  useEffect(() => {
    if (isAfter(start, end)) {
      setFieldValue('end', start);
    }
  }, [start, end, setFieldValue]);

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogTitle>New Leave Request</DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={2}>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  label='Start'
                  fullWidth
                  value={formik.values.start}
                  onChange={(value) => formik.setFieldValue('start', value)}
                  onBlur={formik.handleBlur('start')}
                  format={LONG_DATE}
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
            <Grid item xs={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  label='End'
                  fullWidth
                  value={formik.values.end}
                  onChange={(value) => formik.setFieldValue('end', value)}
                  onBlur={formik.handleBlur('end')}
                  format={LONG_DATE}
                  minDate={formik.values.end}
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
            <TextField
              label='Leave Type'
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
              {leaveTypes.map((leaveType) => (
                <MenuItem key={leaveType.name} value={leaveType}>
                  {leaveType.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item>
            <TextField
              label='Reason'
              fullWidth
              multiline
              rows={3}
              rowsMax={3}
              value={formik.values.reason}
              onChange={formik.handleChange('reason')}
              onBlur={formik.handleBlur('reason')}
              helperText={
                formik.errors.reason && formik.touched.reason
                  ? formik.errors.reason
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <ActionsBar
          notifications={{
            enabled: true,
            readOnly: true,
            tooltip: 'Your manager will be notified automatically'
          }}
          buttonLoading={loading}
          disabled={loading || !validatedOnMount}
          isValid={formik.isValid}
          onClick={formik.handleSubmit}
          tooltipPlacement='top'
          actionButtonText='Submit'
        />
      </DialogActions>
    </Dialog>
  );
});

export default NewLeaveRequestDialog;
