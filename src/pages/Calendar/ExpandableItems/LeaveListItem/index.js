import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	CircularProgress,
	ListItem,
	ListItemAvatar,
	ListItemText
} from '@material-ui/core';
import Avatar from '../../../../components/Avatar';
import { startOfDay, endOfDay } from 'date-fns';
import { EventContext } from '../..';

const LeaveListItem = (props) => {
	const { activeUsers } = useSelector((state) => state.dataState);
	const { events } = useContext(EventContext);
	const [leaveUsers, setLeaveUsers] = useState();
	const { eventTypeName } = props;
	useEffect(() => {
		const todayEvents = events.filter((event) => {
			const todayMatch =
				new Date() >= startOfDay(event.start) &&
				new Date() <= endOfDay(event.end);
			const typeMatch = event.type === eventTypeName;
			return todayMatch && typeMatch;
		});

		const eventUsers = todayEvents.map(
			(todayEvent) => todayEvent.metadata.createdBy
		);

		const newLeaveUsers = activeUsers.filter((activeUser) =>
			eventUsers.includes(activeUser.userId)
		);

		setLeaveUsers(newLeaveUsers);
	}, [events, activeUsers, eventTypeName]);

	if (!leaveUsers) {
		return <CircularProgress />;
	}

	return leaveUsers.map((annualLeaveUser) => {
		return (
			<ListItem key={annualLeaveUser.userId}>
				<ListItemAvatar>
					<Avatar user={annualLeaveUser} clickable={true} contactCard={true} />
				</ListItemAvatar>
				<ListItemText
					primary={annualLeaveUser.firstName}
					secondary={annualLeaveUser.lastName}
				/>
			</ListItem>
		);
	});
};

export default LeaveListItem;
