import React, { useContext } from 'react';
import { AppBar, Grid, IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
import NavbarAvatar from '../NavbarAvatar';
import {
	StyledMenuIcon,
	// StyledTitle,
	StyledToolbar,
	StyledDiv
} from './styled-components';
import NotificationsPopover from '../NotificationsPopover';
// import { useHistory } from 'react-router-dom';
import { SideDrawerContext } from '../AppContainer';

const Navbar = (props) => {
	// const history = useHistory();
	const { setDrawerOpen } = useContext(SideDrawerContext);
	const { authUser } = useSelector((state) => state.authState);

	return (
		<AppBar position='sticky'>
			<StyledToolbar authUser={authUser}>
				{/* <StyledTitle variant='h4' onClick={() => history.push('/')}>
					VSP Intranet
				</StyledTitle> */}
				<Grid
					container
					direction='row'
					justify='space-between'
					alignItems='center'
				>
					<Grid item>
						{authUser && (
							<IconButton
								edge='start'
								color='inherit'
								onClick={() => setDrawerOpen(true)}
							>
								<StyledMenuIcon />
							</IconButton>
						)}
					</Grid>
					<Grid item>
						{authUser && (
							<Grid container justify='center' spacing={1}>
								<Grid item></Grid>
								<Grid item>
									<NotificationsPopover />
								</Grid>
								<Grid item>
									<NavbarAvatar authUser={authUser} />
								</Grid>
							</Grid>
						)}
					</Grid>
				</Grid>
			</StyledToolbar>
		</AppBar>
	);
};

export default Navbar;
