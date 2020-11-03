import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid
} from '@material-ui/core';

const ConfirmDialog = (props) => {
  const { open, cancel, title, message, confirm, loading } = props;

  const dialogCloseHandler = () => {
    if (!loading) {
      cancel();
    }
  };

  return (
    <Dialog open={open} onClose={dialogCloseHandler} maxWidth='xs' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Grid container justify='flex-end' wrap='nowrap' spacing={1}>
          <Grid item>
            <Button
              onClick={cancel}
              color='primary'
              variant='outlined'
              disabled={loading}
            >
              Cancel
            </Button>
          </Grid>
          <Grid
            item
            container
            justify='center'
            alignItems='center'
            style={{ width: 'auto' }}
          >
            <Button
              onClick={confirm}
              color='primary'
              variant='contained'
              autoFocus={true}
              disabled={loading}
            >
              Confirm
            </Button>
            {loading && (
              <CircularProgress size={25} style={{ position: 'absolute' }} />
            )}
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
