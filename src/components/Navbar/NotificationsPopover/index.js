import React, { useCallback, useEffect, useState, Fragment } from 'react';
import {
	StyledList,
	StyledTitle,
	StyledClearAllIcon
} from './styled-components';
import {
	Badge,
	Divider,
	IconButton,
	Tooltip,
	Popover,
	Grid
} from '@material-ui/core';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import NotificationItem from './NotificationItem';
import { clearNotifications } from '../../../store/actions/notification';

const NotificationsPopover = (props) => {
	const dispatch = useDispatch();
	const notificationState = useSelector((state) => state.notificationState);
	const notifications = notificationState.notifications;
	const [anchorEl, setAnchorEl] = useState(null);

	const closePopoverHandler = useCallback(() => {
		setAnchorEl(null);
	}, []);
	//Close the popover as soon as notifications are empty
	useEffect(() => {
		if (notifications.length === 0) {
			closePopoverHandler();
		}
	}, [notifications, closePopoverHandler]);

	const notificationsClearHandler = async () => {
		dispatch(clearNotifications());
	};

	return (
		<Fragment>
			<IconButton
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
			</IconButton>

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
				<Grid container justify='space-between'>
					<Grid item>
						<StyledTitle variant='h6'>Notifications</StyledTitle>
					</Grid>
					<Grid item>
						<Tooltip title='Clear all' placement='bottom'>
							<IconButton onClick={notificationsClearHandler}>
								<StyledClearAllIcon />
							</IconButton>
						</Tooltip>
					</Grid>
				</Grid>
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
