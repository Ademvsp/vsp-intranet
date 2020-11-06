import {
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
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ActionsBar from '../../../components/ActionsBar';
import { addFirmware } from '../../../store/actions/firmware';
const filter = createFilterOptions();

const NewFirmwareDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.dataState);
  const { open, close } = props;
  const [loading, setLoading] = useState();
  const [validatedOnMount, setValidatedOnMount] = useState(false);

  const validationSchema = yup.object().shape({
    attachments: yup.array().required().min(1),
    notifyUsers: yup.array().notRequired(),
    title: yup.string().label('Title').trim().required(),
    products: yup.array().label('Products').required().min(1),
    body: yup.string().label('Release Notes').trim().notRequired()
  });

  const initialValues = {
    attachments: [],
    notifyUsers: [],
    title: '',
    products: [],
    body: ''
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const submitHandler = async (values) => {
    setLoading(true);
    const result = await dispatch(addFirmware(values));
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

  const productRenderInput = (params) => (
    <TextField
      {...params}
      label='Products Affected'
      fullWidth
      helperText={
        formik.errors.products && formik.touched.products
          ? formik.errors.products
          : null
      }
      FormHelperTextProps={{
        style: {
          color: props.theme.palette.error.main
        }
      }}
    />
  );

  const productFilterOptions = (options, params) => {
    const filtered = filter(options, params);
    const notEmpty = params.inputValue.trim() !== '';
    const productExists = formik.values.products.includes(params.inputValue);
    if (notEmpty && !productExists) {
      filtered.push(params.inputValue);
    }
    return filtered;
  };

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogTitle>New Firmware</DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={2}>
          <Grid item>
            <TextField
              label='Title'
              fullWidth
              value={formik.values.title}
              onChange={formik.handleChange('title')}
              onBlur={formik.handleBlur('title')}
              autoFocus
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
          <Grid item>
            <Autocomplete
              filterSelectedOptions
              multiple
              options={customers || []}
              getOptionLabel={(option) => option}
              getOptionSelected={(option, value) => option === value}
              value={formik.values.products}
              onChange={(_event, value) =>
                formik.setFieldValue('products', value, true)
              }
              onBlur={formik.handleBlur('products')}
              filterOptions={productFilterOptions}
              renderInput={productRenderInput}
            />
          </Grid>
          <Grid item>
            <TextField
              label='Release Notes'
              multiline
              rows={5}
              rowsMax={5}
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

export default NewFirmwareDialog;
