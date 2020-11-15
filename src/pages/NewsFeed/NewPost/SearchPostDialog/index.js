import React, { useEffect, useState } from 'react';
import {
  DialogActions,
  TextField,
  Button,
  DialogContent,
  Dialog,
  Grid,
  ListItemAvatar,
  ListItemText,
  withTheme
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { Autocomplete } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import Avatar from '../../../../components/Avatar';
import Post from '../../../../models/post';

const SearchPostDialog = withTheme((props) => {
  const history = useHistory();
  const { users } = useSelector((state) => state.dataState);
  const [loading, setLoading] = useState(false);
  const [validatedOnMount, setValidatedOnMount] = useState(false);
  const { open, close, setSearchResults } = props;

  const initialValues = { value: '', user: null };
  const validationSchema = yup.object().shape({
    value: yup.string().label('Search').trim().required(),
    user: yup.object().label('User').nullable()
  });

  const keyDownHandler = (event) => {
    if (event.keyCode === 13) {
      formik.handleSubmit();
    }
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const submitHandler = async (values) => {
    setLoading(true);
    const results = await Post.find(values);
    if (results) {
      formik.setValues(initialValues, true);
      setSearchResults(results);
      history.replace('/newsfeed/page/1');
    }
    close();
    setLoading(false);
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

  return (
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='xs'>
      <DialogContent>
        <TextField
          label='Search'
          margin='dense'
          fullWidth={true}
          value={formik.values.value}
          onKeyDown={keyDownHandler}
          onChange={formik.handleChange('value')}
          onBlur={formik.handleBlur('value')}
          disabled={loading}
          autoFocus={true}
          helperText={
            formik.errors.value && formik.touched.value
              ? formik.errors.value
              : null
          }
          FormHelperTextProps={{
            style: {
              color: props.theme.palette.error.main
            }
          }}
        />
        <Autocomplete
          options={users}
          getOptionLabel={(user) => user.getFullName()}
          value={formik.values.user}
          onChange={(event, newInputValue) =>
            formik.setFieldValue('user', newInputValue, true)
          }
          onBlur={formik.handleBlur('user')}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth={true}
              label='Posted by or commented on by'
              variant='standard'
            />
          )}
          renderOption={(option, _state) => (
            <Grid container direction='row' spacing={2}>
              <Grid item>
                <ListItemAvatar>
                  <Avatar user={option} />
                </ListItemAvatar>
              </Grid>
              <Grid item>
                <ListItemText primary={option.getFullName()} />
              </Grid>
            </Grid>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant='outlined'
          color='primary'
          onClick={formik.handleSubmit}
          disabled={!formik.isValid || loading || !validatedOnMount}
        >
          Search
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default SearchPostDialog;
