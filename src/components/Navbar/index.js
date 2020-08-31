import React from 'react';
import { AppBar, IconButton, Badge } from '@material-ui/core';
import { useSelector } from 'react-redux';
import NavbarAvatar from '../NavbarAvatar';
import {
	StyledMenuIcon,
	StyledTitle,
	StyledToolbar,
	StyledIconButton,
	StyledDiv
} from './styled-components';
import { withRouter } from 'react-router-dom';
import { Notifications as NotificationsIcon } from '@material-ui/icons';

export default withRouter((props) => {
	const { authUser } = useSelector((state) => state.authState);

	return (
		<AppBar position='static'>
			<StyledToolbar authUser={authUser}>
				<StyledTitle variant='h4' onClick={() => props.history.push('/')}>
					VSP Intranet
				</StyledTitle>
				{authUser && (
					<IconButton
						edge='start'
						color='inherit'
						onClick={() => props.setDrawerOpen(true)}
					>
						<StyledMenuIcon />
					</IconButton>
				)}
				{authUser && (
					<StyledDiv>
						<StyledIconButton edge='start' color='inherit'>
							<Badge badgeContent={100} max={10} color='secondary'>
								<NotificationsIcon />
							</Badge>
						</StyledIconButton>
						<NavbarAvatar authUser={authUser} />
					</StyledDiv>
				)}
			</StyledToolbar>
		</AppBar>
	);
});
