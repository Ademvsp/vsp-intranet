import React, { Fragment, useState } from 'react';
import { Menu, MenuItem } from '@material-ui/core/';
import { useDispatch } from 'react-redux';
import * as authController from '../../controllers/auth';
import { StyledAvatar } from '../../utils/styled-components';
import { withRouter } from 'react-router-dom';

const NavbarAvatar = withRouter(({ authUser, history }) => {
	const dispatch = useDispatch();
	const [anchorElement, setAnchorElement] = useState(null);

	const menuCloseHandler = () => {
		setAnchorElement(null);
	};

	const logoutClickHandler = async () => {
		dispatch(authController.logout());
	};

	const accountClickHandler = () => {
		history.push('/account');
		menuCloseHandler();
	};

	const firstName = authUser.firstName.substring(0, 1);
	const lastName = authUser.lastName.substring(0, 1);

	return (
		<Fragment>
			<StyledAvatar
				size={1}
				darkMode={authUser.settings.darkMode}
				onClick={(event) => setAnchorElement(event.target)}
				src={authUser.profilePicture}
			>
				{`${firstName}${lastName}`}
			</StyledAvatar>
			<Menu
				id='simple-menu'
				anchorEl={anchorElement}
				keepMounted
				open={!!anchorElement}
				onClose={menuCloseHandler}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				getContentAnchorEl={null}
			>
				<MenuItem onClick={accountClickHandler}>Account</MenuItem>
				<MenuItem onClick={accountClickHandler}>Feedback</MenuItem>
				<MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
			</Menu>
		</Fragment>
	);
});

export default NavbarAvatar;
