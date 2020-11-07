import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import compressionTypes from '../../../data/compression-types';
import videoResolutions from '../../../data/video-resolutions';
import recordTypes, {
  CONTINUOUS,
  CONTINUOUS_MOTION,
  MOTION
} from '../../../data/record-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Slider,
  TextField,
  Typography,
  withTheme
} from '@material-ui/core';
import { toPercentage } from '../../../utils/data-transformer';
import ResultCard from './ResultCard';
const PERCENTAGE_MAX = 100;
const BYTES_TO_BITS = 8;
const B_TO_MB = 1024;
const KB_TO_TB = 1073741824;
const SECONDS_IN_A_DAY = 86400;

const EditCamerasDialog = withTheme((props) => {
  const { open, close, cameraGroup, editCameraGroupHandler } = props;
  const [result, setResult] = useState({
    frameSize: 0,
    bitrate: 0,
    bitrateTotal: 0,
    storage: 0,
    storageTotal: 0
  });

  const validationSchema = yup.object().shape({
    quantity: yup.number().label('Quantity').required().min(1).max(10000),
    retention: yup.number().label('Retention').required().min(1).max(10000),
    compression: yup
      .object()
      .label('Compression')
      .required()
      .test('isValidArrayElement', 'Compressions is not valid', (value) =>
        compressionTypes
          .map((compressionType) => compressionType.name)
          .includes(value.name)
      ),
    resolution: yup
      .object()
      .label('Resolution')
      .required()
      .test('isValidArrayElement', 'Resolution is not valid', (value) =>
        videoResolutions
          .map((videoResolution) => videoResolution.name)
          .includes(value.name)
      ),
    recordType: yup.string().label('Record Type').required().oneOf(recordTypes),
    motion: yup.number().label('Motion').required().min(1).max(PERCENTAGE_MAX),
    motionFramerate: yup.mixed().when('recordType', {
      is: CONTINUOUS,
      then: yup.number().label('Motion Framerate').notRequired(),
      otherwise: yup
        .number()
        .label('Motion Framerate')
        .required()
        .min(1)
        .max(PERCENTAGE_MAX)
    }),
    continuousFramerate: yup.mixed().when('recordType', {
      is: MOTION,
      then: yup.number().label('Continuous Framerate').notRequired(),
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
    quantity: cameraGroup.quantity,
    retention: cameraGroup.retention,
    compression: cameraGroup.compression,
    resolution: cameraGroup.resolution,
    recordType: cameraGroup.recordType,
    motion: cameraGroup.motion,
    motionFramerate: cameraGroup.motionFramerate,
    continuousFramerate: cameraGroup.continuousFramerate,
    adjustment: cameraGroup.adjustment
  };

  const submitHandler = (values) => {
    editCameraGroupHandler({
      ...cameraGroup,
      ...values,
      bitrate: result.bitrate,
      storage: result.storage
    });
    close();
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: submitHandler
  });

  const { validateForm, values } = formik;

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  useEffect(() => {
    const frameSize =
      values.resolution.frameSize * values.compression.multiplier;
    const frameSizeOverhead = (frameSize * values.adjustment) / 100;
    const frameSizeTotal = frameSize + frameSizeOverhead;

    const continuousStorage =
      frameSizeTotal *
      values.continuousFramerate *
      SECONDS_IN_A_DAY *
      values.retention;

    const motionDecimal = values.motion / 100;

    const motionStorage =
      frameSizeTotal *
      values.motionFramerate *
      SECONDS_IN_A_DAY *
      values.retention *
      motionDecimal;
    //Calculate difference in frames and storage on Continuou + Motion mode
    const differenceFramerate =
      values.motionFramerate - values.continuousFramerate;
    const differenceStorage =
      frameSizeTotal *
      differenceFramerate *
      SECONDS_IN_A_DAY *
      values.retention *
      motionDecimal;

    const motionContinuousStorage = continuousStorage + differenceStorage;

    let framerate;
    let storage;

    if (values.recordType === MOTION) {
      framerate = values.motionFramerate;
      storage = motionStorage / KB_TO_TB;
    } else if (values.recordType === CONTINUOUS) {
      framerate = values.continuousFramerate;
      storage = continuousStorage / KB_TO_TB;
    } else if (values.recordType === CONTINUOUS_MOTION) {
      framerate =
        values.motionFramerate > values.continuousFramerate
          ? values.motionFramerate
          : values.continuousFramerate;
      storage = motionContinuousStorage / KB_TO_TB;
    }
    const bitrate = (frameSizeTotal * framerate * BYTES_TO_BITS) / B_TO_MB;
    const bitrateTotal = bitrate * values.quantity;
    const storageTotal = storage * values.quantity;

    const newResult = {
      frameSize: frameSizeTotal,
      bitrate: bitrate,
      bitrateTotal: bitrateTotal,
      storage: storage,
      storageTotal: storageTotal
    };
    setResult(newResult);
  }, [values]);

  const showContinuousFramerate =
    formik.values.recordType === CONTINUOUS ||
    formik.values.recordType === CONTINUOUS_MOTION;

  const showMotionFramerate =
    formik.values.recordType === MOTION ||
    formik.values.recordType === CONTINUOUS_MOTION;

  const showMotionActivity = showMotionFramerate;

  return (
    <Dialog open={open} onClose={close} maxWidth='xs' fullWidth>
      <DialogTitle>Edit Cameras</DialogTitle>
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
          {showMotionActivity && (
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
          )}
          {showContinuousFramerate && (
            <Grid item>
              <TextField
                type='number'
                label='Continuous Framerate'
                fullWidth
                value={formik.values.continuousFramerate}
                onChange={formik.handleChange('continuousFramerate')}
                onBlur={formik.handleBlur('continuousFramerate')}
                helperText={
                  formik.errors.continuousFramerate &&
                  formik.touched.continuousFramerate
                    ? formik.errors.continuousFramerate
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
          )}
          {showMotionFramerate && (
            <Grid item>
              <TextField
                type='number'
                label='Motion Framerate'
                fullWidth
                value={formik.values.motionFramerate}
                onChange={formik.handleChange('motionFramerate')}
                onBlur={formik.handleBlur('motionFramerate')}
                helperText={
                  formik.errors.motionFramerate &&
                  formik.touched.motionFramerate
                    ? formik.errors.motionFramerate
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
          )}
          <Grid item>
            <Typography>{`Bitrate Adjustment: ${toPercentage(
              formik.values.adjustment
            )}`}</Typography>
            <Slider
              valueLabelDisplay='auto'
              marks={[{ value: 0 }]}
              min={-100}
              max={100}
              value={formik.values.adjustment}
              onChange={(_event, newValue) =>
                formik.setFieldValue('adjustment', newValue)
              }
            />
          </Grid>
          <Grid item>
            <ResultCard result={result} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant='contained'
          color='primary'
          onClick={formik.handleSubmit}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default EditCamerasDialog;
