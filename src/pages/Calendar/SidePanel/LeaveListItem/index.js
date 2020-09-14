import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	CircularProgress,
	ListItem,
	ListItemAvatar,
	ListItemText
} from '@material-ui/core';
import Avatar from '../../../../components/Avatar';
import moment from 'moment';

const AnnualLeaveListItem = (props) => {
	const { activeUsers, events } = useSelector((state) => state.dataState);
	const [annualLeaveUsers, setAnnualLeaveUsers] = useState();
	const { eventTypeId } = props;
	useEffect(() => {
		const todayEvents = events.filter((event) => {
			const todayMatch = moment(new Date()).isBetween(
				moment(event.start).startOf('day'),
				moment(event.end).endOf('day')
			);
			const typeMatch = event.type === eventTypeId;
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

export default AnnualLeaveListItem;
