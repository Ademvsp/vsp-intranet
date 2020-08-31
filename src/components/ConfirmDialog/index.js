import React from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle
} from '@material-ui/core';

const ConfirmDialog = (props) => {
	return (
		<Dialog open={props.open} onClose={props.cancel}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{props.message}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.cancel} color='primary' variant='outlined'>
					Cancel
				</Button>
				<Button
					onClick={props.confirm}
					color='primary'
					variant='contained'
					autoFocus={true}
				>
					Confirm
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialog;
