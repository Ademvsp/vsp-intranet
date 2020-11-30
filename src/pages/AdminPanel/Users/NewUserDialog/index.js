import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Switch,
  TextField,
  withTheme
} from '@material-ui/core';
import ActionsBar from '../../../../components/ActionsBar';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../../../../store/actions/user';

const NewUserDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { locations, users } = useSelector((state) => state.dataState);
  const { open, close } = props;
  const [validatedOnMount, setValidatedOnMount] = useState(false);
  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object().shape({
    firstName: yup.string().label('First Name').required(),
    lastName: yup.string().label('Last Name').required(),
    title: yup.string().label('Title').required(),
    email: yup.string().label('Email').required().email(),
    authPhone: yup.string().label('Auth Phone').required().max(12),
    phone: yup.string().label('Phone (Display)').required().max(16),
    extension: yup.string().label('Extension').required().max(12),
    location: yup
      .string()
      .label('Location')
      .required()
      .test('isValidArrayElement', 'Location is not valid', (value) =>
        locations.map((location) => location.locationId).includes(value)
      ),
    manager: yup
      .string()
      .label('Manager')
      .required()
      .test('isValidArrayElement', 'Manager is not valid', (value) =>
        users.map((user) => user.userId).includes(value)
      ),
    active: yup.boolean().label('Active').required(),
    admin: yup.boolean().label('Administrator').required()
  });

  const initialValues = {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    authPhone: '',
    phone: '',
    extension: '',
    location: locations[0].locationId,
    manager: users[0].userId,
    active: true,
    admin: false
  };

  const dialogCloseHander = () => {
    if (!loading) {
      close();
    }
  };

  const submitHandler = async (values) => {
    setLoading(true);
    const result = await dispatch(addUser(values));
    setLoading(false);
    if (result) {
      formik.setValues(initialValues, true);
      dialogCloseHander();
    }
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: submitHandler
  });

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  return (
    <Dialog open={open} onClose={dialogCloseHander} maxWidth='sm' fullWidth>
      <DialogTitle>New User</DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={2}>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type='text'
                label='First Name'
                autoFocus
                fullWidth
                value={formik.values.firstName}
                onChange={formik.handleChange('firstName')}
                onBlur={formik.handleBlur('firstName')}
                helperText={
                  formik.errors.firstName && formik.touched.firstName
                    ? formik.errors.firstName
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type='text'
                label='Last Name'
                fullWidth
                value={formik.values.lastName}
                onChange={formik.handleChange('lastName')}
                onBlur={formik.handleBlur('lastName')}
                helperText={
                  formik.errors.lastName && formik.touched.lastName
                    ? formik.errors.lastName
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
          <Grid item>
            <TextField
              type='text'
              label='Email'
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange('email')}
              onBlur={formik.handleBlur('email')}
              helperText={
                formik.errors.email && formik.touched.email
                  ? formik.errors.email
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
            />
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type='text'
                label='Auth Phone'
                fullWidth
                value={formik.values.authPhone}
                onChange={formik.handleChange('authPhone')}
                onBlur={formik.handleBlur('authPhone')}
                helperText={
                  formik.errors.authPhone && formik.touched.authPhone
                    ? formik.errors.authPhone
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type='text'
                label='Phone'
                fullWidth
                value={formik.values.phone}
                onChange={formik.handleChange('phone')}
                onBlur={formik.handleBlur('phone')}
                helperText={
                  formik.errors.phone && formik.touched.phone
                    ? formik.errors.phone
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
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type='text'
                label='Extension'
                fullWidth
                value={formik.values.extension}
                onChange={formik.handleChange('extension')}
                onBlur={formik.handleBlur('extension')}
                helperText={
                  formik.errors.extension && formik.touched.extension
                    ? formik.errors.extension
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type='text'
                label='Title'
                fullWidth
                value={formik.values.title}
                onChange={formik.handleChange('title')}
                onBlur={formik.handleBlur('title')}
                helperText={
                  formik.errors.title && formik.touched.title
                    ? formik.errors.title
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
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label='Branch'
                fullWidth
                value={formik.values.location}
                onChange={formik.handleChange('location')}
                onBlur={formik.handleBlur('location')}
                helperText={
                  formik.errors.location && formik.touched.location
                    ? formik.errors.location
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              >
                {locations.map((location) => (
                  <MenuItem
                    key={location.locationId}
                    value={location.locationId}
                  >
                    {location.branch}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label='Manager'
                fullWidth
                value={formik.values.manager}
                onChange={formik.handleChange('manager')}
                onBlur={formik.handleBlur('manager')}
                helperText={
                  formik.errors.manager && formik.touched.manager
                    ? formik.errors.manager
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              >
                {users.map((user) => (
                  <MenuItem key={user.userId} value={user.userId}>
                    {user.getFullName()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid item container justify='flex-end'>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.active}
                    onChange={formik.handleChange('active')}
                  />
                }
                label='Active'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.admin}
                    onChange={formik.handleChange('admin')}
                  />
                }
                label='Administrator'
              />
            </FormGroup>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <ActionsBar
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

export default NewUserDialog;
