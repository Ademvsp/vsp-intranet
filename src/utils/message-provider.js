import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	Dialog,
	DialogActions,
	DialogContentText,
	DialogTitle,
	Button,
	Snackbar
} from '@material-ui/core/';
import { Alert, AlertTitle } from '@material-ui/lab';
import { StyledDialogContent } from './styled-components';
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
					<Dialog open={feedback === DIALOG} onClose={messageClearHandler}>
						<DialogTitle>{title}</DialogTitle>
						<StyledDialogContent>
							<DialogContentText>{body}</DialogContentText>
						</StyledDialogContent>
						<DialogActions>
							<Button
								onClick={messageClearHandler}
								color='primary'
								autoFocus={true}
							>
								Close
							</Button>
						</DialogActions>
					</Dialog>
				);
				break;
			case SNACKBAR:
				messageComponent = (
					<Snackbar
						open={feedback === SNACKBAR}
						autoHideDuration={5000}
						onClose={messageClearHandler}
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
					</Snackbar>
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
