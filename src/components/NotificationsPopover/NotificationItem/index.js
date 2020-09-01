import React, { Fragment } from 'react';
import {
	ListItemText,
	Typography,
	ListItemSecondaryAction,
	IconButton
} from '@material-ui/core';
import moment from 'moment';
import { StyledListItem } from './styled-components';
import { withRouter } from 'react-router-dom';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import * as notificationController from '../../../controllers/notification';

const NotificationItem = withRouter((props) => {
	const dispatch = useDispatch();
	const { page, subject, link, createdAt, notificationId } = props.notification;

	const deleteClickHandler = () => {
		dispatch(notificationController.clearNotification(notificationId));
	};

	return (
		<StyledListItem
			onClick={() => {
				if (link) {
					props.history.push(link);
				}
				props.closePopover();
			}}
			firstElement={props.firstElement}
		>
			<ListItemText
				primary={page}
				secondary={
					<Fragment>
						<Typography component='span' variant='body2' color='textPrimary'>
							{subject}
						</Typography>
						<br />
						{moment(createdAt.toDate()).format('llll')}
					</Fragment>
				}
			/>
			<ListItemSecondaryAction>
				<IconButton edge='end' onClick={deleteClickHandler}>
					<DeleteIcon fontSize='small' />
				</IconButton>
			</ListItemSecondaryAction>
		</StyledListItem>
	);
});

export default NotificationItem;
