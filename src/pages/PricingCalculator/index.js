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
import freightTypes, { PERCENTAGE } from '../../data/freight-types';
import { toCurrency, toPercentage } from '../../utils/data-transformer';

const PricingCalculator = withTheme((props) => {
  const DOLLAR_MAX = 10000000;
  const PERCENTAGE_MAX = 100;
  const [result, setResult] = useState({
    cost: 0,
    freight: 0,
    markup: 0,
    profit: 0,
    sell: 0
  });

  const validationSchema = yup.object().shape({
    cost: yup.number().label('Cost').required().min(0).max(DOLLAR_MAX),
    freightType: yup
      .string()
      .label('Freight Type')
      .required()
      .oneOf(freightTypes),
    freight: yup.mixed().when('freightType', {
      is: PERCENTAGE,
      then: yup
        .number()
        .label('Freight Percentage')
        .required()
        .min(0)
        .max(PERCENTAGE_MAX),
      otherwise: yup
        .number()
        .label('Freight Price')
        .required()
        .min(0)
        .max(DOLLAR_MAX)
    }),
    margin: yup
      .number()
      .label('Margin')
      .required()
      .min(0)
      .max(PERCENTAGE_MAX - 1)
  });

  const initialValues = {
    cost: 0,
    freightType: freightTypes[0],
    freight: 0,
    margin: 0
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema
  });

  const { validateForm, values } = formik;

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  let freightInputProps = {
    startAdornment: <InputAdornment position='start'>$</InputAdornment>
  };
  let freightMax = DOLLAR_MAX;
  if (formik.values.freightType === PERCENTAGE) {
    freightInputProps = {
      endAdornment: <InputAdornment position='start'>%</InputAdornment>
    };
    freightMax = PERCENTAGE_MAX;
  }

  useEffect(() => {
    let freight = values.freight;
    if (values.freightType === PERCENTAGE) {
      freight = values.cost * (values.freight / 100);
    }
    const cost = values.cost + freight;
    const marginDecimal = values.margin / 100;
    const markupDecimal = marginDecimal / (1 - marginDecimal);
    const markup = markupDecimal * 100;
    const sell = cost / (1 - marginDecimal);
    const profit = sell - cost;
    setResult({ freight, markup, profit, sell });
  }, [values]);

  return (
    <Container disableGutters maxWidth='xs'>
      <Card>
        <CardContent>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <TextField
                type='number'
                autoFocus
                label='Cost'
                fullWidth
                value={formik.values.cost}
                onChange={formik.handleChange('cost')}
                onBlur={formik.handleBlur('cost')}
                helperText={
                  formik.errors.cost && formik.touched.cost
                    ? formik.errors.cost
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>$</InputAdornment>
                  ),
                  inputProps: {
                    min: 0,
                    max: DOLLAR_MAX
                  }
                }}
              />
            </Grid>
            <Grid item>
              <TextField
                select
                label='Freight Type'
                fullWidth
                value={formik.values.freightType}
                onChange={formik.handleChange('freightType')}
              >
                {freightTypes.map((freightType) => (
                  <MenuItem key={freightType} value={freightType}>
                    {freightType}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                type='number'
                label={`Freight (${formik.values.freightType})`}
                fullWidth
                value={formik.values.freight}
                onChange={formik.handleChange('freight')}
                onBlur={formik.handleBlur('freight')}
                helperText={
                  formik.errors.freight && formik.touched.freight
                    ? formik.errors.freight
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
                InputProps={{
                  ...freightInputProps,
                  inputProps: {
                    min: 0,
                    max: freightMax
                  }
                }}
              />
            </Grid>
            <Grid item>
              <TextField
                type='number'
                label={'Margin'}
                fullWidth
                value={formik.values.margin}
                onChange={formik.handleChange('margin')}
                onBlur={formik.handleBlur('margin')}
                helperText={
                  formik.errors.margin && formik.touched.margin
                    ? formik.errors.margin
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='start'>%</InputAdornment>
                  ),
                  inputProps: {
                    min: 0,
                    max: PERCENTAGE_MAX - 1
                  }
                }}
              />
            </Grid>
            <Grid item>
              <Paper variant='outlined'>
                <CardHeader title='Summary' />
                <CardContent>
                  <Grid container direction='column' spacing={1}>
                    <Grid item container justify='space-between'>
                      <Typography>Cost</Typography>
                      <Typography>{toCurrency(values.cost, 2)}</Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Freight</Typography>
                      <Typography>{toCurrency(result.freight, 2)}</Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Markup</Typography>
                      <Typography>{toPercentage(result.markup, 2)}</Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Margin</Typography>
                      <Typography>{toPercentage(values.margin, 2)}</Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Profit</Typography>
                      <Typography>{toCurrency(result.profit, 2)}</Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Sell</Typography>
                      <Typography>{toCurrency(result.sell, 2)}</Typography>
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
