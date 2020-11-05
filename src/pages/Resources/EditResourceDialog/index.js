import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  withTheme
} from '@material-ui/core';
import Autocomplete, {
  createFilterOptions
} from '@material-ui/lab/Autocomplete';
import { useFormik } from 'formik';
import * as yup from 'yup';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ActionsBar from '../../../components/ActionsBar';
import { editResource } from '../../../store/actions/resource';
const filter = createFilterOptions();

const EditResourceDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { open, close, folders, resource } = props;
  const [loading, setLoading] = useState();
  const [validatedOnMount, setValidatedOnMount] = useState(false);
  const [folderOptions, setFolderOptions] = useState([...folders]);

  const validationSchema = yup.object().shape({
    name: yup.string().label('Name').trim().required(),
    folder: yup.string().label('Folder').trim().nullable().required(),
    link: yup.string().url().label('Link').trim().required()
  });

  const initialValues = {
    name: resource.name,
    folder: resource.folder,
    link: resource.link
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const submitHandler = async (values) => {
    setLoading(true);
    const result = await dispatch(editResource(resource, values));
    setLoading(false);
    if (result) {
      formik.setValues(initialValues);
      close();
    }
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: submitHandler,
    validationSchema: validationSchema
  });

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  const folderRenderInput = (params) => (
    <TextField
      {...params}
      label='Folder'
      fullWidth
      helperText={
        formik.errors.folder && formik.touched.folder
          ? formik.errors.folder
          : null
      }
      FormHelperTextProps={{
        style: {
          color: props.theme.palette.error.main
        }
      }}
    />
  );

  const productFilterOptions = (options, params) => {
    const filtered = filter(options, params);
    if (params.inputValue.trim() !== '') {
      filtered.push(params.inputValue);
    }
    return filtered;
  };

  const productChangeHandler = (_event, value) => {
    if (value && !folderOptions.includes(value)) {
      const newFolderOptions = [...folderOptions, value];
      newFolderOptions.sort((a, b) =>
        a.toLowerCase() > b.toLowerCase() ? 1 : -1
      );
      setFolderOptions(newFolderOptions);
    }
    formik.setFieldValue('folder', value, true);
  };

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Resource</DialogTitle>
      <DialogContent>
        <Grid container direction='column' spacing={1}>
          <Grid item>
            <TextField
              label='Name'
              fullWidth
              value={formik.values.name}
              onChange={formik.handleChange('name')}
              onBlur={formik.handleBlur('name')}
              autoFocus
              helperText={
                formik.errors.name && formik.touched.name
                  ? formik.errors.name
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
            />
          </Grid>
          <Grid item>
            <Autocomplete
              filterSelectedOptions
              options={folderOptions}
              getOptionLabel={(option) => option}
              getOptionSelected={(option, value) => option === value}
              value={formik.values.folder}
              onChange={productChangeHandler}
              onBlur={formik.handleBlur('folder')}
              filterOptions={productFilterOptions}
              renderInput={folderRenderInput}
            />
          </Grid>
          <Grid item>
            <TextField
              label='Link'
              fullWidth
              value={formik.values.link}
              onChange={formik.handleChange('link')}
              onBlur={formik.handleBlur('link')}
              helperText={
                formik.errors.link && formik.touched.link
                  ? formik.errors.link
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <ActionsBar
          buttonLoading={loading}
          disabled={loading || !validatedOnMount}
          isValid={formik.isValid}
          onClick={formik.handleSubmit}
          tooltipPlacement='top'
          actionButtonText='Update'
        />
      </DialogActions>
    </Dialog>
  );
});

export default EditResourceDialog;
