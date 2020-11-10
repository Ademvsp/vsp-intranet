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

const VendorsUploadForm = withTheme((props) => {
  const { stepLabels, activeStep, processVendorsFormDataHandler } = props;
  const [validatedOnMount, setValidatedOnMount] = useState(false);

  const validationSchema = yup.object().shape({
    vendors: yup
      .string()
      .label('Vendors')
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
    vendors: ''
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: (values) => processVendorsFormDataHandler(values.vendors),
    validationSchema: validationSchema
  });

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  const count = formik.values.vendors.split('\n').length;

  return (
    <Fragment>
      <DialogTitle>{`Upload Vendors (${count})`}</DialogTitle>
      <DialogContent>
        <TextField
          label='Comma Separated Values'
          autoFocus
          multiline
          rows={10}
          rowsMax={10}
          fullWidth
          value={formik.values.vendors}
          onChange={formik.handleChange('vendors')}
          onBlur={formik.handleBlur('vendors')}
          helperText={
            formik.errors.vendors && formik.touched.vendors
              ? formik.errors.vendors
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

export default VendorsUploadForm;
