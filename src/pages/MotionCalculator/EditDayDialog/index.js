import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slider,
  Typography
} from '@material-ui/core';
import React, { useState } from 'react';
import { toPercentage } from '../../../utils/data-transformer';
import { hours } from '../table-data';

const EditDayDialog = (props) => {
  const { open, close, day, editDayHandler } = props;
  const [motionValues, setMotionValues] = useState(day.values);

  const submitHandler = () => {
    editDayHandler({
      ...day,
      values: motionValues
    });
    close();
  };

  const motionValueUpdateHandler = (index, newValue) => {
    const newMotionValues = [...motionValues];
    newMotionValues.splice(index, 1, newValue);
    setMotionValues(newMotionValues);
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth='sm'>
      <DialogTitle>{`Edit ${day.day}`}</DialogTitle>
      <DialogContent style={{ overflowY: 'auto' }}>
        <Grid container direction='column' spacing={1}>
          {motionValues.map((motionValue, index) => {
            const motionValuePercentage = toPercentage(motionValue);
            const motionValueText = `${hours[index]}: ${motionValuePercentage}`;
            return (
              <Grid key={hours[index]} item container direction='column'>
                <Grid
                  item
                  container
                  justify='space-between'
                  alignItems='center'
                >
                  <Grid item>
                    <Typography>{motionValueText}</Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      onClick={() =>
                        motionValueUpdateHandler(index, day.values[index])
                      }
                      disabled={motionValue === day.values[index]}
                      variant='text'
                    >
                      Reset
                    </Button>
                  </Grid>
                </Grid>
                <Grid item>
                  <Slider
                    value={motionValue}
                    valueLabelDisplay='auto'
                    onChange={(_event, newValue) =>
                      motionValueUpdateHandler(index, newValue)
                    }
                  />
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' color='primary' onClick={submitHandler}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDayDialog;
