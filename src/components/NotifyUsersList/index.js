import React, { useState, useEffect } from 'react';
import {
	Button,
	List,
	ListItemAvatar,
	ListItemText,
	ListItemSecondaryAction,
	Checkbox,
	DialogActions,
	useMediaQuery
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import {
	StyledTitleListItem,
	StyledListItem,
	StyledListItemText,
	StyledDialogContent,
	StyledDialogTitle
} from './styled-components';
import { AvatarGroup } from '@material-ui/lab';
import Avatar from '../Avatar';
import { StyledDialog } from '../../utils/styled-components';

const NotifyUsersList = (props) => {
	const {
		notifyUsersOpen,
		setNotifyUsersOpen,
		notifyUsers,
		setNotifyUsers
	} = props;
	const { activeUsers: users } = useSelector((state) => state.dataState);
	const [checkedUsers, setCheckedUsers] = useState([]);

	useEffect(() => {
		if (notifyUsers) {
			setCheckedUsers(notifyUsers);
		}
	}, [notifyUsersOpen, notifyUsers]);

	const closeHandler = () => {
		setNotifyUsersOpen(false);
		setCheckedUsers([]);
	};

	const confirmClickHandler = () => {
		setNotifyUsersOpen(false);
		setNotifyUsers(checkedUsers);
		setCheckedUsers([]);
	};

	const checkHandler = (userId, checked) => () => {
		const newCheckedUsers = [...checkedUsers];
		if (checked) {
			const index = checkedUsers.findIndex(
				(checkedUser) => checkedUser === userId
			);
			newCheckedUsers.splice(index, 1);
		} else {
			newCheckedUsers.push(userId);
		}
		setCheckedUsers(newCheckedUsers);
	};

	const selectAllCheckHandler = () => {
		const checked = users.length === checkedUsers.length;
		let newCheckedUsers;
		if (checked) {
			newCheckedUsers = [];
		} else {
			newCheckedUsers = users.map((user) => user.userId);
		}
		setCheckedUsers(newCheckedUsers);
	};

	const mobile = useMediaQuery('(max-width: 767px)');

	return (
		<StyledDialog open={notifyUsersOpen} onClose={closeHandler} width={400}>
			<StyledDialogTitle>
				<List dense={true}>
					<StyledTitleListItem>
						{checkedUsers.length > 0 ? (
							<ListItemAvatar>
								<AvatarGroup max={mobile ? 3 : 6}>
									{checkedUsers.map((checkedUser) => {
										const user = users.find(
											(user) => user.userId === checkedUser
										);
										return <Avatar key={checkedUser} user={user} />;
									})}
								</AvatarGroup>
							</ListItemAvatar>
						) : null}
						<StyledListItemText
							primary={'Select all'}
							secondary={`${checkedUsers.length} selected`}
						/>
						<ListItemSecondaryAction>
							<Checkbox
								edge='end'
								onChange={selectAllCheckHandler}
								checked={users.length === checkedUsers.length}
								indeterminate={
									checkedUsers.length > 0 && checkedUsers.length < users.length
								}
							/>
						</ListItemSecondaryAction>
					</StyledTitleListItem>
				</List>
			</StyledDialogTitle>
			<StyledDialogContent>
				<List dense={true}>
					{users.map((user) => {
						const { firstName, lastName } = user;
						const checked = checkedUsers.some(
							(checkedUser) => checkedUser === user.userId
						);
						return (
							<StyledListItem
								key={user.userId}
								onClick={checkHandler(user.userId, checked)}
							>
								<ListItemAvatar>
									<Avatar user={user} />
								</ListItemAvatar>
								<ListItemText primary={`${firstName} ${lastName}`} />
								<ListItemSecondaryAction>
									<Checkbox
										edge='end'
										onChange={checkHandler(user.userId, checked)}
										checked={checked}
									/>
								</ListItemSecondaryAction>
							</StyledListItem>
						);
					})}
				</List>
			</StyledDialogContent>
			<DialogActions>
				<Button onClick={closeHandler} color='primary' variant='outlined'>
					Cancel
				</Button>
				<Button
					onClick={confirmClickHandler}
					color='primary'
					variant='contained'
				>
					Confirm
				</Button>
			</DialogActions>
		</StyledDialog>
	);
};

export default NotifyUsersList;
