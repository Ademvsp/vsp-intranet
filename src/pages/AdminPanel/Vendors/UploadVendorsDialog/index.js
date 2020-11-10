import { Dialog, withTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import VendorsUploadForm from './VendorsUploadForm';
import SelectVendorsList from './SelectVendorsList';
import UploadingVendors from './UploadingVendors';
import { addExternalVendors } from '../../../../store/actions/vendor';
import { toTitleCase } from '../../../../utils/data-transformer';

const UploadVendorsDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { open, close, vendors } = props;
  const stepLabels = ['Copy .csv Data', 'Select Vendors', 'Upload'];

  const [loading, setLoading] = useState(false);
  const [uploadVendors, setUploadVendors] = useState();
  const [activeStep, setActiveStep] = useState(0);

  const processVendorsFormDataHandler = (formData) => {
    const lines = formData.split('\n');
    const inputVendors = lines.map((line) => {
      const splitLines = line.split(',');
      return {
        sourceId: splitLines[0],
        name: toTitleCase(splitLines[1])
      };
    });
    const newUploadVendors = [];
    for (const inputVenor of inputVendors) {
      const existsInDb = vendors.find(
        (vendor) => vendor.sourceId === inputVenor.sourceId
      );
      const duplicateInUploadList = newUploadVendors.find(
        (newUploadVendor) => newUploadVendor.sourceId === inputVenor.sourceId
      );
      if (!existsInDb && !duplicateInUploadList) {
        newUploadVendors.push(inputVenor);
      }
    }
    setUploadVendors(newUploadVendors);
    setActiveStep(1);
  };

  const uploadVendorsHandler = async (selectedUploadVendors) => {
    setActiveStep(2);
    setLoading(true);
    const result = await dispatch(addExternalVendors(selectedUploadVendors));
    setLoading(false);
    if (result) {
      close();
      setActiveStep(0);
      setUploadVendors(null);
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
        <VendorsUploadForm
          vendors={vendors}
          activeStep={activeStep}
          stepLabels={stepLabels}
          processVendorsFormDataHandler={processVendorsFormDataHandler}
        />
      )
    },
    {
      label: stepLabels[1],
      Component: (
        <SelectVendorsList
          uploadVendors={uploadVendors}
          activeStep={activeStep}
          stepLabels={stepLabels}
          backClickHandler={backClickHandler}
          setLoading={setLoading}
          uploadVendorsHandler={uploadVendorsHandler}
        />
      )
    },
    {
      label: stepLabels[2],
      Component: (
        <UploadingVendors
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

export default UploadVendorsDialog;
