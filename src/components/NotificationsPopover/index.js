import React, { useState, Fragment } from 'react';
import {
	StyledIconButton,
	StyledToolbar,
	StyledList,
	StyledTitle,
	StyledClearAllIcon
} from './styled-components';
import {
	Badge,
	Divider,
	IconButton,
	Tooltip,
	Popover
} from '@material-ui/core';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import NotificationItem from './NotificationItem';
import * as notificationController from '../../controllers/notification';

const NotificationsPopover = (props) => {
	const dispatch = useDispatch();
	const notificationState = useSelector((state) => state.notificationState);
	const notifications = notificationState.notifications;
	const [anchorEl, setAnchorEl] = useState(null);

	const closePopoverHandler = () => {
		setAnchorEl(null);
	};

	const notificationsClearHandler = async () => {
		dispatch(notificationController.clearNotifications());
		closePopoverHandler();
	};

	return (
		<Fragment>
			<StyledIconButton
				edge='start'
				color='inherit'
				onClick={(event) => {
					if (notifications.length > 0) {
						setAnchorEl(event.currentTarget);
					}
				}}
			>
				<Badge badgeContent={notifications.length} max={99} color='secondary'>
					<NotificationsIcon />
				</Badge>
			</StyledIconButton>

			<Popover
				open={!!anchorEl}
				anchorEl={anchorEl}
				onClose={closePopoverHandler}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
			>
				<StyledToolbar>
					<StyledTitle variant='h6'>Notifications</StyledTitle>
					<Tooltip title='Clear all' placement='bottom'>
						<IconButton onClick={notificationsClearHandler}>
							<StyledClearAllIcon />
						</IconButton>
					</Tooltip>
				</StyledToolbar>
				<StyledList>
					{notifications.map((notification, index, array) => {
						const firstElement = index === 0;
						const lastElement = index !== array.length - 1;
						return (
							<Fragment key={notification.notificationId}>
								<NotificationItem
									notification={notification}
									closePopover={() => setAnchorEl(null)}
									firstElement={firstElement}
								/>
								{lastElement && <Divider />}
							</Fragment>
						);
					})}
				</StyledList>
			</Popover>
		</Fragment>
	);
};

export default NotificationsPopover;
