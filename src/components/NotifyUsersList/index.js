import React, { useState, useEffect } from 'react';
import {
	Button,
	List,
	ListItemAvatar,
	ListItemText,
	ListItemSecondaryAction,
	Checkbox,
	Dialog,
	DialogActions
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { StyledAvatar } from '../../utils/styled-components';
import {
	StyledListItem,
	StyledListItemText,
	StyledDialogContent,
	StyledDialogTitle
} from './styled-components';
import { AvatarGroup } from '@material-ui/lab';

const NotifyUsersList = (props) => {
	const {
		notifyUsersOpen,
		setNotifyUsersOpen,
		notifyUsers,
		setNotifyUsers
	} = props;
	const { users } = useSelector((state) => state.dataState);
	const { authUser } = useSelector((state) => state.authState);
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

	const checkHandler = (user, checked) => () => {
		const newCheckedUsers = [...checkedUsers];
		if (checked) {
			const index = checkedUsers.findIndex(
				(checkedUser) => checkedUser.userId === user.userId
			);
			newCheckedUsers.splice(index, 1);
		} else {
			newCheckedUsers.push(user);
		}
		setCheckedUsers(newCheckedUsers);
	};

	const selectAllCheckHandler = () => {
		const checked = users.length === checkedUsers.length;
		let newCheckedUsers;
		if (checked) {
			newCheckedUsers = [];
		} else {
			newCheckedUsers = [...users];
		}
		setCheckedUsers(newCheckedUsers);
	};

	return (
		<Dialog open={notifyUsersOpen} onClose={closeHandler}>
			<StyledDialogTitle>
				<List dense={true}>
					<StyledListItem>
						{checkedUsers.length > 0 ? (
							<ListItemAvatar>
								<AvatarGroup>
									{checkedUsers.map((checkedUser) => {
										const { firstName, lastName } = checkedUser;
										const firstNameInitial = firstName.substring(0, 1);
										const lastNameInitial = lastName.substring(0, 1);
										return (
											<StyledAvatar
												key={checkedUser.userId}
												src={checkedUser.profilePicture}
												darkMode={authUser.settings.darkMode}
											>{`${firstNameInitial}${lastNameInitial}`}</StyledAvatar>
										);
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
					</StyledListItem>
				</List>
			</StyledDialogTitle>
			<StyledDialogContent>
				<List dense={true}>
					{users.map((user) => {
						const { firstName, lastName } = user;
						const firstNameInitial = firstName.substring(0, 1);
						const lastNameInitial = lastName.substring(0, 1);
						const checked = checkedUsers.some(
							(checkedUser) => checkedUser.userId === user.userId
						);
						return (
							<StyledListItem
								key={user.userId}
								onClick={checkHandler(user, checked)}
							>
								<ListItemAvatar>
									<StyledAvatar
										src={user.profilePicture}
										darkMode={authUser.settings.darkMode}
									>{`${firstNameInitial}${lastNameInitial}`}</StyledAvatar>
								</ListItemAvatar>
								<ListItemText primary={`${firstName} ${lastName}`} />
								<ListItemSecondaryAction>
									<Checkbox
										edge='end'
										onChange={checkHandler(user, checked)}
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
		</Dialog>
	);
};

export default NotifyUsersList;
