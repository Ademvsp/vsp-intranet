import React from 'react';
import { AppBar, IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
import NavbarAvatar from '../NavbarAvatar';
import {
	StyledMenuIcon,
	StyledTitle,
	StyledToolbar,
	StyledDiv
} from './styled-components';
import { withRouter } from 'react-router-dom';
import NotificationsPopover from '../NotificationsPopover';

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
						<NotificationsPopover />
						<NavbarAvatar authUser={authUser} />
					</StyledDiv>
				)}
			</StyledToolbar>
		</AppBar>
	);
});
