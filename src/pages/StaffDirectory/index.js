import {
	CardContent,
	CardHeader,
	CircularProgress,
	Container,
	Grid,
	Typography
} from '@material-ui/core';
import React, { useState, useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';
import Card from '../../components/Card';
import ContactCard from './ContactCard';
import { StyledLink } from './styled-components';

const StaffDirectory = (props) => {
	const [groupedUsers, setGroupedUsers] = useState();
	const { activeUsers, activeUsersCounter } = useSelector(
		(state) => state.dataState
	);

	useEffect(() => {
		if (activeUsers && activeUsersCounter) {
			if (activeUsers.length === activeUsersCounter.count) {
				//Only start process when all users are loaded. Firebase loads original authUser first as it is already in cache
				const newGroupedUsers = [];
				activeUsers.forEach((user) => {
					const userBranch = user.location.branch;
					const indexOfBranch = newGroupedUsers.findIndex(
						(group) => group.location.branch === userBranch
					);
					if (indexOfBranch !== -1) {
						newGroupedUsers[indexOfBranch].users.push(user);
					} else {
						newGroupedUsers.push({
							location: user.location,
							users: [user]
						});
					}
				});
				newGroupedUsers.sort((a, b) =>
					a.location.state > b.location.state ? 1 : -1
				);
				newGroupedUsers.forEach((group) =>
					group.users.sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
				);
				setGroupedUsers(newGroupedUsers);
			}
		}
	}, [activeUsers, activeUsersCounter]);

	if (!groupedUsers) {
		return <CircularProgress />;
	}
	return (
		<Container disableGutters maxWidth='md'>
			<Grid container direction='column' spacing={2}>
				{groupedUsers.map((group) => (
					<Grid item key={group.location.locationId}>
						<Card headerPadding='16px 16px 0 16px'>
							<CardHeader
								title={`${group.location.state} - ${group.location.branch}`}
								subheader={
									<Fragment>
										<Typography>{`${group.location.address}`}</Typography>
										<Typography>
											<StyledLink
												href={`tel:${group.location.phone}`}
											>{`${group.location.phone}`}</StyledLink>
										</Typography>
									</Fragment>
								}
							/>
							<CardContent>
								<Grid
									container
									direction='row'
									spacing={2}
									justify='flex-start'
								>
									{group.users.map((user) => (
										<Grid item key={user.userId}>
											<ContactCard user={user} />
										</Grid>
									))}
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		</Container>
	);
};

export default StaffDirectory;
