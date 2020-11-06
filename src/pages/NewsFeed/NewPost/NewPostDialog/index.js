import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Grid,
  ListItemAvatar,
  Typography,
  TextField,
  DialogContent,
  Dialog,
  withTheme
} from '@material-ui/core';
import Avatar from '../../../../components/Avatar';
import ActionsBar from '../../../../components/ActionsBar';
import BalloonEditorWrapper from '../../../../components/BalloonEditorWrapper';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import { addPost } from '../../../../store/actions/post';

const NewPostDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { authUser, open, close, clearSearchResults } = props;
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validatedOnMount, setValidatedOnMount] = useState(false);
  const initialValues = {
    attachments: [],
    notifyUsers: [],
    title: '',
    body: ''
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const submitHandler = async (values) => {
    setLoading(true);
    const result = await dispatch(addPost(values));
    setLoading(false);
    if (result) {
      formik.setValues(initialValues, true);
      clearSearchResults();
      close();
      history.push('/newsfeed/page/1');
    }
  };
  const validationSchema = yup.object().shape({
    attachments: yup.array().notRequired(),
    notifyUsers: yup.array().notRequired(),
    title: yup.string().label('Title').trim().required(),
    body: yup.string().label('Post Content').trim().required()
  });

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
    <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
      <DialogContent>
        <Grid container direction='column' spacing={2}>
          <Grid
            item
            container
            direction='row'
            justify='flex-start'
            alignItems='center'
          >
            <ListItemAvatar>
              <Avatar user={authUser} />
            </ListItemAvatar>
            <Typography>{authUser.getFullName()}</Typography>
          </Grid>
          <Grid item>
            <TextField
              label='Title'
              margin='dense'
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formik.values.title}
              onChange={formik.handleChange('title')}
              onBlur={formik.handleBlur('title')}
              disabled={loading}
              autoFocus={true}
              helperText={
                formik.errors.title && formik.touched.title
                  ? formik.errors.title
                  : null
              }
              FormHelperTextProps={{
                style: {
                  color: props.theme.palette.error.main
                }
              }}
            />
          </Grid>
          <Grid item container direction='column'>
            <Grid item>
              <BalloonEditorWrapper
                value={formik.values.body}
                setValue={formik.handleChange('body')}
                setTouched={() => formik.setFieldTouched('body', true)}
                setUploading={setUploading}
                loading={loading}
                borderChange={true}
                minHeight={100}
                maxHeight={300}
                placeholder='Write a post...'
              />
            </Grid>
            {formik.errors.body && formik.touched.body ? (
              <Grid item>
                <Typography
                  className='MuiFormHelperText-root MuiFormHelperText-marginDense'
                  style={{
                    color: props.theme.palette.error.main,
                    fontSize: props.theme.spacing(1.5)
                  }}
                >
                  {formik.errors.body}
                </Typography>
              </Grid>
            ) : null}
          </Grid>
          <Grid item>
            <ActionsBar
              notifications={{
                enabled: true,
                notifyUsers: formik.values.notifyUsers,
                setNotifyUsers: (notifyUsers) =>
                  formik.setFieldValue('notifyUsers', notifyUsers)
              }}
              attachments={{
                enabled: true,
                attachments: formik.values.attachments,
                setAttachments: (attachments) =>
                  formik.setFieldValue('attachments', attachments)
              }}
              buttonLoading={loading}
              disabled={loading || uploading || !validatedOnMount}
              isValid={formik.isValid}
              onClick={formik.handleSubmit}
              tooltipPlacement='top'
              actionButtonText='Post'
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
});

export default NewPostDialog;
