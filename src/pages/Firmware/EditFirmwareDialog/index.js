import {
  Collapse,
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
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ActionsBar from '../../../components/ActionsBar';
import {
  addComment,
  deleteFirmware,
  editFirmware
} from '../../../store/actions/firmware';
import Comments from '../../../components/Comments';
import Firmware from '../../../models/firmware';
import ConfirmDialog from '../../../components/ConfirmDialog';
import Avatar from '../../../components/Avatar';
const filter = createFilterOptions();

const EditFirmwareDialog = withTheme((props) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.dataState);
  const { open, close, firmware } = props;
  const [validatedOnMount, setValidatedOnMount] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const loading = deleteLoading || editLoading || commentLoading;

  const firmwareUser = users.find((user) => user.userId === firmware.user);

  const validationSchema = yup.object().shape({
    attachments: yup.array().required().min(1),
    notifyUsers: yup.array().notRequired(),
    title: yup.string().label('Title').trim().required(),
    products: yup.array().label('Products').required().min(1),
    body: yup.string().label('Release Notes').trim().notRequired()
  });

  const initialValues = {
    attachments: firmware.attachments,
    notifyUsers: [],
    title: firmware.title,
    products: firmware.products,
    body: firmware.body
  };

  const dialogCloseHandler = () => {
    if (!loading) {
      close();
    }
  };

  const deleteHandler = async () => {
    setDeleteLoading(true);
    await dispatch(deleteFirmware(firmware));
    setDeleteLoading(false);
    close();
  };

  const newCommentHandler = async (values) => {
    setCommentLoading(true);
    const result = await dispatch(addComment(firmware, values));
    setCommentLoading(false);
    return result;
  };

  const commentLikeClickHandler = async (reverseIndex) => {
    //Comments get reversed to display newest first, need to switch it back
    const index = firmware.comments.length - reverseIndex - 1;
    const newFirmware = new Firmware({ ...firmware });
    await newFirmware.toggleCommentLike(index);
  };

  const submitHandler = async (values) => {
    setEditLoading(true);
    const result = await dispatch(editFirmware(values));
    setEditLoading(false);
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

  const productRenderInput = (params) => (
    <TextField
      {...params}
      label='Products Affected'
      fullWidth
      helperText={
        formik.errors.products && formik.touched.products
          ? formik.errors.products
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
    const notEmpty = params.inputValue.trim() !== '';
    const productExists = formik.values.products.includes(params.inputValue);
    if (notEmpty && !productExists) {
      filtered.push(params.inputValue);
    }
    return filtered;
  };

  return (
    <Fragment>
      <ConfirmDialog
        open={showConfirmDialog}
        cancel={() => setShowConfirmDialog(false)}
        confirm={deleteHandler}
        title='Firmwares'
        message='Are you sure you want to delete this Firmwares?'
        loading={deleteLoading}
      />
      <Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
        <DialogTitle>
          <Grid container alignItems='center' spacing={1}>
            <Grid item>
              <Avatar user={firmwareUser} clickable contactCard />
            </Grid>
            <Grid item>Edit Firmware</Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <TextField
                label='Title'
                fullWidth
                value={formik.values.title}
                onChange={formik.handleChange('title')}
                onBlur={formik.handleBlur('title')}
                autoFocus
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
            <Grid item>
              <Autocomplete
                filterSelectedOptions
                multiple
                options={[]}
                getOptionLabel={(option) => option}
                getOptionSelected={(option, value) => option === value}
                value={formik.values.products}
                onChange={(_event, value) =>
                  formik.setFieldValue('products', value, true)
                }
                onBlur={formik.handleBlur('products')}
                filterOptions={productFilterOptions}
                renderInput={productRenderInput}
              />
            </Grid>
            <Grid item>
              <TextField
                label='Release Notes'
                multiline
                rows={5}
                rowsMax={5}
                fullWidth
                value={formik.values.body}
                onChange={formik.handleChange('body')}
                onBlur={formik.handleBlur('body')}
                helperText={
                  formik.errors.body && formik.touched.body
                    ? formik.errors.body
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
                formik.setFieldValue('attachments', attachments),
              emptyTooltip: 'You must attach at least one document'
            }}
            comments={{
              enabled: true,
              comments: firmware.comments,
              clickHandler: () => setShowComments((prevState) => !prevState)
            }}
            buttonLoading={editLoading || deleteLoading}
            disabled={loading || !validatedOnMount}
            isValid={formik.isValid}
            onClick={formik.handleSubmit}
            tooltipPlacement='top'
            actionButtonText='Update'
            additionalButtons={[
              {
                buttonText: 'Delete',
                onClick: () => setShowConfirmDialog(true),
                buttonLoading: deleteLoading,
                buttonDisabled: false
              }
            ]}
          />
        </DialogActions>
        <Collapse in={showComments} timeout='auto'>
          <Comments
            submitHandler={newCommentHandler}
            comments={[...firmware.comments].reverse()}
            actionBarNotificationProps={{
              enabled: true,
              tooltip:
                'The Firmware creator, and all comment participants will be notified automatically'
            }}
            commentLikeClickHandler={commentLikeClickHandler}
          />
        </Collapse>
      </Dialog>
    </Fragment>
  );
});

export default EditFirmwareDialog;
