import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  withTheme
} from '@material-ui/core';
import Autocomplete, {
  createFilterOptions
} from '@material-ui/lab/Autocomplete';
import { useFormik } from 'formik';
import * as yup from 'yup';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Customer from '../../../models/customer';
import ActionsBar from '../../../components/ActionsBar';
import { subscribeCustomerListener } from '../../../store/actions/customer';
import { addJobDocument } from '../../../store/actions/job-document';
const filter = createFilterOptions();

const NewProjectDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.dataState);
  const { open, close } = props;
  const [loading, setLoading] = useState();
  const [validatedOnMount, setValidatedOnMount] = useState(false);
  //Customer field
  const [customersOpen, setCustomersOpen] = useState(false);
  const [customerAdding, setCustomerAdding] = useState(false);
  const customersLoading = (customersOpen && !customers) || customerAdding;
  useEffect(() => {
    if (customersLoading) {
      dispatch(subscribeCustomerListener());
    }
  }, [customersLoading, dispatch]);

  const validationSchema = yup.object().shape({
    attachments: yup.array().required().min(1),
    notifyUsers: yup.array().notRequired(),
    salesOrder: yup
      .number()
      .label('Sales Order')
      .required()
      .min(1)
      .max(10000000),
    siteReference: yup.string().label('Site Reference').trim().notRequired(),
    customer: yup
      .object()
      .typeError('Customer a required field')
      .label('Customer')
      .required()
      .test('isValidType', 'Customer is not valid', (value) => {
        if (!customers) {
          return false;
        }
        return (
          value instanceof Customer &&
          customers.find((customer) => customer.customerId === value.customerId)
        );
      }),
    body: yup.string().label('Notes').trim().notRequired()
  });

  const initialValues = {
    attachments: [],
    notifyUsers: [],
    salesOrder: '',
    siteReference: '',
    customer: null,
    body: ''
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const submitHandler = async (values) => {
    setLoading(true);
    const result = await dispatch(addJobDocument(values));
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

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  const customerRenderInput = (params) => (
    <TextField
      {...params}
      label='Customer'
      fullWidth
      helperText={
        formik.errors.customer && formik.touched.customer
          ? formik.errors.customer
          : null
      }
      FormHelperTextProps={{
        style: {
          color: props.theme.palette.error.main
        }
      }}
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <Fragment>
            {customersLoading ? (
              <CircularProgress color='inherit' size={20} />
            ) : null}
            {params.InputProps.endAdornment}
          </Fragment>
        )
      }}
    />
  );

  const customerFilterOptions = (options, params) => {
    const filtered = filter(options, params);
    if (customers) {
      const customerExists = customers.find(
        (customer) =>
          customer.name.trim().toLowerCase() ===
          params.inputValue.trim().toLowerCase()
      );
      if (params.inputValue !== '' && !customerExists) {
        filtered.push({
          inputValue: params.inputValue,
          name: `Add "${params.inputValue}"`
        });
      }
    }
    return filtered;
  };

  const customerChangeHandler = async (_event, value) => {
    let newValue;
    if (value?.inputValue) {
      setCustomerAdding(true);
      const newCustomerName = value.inputValue.trim();
      const newCustomer = new Customer({ name: newCustomerName });
      await newCustomer.save();
      newValue = newCustomer;
      setCustomerAdding(false);
    } else {
      newValue = new Customer({ ...value });
    }
    formik.setFieldValue('customer', newValue, true);
  };

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogTitle>New Job Document</DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={1}>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label='Sales Order'
                type='number'
                fullWidth
                value={formik.values.salesOrder}
                onChange={formik.handleChange('salesOrder')}
                onBlur={formik.handleBlur('salesOrder')}
                autoFocus
                helperText={
                  formik.errors.salesOrder && formik.touched.salesOrder
                    ? formik.errors.salesOrder
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
                label='Site Reference'
                fullWidth
                value={formik.values.siteReference}
                onChange={formik.handleChange('siteReference')}
                onBlur={formik.handleBlur('siteReference')}
                helperText={
                  formik.errors.siteReference && formik.touched.siteReference
                    ? formik.errors.siteReference
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
            <Autocomplete
              filterSelectedOptions
              openOnFocus
              loading={customersLoading}
              onOpen={() => setCustomersOpen(true)}
              onClose={() => setCustomersOpen(false)}
              options={customers || []}
              getOptionLabel={(option) => option.name}
              getOptionSelected={(option, value) =>
                option.customerId === value.customerId
              }
              value={formik.values.customer}
              onChange={customerChangeHandler}
              onBlur={formik.handleBlur('customer')}
              filterOptions={customerFilterOptions}
              renderInput={customerRenderInput}
            />
          </Grid>
          <Grid item>
            <TextField
              label='Notes'
              multiline
              rows={3}
              rowsMax={3}
              fullWidth
              value={formik.values.body}
              onChange={formik.handleChange('body')}
              onBlur={formik.handleBlur('body')}
              helperText={
                formik.errors.body && formik.touched.body
                  ? formik.errors.body
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
            notifyUsers: formik.values.notifyUsers,
            setNotifyUsers: (notifyUsers) =>
              formik.setFieldValue('notifyUsers', notifyUsers)
          }}
          attachments={{
            enabled: true,
            attachments: formik.values.attachments,
            setAttachments: (attachments) =>
              formik.setFieldValue('attachments', attachments),
            emptyTooltip: 'You must attach at least one document'
          }}
          buttonLoading={loading}
          loading={loading || !validatedOnMount}
          isValid={formik.isValid}
          onClick={formik.handleSubmit}
          tooltipPlacement='top'
          actionButtonText='Submit'
        />
      </DialogActions>
    </Dialog>
  );
});

export default NewProjectDialog;
