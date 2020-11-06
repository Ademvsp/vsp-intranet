import { Grid, TextField } from '@material-ui/core';
import React from 'react';
import { format } from 'date-fns';
import { LONG_DATE } from '../../../../utils/date';

const LeaveRequestForm = (props) => {
  const { leaveRequest } = props;
  const { start, end, type, reason } = leaveRequest;
  return (
    <Grid container direction='column' spacing={2}>
      <Grid item container direction='row' spacing={2}>
        <Grid item xs={6}>
          <TextField
            label='Start'
            fullWidth
            value={format(start, LONG_DATE)}
            inputProps={{
              readOnly: true
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label='End'
            fullWidth
            value={format(end, LONG_DATE)}
            inputProps={{
              readOnly: true
            }}
          />
        </Grid>
      </Grid>
      <Grid item>
        <TextField
          label='Leave Type'
          fullWidth
          value={type}
          inputProps={{
            readOnly: true
          }}
        />
      </Grid>
      <Grid item>
        <TextField
          label='Reason'
          fullWidth
          value={reason}
          inputProps={{
            readOnly: true
          }}
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  );
};

export default LeaveRequestForm;
