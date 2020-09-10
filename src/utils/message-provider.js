import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	DialogActions,
	DialogContentText,
	DialogTitle,
	Button,
	DialogContent
} from '@material-ui/core/';
import { Alert, AlertTitle } from '@material-ui/lab';
import { StyledSnackbar, StyledDialog } from './styled-components';
import * as messageController from '../controllers/message';
import { DIALOG, SILENT, SNACKBAR } from './constants';

const MessageHandler = (props) => {
	const dispatch = useDispatch();
	const { message } = useSelector((state) => state.messageState);
	const messageClearHandler = () => {
		dispatch(messageController.clearMessage());
	};
	let messageComponent;
	if (message) {
		const { title, body, feedback, options } = message;
		switch (feedback) {
			case DIALOG:
				messageComponent = (
					<StyledDialog
						open={feedback === DIALOG}
						onClose={messageClearHandler}
					>
						<DialogTitle>{title}</DialogTitle>
						<DialogContent>
							<DialogContentText>{body}</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={messageClearHandler}
								color='primary'
								autoFocus={true}
							>
								Close
							</Button>
						</DialogActions>
					</StyledDialog>
				);
				break;
			case SNACKBAR:
				messageComponent = (
					<StyledSnackbar
						open={feedback === SNACKBAR}
						autoHideDuration={options.duration}
						onClose={messageClearHandler}
						onClick={options.onClick ? options.onClick : null}
						hover={options.onClick ? true : false}
					>
						<Alert
							onClose={messageClearHandler}
							severity={options.severity}
							variant={options.variant}
							elevation={6}
						>
							<AlertTitle>{title}</AlertTitle>
							{body}
						</Alert>
					</StyledSnackbar>
				);
				break;
			case SILENT:
				messageComponent = null;
				break;
			default:
				break;
		}
	}

	return (
		<Fragment>
			{messageComponent}
			{props.children}
		</Fragment>
	);
};

export default MessageHandler;
