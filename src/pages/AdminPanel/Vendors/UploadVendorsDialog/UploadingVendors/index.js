import {
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Step,
  StepLabel,
  Stepper
} from '@material-ui/core';
import React, { Fragment } from 'react';
import ActionsBar from '../../../../../components/ActionsBar';

const UploadingVendors = (props) => {
  const { stepLabels, activeStep } = props;
  return (
    <Fragment>
      <DialogTitle>Upload Vendors</DialogTitle>
      <DialogContent>
        <Grid container direction='column' justify='center' alignItems='center'>
          <CircularProgress />
          Uploading
        </Grid>
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
          disabled={true}
          isValid={false}
          onClick={null}
          tooltipPlacement='top'
          actionButtonText='Finish'
          additionalButtons={[
            {
              buttonText: 'Back',
              onClick: null,
              buttonLoading: false,
              buttonDisabled: true
            }
          ]}
        />
      </DialogActions>
    </Fragment>
  );
};

export default UploadingVendors;
