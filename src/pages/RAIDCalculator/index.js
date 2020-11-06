import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
  withTheme
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import raidTypes from '../../data/raid-types';
import harddrives from '../../data/harddrives';
import { toDecimal } from '../../utils/data-transformer';
const HARDDRIVE_OVERHEAD = 0.91;

const PricingCalculator = withTheme((props) => {
  const [result, setResult] = useState();

  const validationSchema = yup.object().shape({
    raid: yup
      .object()
      .label('Raid Type')
      .required()
      .test('isValidArrayElement', 'Raid Type is not valid', (value) =>
        raidTypes.map((raidType) => raidType.name).includes(value.name)
      ),
    harddrive: yup
      .object()
      .label('Harddrive Size')
      .required()
      .test('isValidArrayElement', 'Harddrive Size is not valid', (value) =>
        harddrives.map((harddrive) => harddrive.name).includes(value.name)
      ),
    quantity: yup
      .number()
      .label('Harddrive Quantity')
      .required()
      .min(0)
      .max(1000)
  });

  const initialValues = {
    raid: raidTypes[0],
    harddrive: harddrives[0],
    quantity: 1
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
    let newResult =
      (values.quantity - values.raid.penalty) * values.harddrive.size;
    if (values.raid.penalty === -1) {
      newResult = (values.quantity * values.harddrive.size) / 2;
    }
    newResult *= HARDDRIVE_OVERHEAD;
    setResult(newResult);
  }, [values]);

  return (
    <Container disableGutters maxWidth='xs'>
      <Card>
        <CardContent>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <TextField
                select
                label='RAID Type'
                fullWidth
                value={formik.values.raid}
                onChange={formik.handleChange('raid')}
                helperText={
                  formik.errors.raid && formik.touched.raid
                    ? formik.errors.raid
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              >
                {raidTypes.map((raidType) => (
                  <MenuItem key={raidType.name} value={raidType}>
                    {raidType.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                select
                label='Harddrive Size'
                fullWidth
                value={formik.values.harddrive}
                onChange={formik.handleChange('harddrive')}
                helperText={
                  formik.errors.harddrive && formik.touched.harddrive
                    ? formik.errors.harddrive
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              >
                {harddrives.map((harddrive) => (
                  <MenuItem key={harddrive.name} value={harddrive}>
                    {harddrive.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                type='number'
                label='Harddrive Quantity'
                fullWidth
                value={formik.values.quantity}
                onChange={formik.handleChange('quantity')}
                onBlur={formik.handleBlur('quantity')}
                helperText={
                  formik.errors.quantity && formik.touched.quantity
                    ? formik.errors.quantity
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: 1000
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
                      <Typography>Usable Storage</Typography>
                      <Typography>{`${toDecimal(result, 2)}TB`}</Typography>
                    </Grid>
                    <Grid item container justify='flex-end'>
                      <Typography>{formik.values.raid.description}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
});

export default PricingCalculator;
