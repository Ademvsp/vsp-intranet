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

const SelectCustomersList = withTheme((props) => {
  const {
    uploadCustomers,
    stepLabels,
    activeStep,
    backClickHandler,
    uploadCustomersHandler
  } = props;
  const [validatedOnMount, setValidatedOnMount] = useState(false);

  const validationSchema = yup.object().shape({
    checkedCustomers: yup.array().label('Customers').required().min(1)
  });

  const initialValues = {
    checkedCustomers: uploadCustomers
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: (values) => uploadCustomersHandler(values.checkedCustomers),
    validationSchema: validationSchema
  });

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  const selectAllCheckHandler = () => {
    const checked =
      uploadCustomers.length === formik.values.checkedCustomers.length;
    let newCheckedCustomers;
    if (checked) {
      newCheckedCustomers = [];
    } else {
      newCheckedCustomers = initialValues.checkedCustomers;
    }
    formik.setFieldValue('checkedCustomers', newCheckedCustomers, true);
  };

  const checkHandler = (uploadCustomer, checked) => () => {
    const newCheckedCustomers = [...formik.values.checkedCustomers];
    if (checked) {
      const index = formik.values.checkedCustomers.findIndex(
        (checkedCustomer) =>
          checkedCustomer.sourceId === uploadCustomer.sourceId
      );
      newCheckedCustomers.splice(index, 1);
    } else {
      newCheckedCustomers.push(uploadCustomer);
    }
    formik.setFieldValue('checkedCustomers', newCheckedCustomers, true);
  };

  if (!uploadCustomers) {
    return <CircularProgress />;
  }
  const count = formik.values.checkedCustomers.length;

  return (
    <Fragment>
      <DialogTitle>
        <List dense style={{ padding: 0 }}>
          <ListItem style={{ padding: `0 ${props.theme.spacing(6)}px 0 0` }}>
            <ListItemText
              style={{ textAlign: 'start' }}
              primary={
                <Typography variant='h6' component='h2'>
                  {`Upload Customers (${count})`}
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
                checked={uploadCustomers.length === count}
                indeterminate={count > 0 && count < uploadCustomers.length}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogTitle>
      <DialogContent>
        <List dense style={{ overflowY: 'auto', maxHeight: 300 }}>
          {uploadCustomers.map((uploadCustomer) => {
            const checked = formik.values.checkedCustomers.some(
              (checkedCustomer) =>
                checkedCustomer.sourceId === uploadCustomer.sourceId
            );
            return (
              <ListItem
                button
                style={{ paddingLeft: 0 }}
                key={uploadCustomer.sourceId}
                onClick={checkHandler(uploadCustomer, checked)}
              >
                <ListItemText
                  primary={uploadCustomer.name}
                  secondary={uploadCustomer.sourceId}
                />
                <ListItemSecondaryAction>
                  <Checkbox
                    edge='end'
                    onChange={checkHandler(uploadCustomer, checked)}
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

export default SelectCustomersList;
