import {
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Step,
  StepLabel,
  Stepper,
  Typography,
  withTheme
} from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import ActionsBar from '../../../../../components/ActionsBar';
import { useFormik } from 'formik';
import * as yup from 'yup';

const SelectVendorsList = withTheme((props) => {
  const {
    uploadVendors,
    stepLabels,
    activeStep,
    backClickHandler,
    uploadVendorsHandler
  } = props;
  const [validatedOnMount, setValidatedOnMount] = useState(false);

  const validationSchema = yup.object().shape({
    checkedVendors: yup.array().label('Vendors').required().min(1)
  });

  const initialValues = {
    checkedVendors: uploadVendors
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: (values) => uploadVendorsHandler(values.checkedVendors),
    validationSchema: validationSchema
  });

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  const selectAllCheckHandler = () => {
    const checked =
      uploadVendors.length === formik.values.checkedVendors.length;
    let newCheckedVendors;
    if (checked) {
      newCheckedVendors = [];
    } else {
      newCheckedVendors = initialValues.checkedVendors;
    }
    formik.setFieldValue('checkedVendors', newCheckedVendors, true);
  };

  const checkHandler = (uploadVendor, checked) => () => {
    const newCheckedVendors = [...formik.values.checkedVendors];
    if (checked) {
      const index = formik.values.checkedVendors.findIndex(
        (checkedVendor) => checkedVendor.sourceId === uploadVendor.sourceId
      );
      newCheckedVendors.splice(index, 1);
    } else {
      newCheckedVendors.push(uploadVendor);
    }
    formik.setFieldValue('checkedVendors', newCheckedVendors, true);
  };

  if (!uploadVendors) {
    return <CircularProgress />;
  }
  const count = formik.values.checkedVendors.length;

  return (
    <Fragment>
      <DialogTitle>
        <List dense style={{ padding: 0 }}>
          <ListItem style={{ padding: `0 ${props.theme.spacing(6)}px 0 0` }}>
            <ListItemText
              style={{ textAlign: 'start' }}
              primary={
                <Typography variant='h6' component='h2'>
                  {`Upload Vendors (${count})`}
                </Typography>
              }
            />
            <ListItemText
              style={{ textAlign: 'end' }}
              primary={'Select all'}
              secondary={`${count} selected`}
            />
            <ListItemSecondaryAction>
              <Checkbox
                edge='end'
                onChange={selectAllCheckHandler}
                checked={uploadVendors.length === count}
                indeterminate={count > 0 && count < uploadVendors.length}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogTitle>
      <DialogContent>
        <List dense style={{ overflowY: 'auto', maxHeight: 300 }}>
          {uploadVendors.map((uploadVendor) => {
            const checked = formik.values.checkedVendors.some(
              (checkedVendor) =>
                checkedVendor.sourceId === uploadVendor.sourceId
            );
            return (
              <ListItem
                button
                style={{ paddingLeft: 0 }}
                key={uploadVendor.sourceId}
                onClick={checkHandler(uploadVendor, checked)}
              >
                <ListItemText
                  primary={uploadVendor.name}
                  secondary={uploadVendor.sourceId}
                />
                <ListItemSecondaryAction>
                  <Checkbox
                    edge='end'
                    onChange={checkHandler(uploadVendor, checked)}
                    checked={checked}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
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
          additionalButtons={[
            {
              buttonText: 'Back',
              onClick: backClickHandler,
              buttonLoading: false,
              buttonDisabled: false
            }
          ]}
        />
      </DialogActions>
    </Fragment>
  );
});

export default SelectVendorsList;
