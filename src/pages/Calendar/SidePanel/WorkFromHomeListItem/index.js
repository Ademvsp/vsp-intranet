import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	CircularProgress,
	ListItem,
	ListItemAvatar,
	ListItemText
} from '@material-ui/core';
import Avatar from '../../../../components/Avatar';

const WorkFromHomeListItem = (props) => {
	const { activeUsers } = useSelector((state) => state.dataState);
	const [workFromHomeUsers, setWorkFromHomeUsers] = useState();

	useEffect(() => {
		const newWorkFromHomeUsers = activeUsers.filter(
			(activeUser) => activeUser.settings.workFromHome
		);
		setWorkFromHomeUsers(newWorkFromHomeUsers);
	}, [activeUsers]);

	if (!workFromHomeUsers) {
		return <CircularProgress />;
	}

	return workFromHomeUsers.map((workFromHomeUser) => {
		return (
			<ListItem key={workFromHomeUser.userId}>
				<ListItemAvatar>
					<Avatar user={workFromHomeUser} clickable={true} contactCard={true} />
				</ListItemAvatar>
				<ListItemText
					primary={workFromHomeUser.firstName}
					secondary={workFromHomeUser.lastName}
				/>
			</ListItem>
		);
	});
};

export default WorkFromHomeListItem;
