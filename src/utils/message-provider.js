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
import * as messageController from '../controllers/message';
import { DIALOG, SILENT, SNACKBAR } from './constants';
import Dialog from '../components/Dialog';
import Snackbar from '../components/Snackbar';

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
					</Dialog>
				);
				break;
			case SNACKBAR:
				messageComponent = (
					<Snackbar
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
