import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	CircularProgress,
	ListItem,
	ListItemAvatar,
	ListItemText
} from '@material-ui/core';
import Avatar from '../../../../components/Avatar';
import { startOfDay, endOfDay } from 'date-fns';

const LeaveListItem = (props) => {
	const { activeUsers, events } = useSelector((state) => state.dataState);
	const [annualLeaveUsers, setAnnualLeaveUsers] = useState();
	const { eventTypeId } = props;
	useEffect(() => {
		const todayEvents = events.filter((event) => {
			console.log('new Date()', new Date());
			console.log('event.start', startOfDay(event.start));
			console.log('event.end', endOfDay(event.end));
			const todayMatch =
				new Date() >= startOfDay(event.start) &&
				new Date() <= endOfDay(event.end);
			console.log(todayMatch);
			// 	isWithinInterval(new Date(), {
			// 	start: startOfDay(event.start),
			// 	end: startOfDay(event.end)
			// });
			const typeMatch = event.type === eventTypeId;
			console.log(eventTypeId);
			console.log(event.type);
			return todayMatch && typeMatch;
		});

		const eventUsers = todayEvents.map((todayEvent) => todayEvent.createdBy);

		const newAnnualLeaveUsers = activeUsers.filter((activeUser) =>
			eventUsers.includes(activeUser.userId)
		);

		setAnnualLeaveUsers(newAnnualLeaveUsers);
	}, [events, activeUsers, eventTypeId]);

	if (!annualLeaveUsers) {
		return <CircularProgress />;
	}

	return annualLeaveUsers.map((annualLeaveUser) => {
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
