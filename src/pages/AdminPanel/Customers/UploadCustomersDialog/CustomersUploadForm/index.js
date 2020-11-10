import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  TextField,
  withTheme
} from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ActionsBar from '../../../../../components/ActionsBar';

const CustomersUploadForm = withTheme((props) => {
  const { stepLabels, activeStep, processCustomersFormDataHandler } = props;
  const [validatedOnMount, setValidatedOnMount] = useState(false);

  const validationSchema = yup.object().shape({
    customers: yup
      .string()
      .label('Customers')
      .required()
      .test(
        'isValidFormat',
        'Must conform to .csv format sourceId,name',
        (value) => {
          if (!value) {
            return false;
          }
          const lines = value.split('\n');
          const pattern = /((?!,).)+,((?!,).)+/;
          return lines.every((line) => {
            const match = line.match(pattern);
            if (!match) {
              return false;
            }
            return match.input === match[0];
          });
        }
      )
  });

  const initialValues = {
    customers: ''
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: (values) => processCustomersFormDataHandler(values.customers),
    validationSchema: validationSchema
  });

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  const count = formik.values.customers.split('\n').length;

  return (
    <Fragment>
      <DialogTitle>{`Upload Customers (${count})`}</DialogTitle>
      <DialogContent>
        <TextField
          label='Comma Separated Values'
          autoFocus
          multiline
          rows={10}
          rowsMax={10}
          fullWidth
          value={formik.values.customers}
          onChange={formik.handleChange('customers')}
          onBlur={formik.handleBlur('customers')}
          helperText={
            formik.errors.customers && formik.touched.customers
              ? formik.errors.customers
              : null
          }
          FormHelperTextProps={{
            style: {
              color: props.theme.palette.error.main
            }
          }}
        />
        <Stepper activeStep={activeStep} alternativeLabel>
          {stepLabels.map((stepLabel) => (
            <Step key={stepLabel}>
              <StepLabel>{stepLabel}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions>
        <ActionsBar
          buttonLoading={false}
          disabled={!validatedOnMount}
          isValid={formik.isValid}
          onClick={formik.handleSubmit}
          tooltipPlacement='top'
          actionButtonText='Next'
        />
      </DialogActions>
    </Fragment>
  );
});

export default CustomersUploadForm;
