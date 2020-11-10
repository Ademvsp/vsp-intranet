import { Dialog, withTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import CustomersUploadForm from './CustomersUploadForm';
import SelectCustomersList from './SelectCustomersList';
import UploadingCustomers from './UploadingCustomers';
import { addExternalCustomers } from '../../../../store/actions/customer';
import { toTitleCase } from '../../../../utils/data-transformer';

const UploadCustomersDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { open, close, customers } = props;
  const stepLabels = ['Copy .csv Data', 'Select Customers', 'Upload'];

  const [loading, setLoading] = useState(false);
  const [uploadCustomers, setUploadCustomers] = useState();
  const [activeStep, setActiveStep] = useState(0);

  const processCustomersFormDataHandler = (formData) => {
    const lines = formData.split('\n');
    const inputCustomers = lines.map((line) => {
      const splitLines = line.split(',');
      return {
        sourceId: splitLines[0],
        name: toTitleCase(splitLines[1])
      };
    });
    const newUploadCustomers = [];
    for (const inputCustomer of inputCustomers) {
      const existsInDb = customers.find(
        (customer) => customer.sourceId === inputCustomer.sourceId
      );
      const duplicateInUploadList = newUploadCustomers.find(
        (newUploadCustomer) =>
          newUploadCustomer.sourceId === inputCustomer.sourceId
      );
      if (!existsInDb && !duplicateInUploadList) {
        newUploadCustomers.push(inputCustomer);
      }
    }
    setUploadCustomers(newUploadCustomers);
    setActiveStep(1);
  };

  const uploadCustomersHandler = async (selectedUploadCustomers) => {
    setActiveStep(2);
    setLoading(true);
    const result = await dispatch(
      addExternalCustomers(selectedUploadCustomers)
    );
    setLoading(false);
    if (result) {
      close();
      setActiveStep(0);
      setUploadCustomers(null);
    }
  };

  const closeDialogHandler = () => {
    if (!loading) {
      close();
    }
  };

  const backClickHandler = () => {
    setActiveStep((prevState) => prevState - 1);
  };

  const steps = [
    {
      label: stepLabels[0],
      Component: (
        <CustomersUploadForm
          customers={customers}
          activeStep={activeStep}
          stepLabels={stepLabels}
          processCustomersFormDataHandler={processCustomersFormDataHandler}
        />
      )
    },
    {
      label: stepLabels[1],
      Component: (
        <SelectCustomersList
          uploadCustomers={uploadCustomers}
          activeStep={activeStep}
          stepLabels={stepLabels}
          backClickHandler={backClickHandler}
          setLoading={setLoading}
          uploadCustomersHandler={uploadCustomersHandler}
        />
      )
    },
    {
      label: stepLabels[2],
      Component: (
        <UploadingCustomers
          activeStep={activeStep}
          stepLabels={stepLabels}
          loading={loading}
        />
      )
    }
  ];

  return (
    <Dialog open={open} onClose={closeDialogHandler} maxWidth='sm' fullWidth>
      {steps[activeStep].Component}
    </Dialog>
  );
});

export default UploadCustomersDialog;
