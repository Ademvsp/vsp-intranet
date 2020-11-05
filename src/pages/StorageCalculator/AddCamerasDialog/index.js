import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import compressionTypes from '../../../data/compression-types';
import videoResolutions from '../../../data/video-resolutions';
import recordTypes, { CONTINUOUS, MOTION } from '../../../data/record-types';
import {
  Button,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Slider,
  TextField,
  Typography,
  withTheme
} from '@material-ui/core';
import { toPercentage } from '../../../utils/data-transformer';
const PERCENTAGE_MAX = 100;

const AddCamerasDialog = withTheme((props) => {
  const { open, close } = props;

  const validationSchema = yup.object().shape({
    quantity: yup.number().label('Quantity').required().min(1).max(10000),
    retention: yup.number().label('Retention').required().min(1).max(10000),
    compression: yup
      .object()
      .label('Compression')
      .required()
      .oneOf(compressionTypes),
    resolution: yup
      .object()
      .label('Resolution')
      .required()
      .oneOf(videoResolutions),
    recordType: yup.object().label('Record Type').required().oneOf(recordTypes),
    motion: yup.number().label('Motion').required().min(1).max(PERCENTAGE_MAX),
    motionFrameRate: yup.mixed().when('recordType', {
      is: CONTINUOUS,
      then: yup.number().label('Motion Framerate').notRequired,
      otherwise: yup
        .number()
        .label('Motion Framerate')
        .required()
        .min(1)
        .max(PERCENTAGE_MAX)
    }),
    continuousFrameRate: yup.mixed().when('recordType', {
      is: MOTION,
      then: yup.number().label('Continuous Framerate').notRequired,
      otherwise: yup
        .number()
        .label('Continuous Framerate')
        .required()
        .min(1)
        .max(240)
    }),
    adjustment: yup
      .number()
      .label('Bitrate Adjustment')
      .required()
      .min(-100)
      .max(100)
  });

  const initialValues = {
    quantity: 1,
    retention: 30,
    compression: compressionTypes[0],
    resolution: videoResolutions[0],
    recordType: recordTypes[0],
    motion: 1,
    motionFrameRate: 12,
    continuousFrameRate: 12,
    adjustment: 0
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema
  });

  const { validateForm, values } = formik;

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  useEffect(() => {}, [values]);

  return (
    <Dialog open={open} onClose={close} maxWidth='xs' fullWidth>
      <DialogTitle>Add Cameras</DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={2}>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type='number'
                label='Quantity'
                autoFocus
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
                  endAdornment: (
                    <InputAdornment position='start'>Cameras</InputAdornment>
                  ),
                  inputProps: {
                    min: 1,
                    max: 10000
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type='number'
                label='Retention'
                fullWidth
                value={formik.values.retention}
                onChange={formik.handleChange('retention')}
                onBlur={formik.handleBlur('retention')}
                helperText={
                  formik.errors.retention && formik.touched.retention
                    ? formik.errors.retention
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='start'>Days</InputAdornment>
                  ),
                  inputProps: {
                    min: 1,
                    max: 10000
                  }
                }}
              />
            </Grid>
          </Grid>

          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label='Compression'
                fullWidth
                value={formik.values.compression}
                onChange={formik.handleChange('compression')}
                helperText={
                  formik.errors.compression && formik.touched.compression
                    ? formik.errors.compression
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              >
                {compressionTypes.map((compressionType) => (
                  <MenuItem key={compressionType.name} value={compressionType}>
                    {compressionType.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label='Resolution'
                fullWidth
                value={formik.values.resolution}
                onChange={formik.handleChange('resolution')}
                helperText={
                  formik.errors.resolution && formik.touched.resolution
                    ? formik.errors.resolution
                    : null
                }
                FormHelperTextProps={{
                  style: {
                    color: props.theme.palette.error.main
                  }
                }}
              >
                {videoResolutions.map((videoResolution) => (
                  <MenuItem key={videoResolution.name} value={videoResolution}>
                    {videoResolution.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid item>
            <TextField
              select
              label='Record Type'
              fullWidth
              value={formik.values.recordType}
              onChange={formik.handleChange('recordType')}
              helperText={
                formik.errors.recordType && formik.touched.recordType
                  ? formik.errors.recordType
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
            >
              {recordTypes.map((recordType) => (
                <MenuItem key={recordType} value={recordType}>
                  {recordType}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item>
            <TextField
              type='number'
              label='Motion Activity (%)'
              fullWidth
              value={formik.values.motion}
              onChange={formik.handleChange('motion')}
              onBlur={formik.handleBlur('motion')}
              helperText={
                formik.errors.motion && formik.touched.motion
                  ? formik.errors.motion
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
                  min: 1,
                  max: PERCENTAGE_MAX
                }
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              type='number'
              label='Continuous Framerate'
              fullWidth
              value={formik.values.continuousFrameRate}
              onChange={formik.handleChange('continuousFrameRate')}
              onBlur={formik.handleBlur('continuousFrameRate')}
              helperText={
                formik.errors.continuousFrameRate &&
                formik.touched.continuousFrameRate
                  ? formik.errors.continuousFrameRate
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>FPS</InputAdornment>
                ),
                inputProps: {
                  min: 1,
                  max: 240
                }
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              type='number'
              label='Motion Framerate'
              fullWidth
              value={formik.values.motionFrameRate}
              onChange={formik.handleChange('motionFrameRate')}
              onBlur={formik.handleBlur('motionFrameRate')}
              helperText={
                formik.errors.motionFrameRate && formik.touched.motionFrameRate
                  ? formik.errors.motionFrameRate
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>FPS</InputAdornment>
                ),
                inputProps: {
                  min: 1,
                  max: 240
                }
              }}
            />
          </Grid>
          <Grid item>
            <Typography>{`Bitrate Adjustment: ${toPercentage(
              formik.values.adjustment
            )}`}</Typography>
            <Slider
              min={-100}
              max={100}
              value={formik.values.adjustment}
              onChange={(_event, newValue) =>
                formik.setFieldValue('adjustment', newValue)
              }
            />
          </Grid>
          <Grid item>
            <Paper variant='outlined'>
              <CardHeader title='Summary' style={{ paddingBottom: 0 }} />
              <CardContent>
                <Grid container direction='column' spacing={1}>
                  <Grid item container justify='space-between'>
                    <Typography>Frame Size</Typography>
                    <Typography>{1}</Typography>
                  </Grid>
                  <Grid item container justify='space-between'>
                    <Typography>Bitrate (per camera)</Typography>
                    <Typography>{'1 Mbps'}</Typography>
                  </Grid>
                  <Grid item container justify='space-between'>
                    <Typography>Bitrate (total)</Typography>
                    <Typography>{'1 Mbps'}</Typography>
                  </Grid>
                  <Grid item container justify='space-between'>
                    <Typography>Storage (per camera)</Typography>
                    <Typography>{'1 TB'}</Typography>
                  </Grid>
                  <Grid item container justify='space-between'>
                    <Typography>Storage (total)</Typography>
                    <Typography>{'1 TB'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' color='primary'>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default AddCamerasDialog;
