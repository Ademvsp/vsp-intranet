import React, { Fragment } from 'react';
import {
	ListItemText,
	Typography,
	ListItemSecondaryAction,
	IconButton
} from '@material-ui/core';
import { LONG_DATE_TIME } from '../../../../utils/date';
import { format } from 'date-fns';
import { StyledListItem } from './styled-components';
import { useHistory } from 'react-router-dom';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import * as notificationController from '../../../../controllers/notification';

const NotificationItem = (props) => {
	const history = useHistory();
	const dispatch = useDispatch();
	const { page, title, link, metadata } = props.notification;

	const deleteClickHandler = () => {
		dispatch(notificationController.clearNotification(props.notification));
	};

	return (
		<StyledListItem
			onClick={() => {
				if (link) {
					history.push(link);
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
							{title}
						</Typography>
						<br />
						{format(metadata.createdAt, LONG_DATE_TIME)}
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
};

export default NotificationItem;
