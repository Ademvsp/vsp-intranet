import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  withTheme
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toCurrency } from '../../utils/data-transformer';
const STORAGE_MAX = 99999;
const BANDWIDTH_MAX = 9999;
const STORAGE_SELL = 28.35;
const BANDWIDTH_SELL = 4.2;

const VSAASCalculator = withTheme((props) => {
  const [result, setResult] = useState(0);

  const validationSchema = yup.object().shape({
    storage: yup.number().label('Storage').required().min(0).max(STORAGE_MAX),
    bandwidth: yup
      .number()
      .label('Bandwidth')
      .required()
      .min(0)
      .max(BANDWIDTH_MAX)
  });

  const initialValues = {
    storage: 0,
    bandwidth: 0
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema
  });

  const { validateForm, values } = formik;

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  useEffect(() => {
    const storageSell = STORAGE_SELL * values.storage;
    const bandwidthSell = BANDWIDTH_SELL * values.bandwidth;
    const total = storageSell + bandwidthSell;
    setResult(total);
  }, [values]);

  return (
    <Container disableGutters maxWidth='xs'>
      <Card>
        <CardContent>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <TextField
                type='number'
                label='Storage'
                autoFocus
                fullWidth
                value={formik.values.storage}
                onChange={formik.handleChange('storage')}
                onBlur={formik.handleBlur('storage')}
                helperText={
                  formik.errors.storage && formik.touched.storage
                    ? formik.errors.storage
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='start'>TB</InputAdornment>
                  ),
                  inputProps: {
                    min: 0,
                    max: STORAGE_MAX
                  }
                }}
              />
            </Grid>
            <Grid item>
              <TextField
                type='number'
                label='Bandwidth'
                fullWidth
                value={formik.values.bandwidth}
                onChange={formik.handleChange('bandwidth')}
                onBlur={formik.handleBlur('bandwidth')}
                helperText={
                  formik.errors.bandwidth && formik.touched.bandwidth
                    ? formik.errors.bandwidth
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='start'>Mb/s</InputAdornment>
                  ),
                  inputProps: {
                    min: 0,
                    max: BANDWIDTH_MAX
                  }
                }}
              />
            </Grid>
            <Grid item>
              <Paper variant='outlined'>
                <CardHeader title='Summary' style={{ paddingBottom: 0 }} />
                <CardContent>
                  <Grid container direction='column' spacing={1}>
                    <Grid item container justify='space-between'>
                      <Typography>Total sell / month</Typography>
                      <Typography>{toCurrency(result)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Grid>
            <Grid item container>
              <Typography variant='caption'>
                • The integrator or end user is responsible for supplying their
                own suitable internet connection.
              </Typography>
              <Typography variant='caption'>
                • Pricing can only be used for cameras running 1080P/25FPS,
                H.264/H.265 or under.
              </Typography>
              <Typography variant='caption'>
                • Access to system is via the NX Client, NX Mobile and NX Cloud
                only. No operating system level access.
              </Typography>
              <Typography variant='caption'>
                • On the first Tuesday of every quarter, there will be a 1-hour
                system maintenance down-time at 11am.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
});

export default VSAASCalculator;
