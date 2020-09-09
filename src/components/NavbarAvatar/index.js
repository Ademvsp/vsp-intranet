import React, { Fragment, useState } from 'react';
import { Menu, MenuItem } from '@material-ui/core/';
import { useDispatch } from 'react-redux';
import * as authController from '../../controllers/auth';
import { useHistory } from 'react-router-dom';
import Avatar from '../Avatar';

const NavbarAvatar = (props) => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [anchorEl, setAnchorEl] = useState(null);

	const menuCloseHandler = () => {
		setAnchorEl(null);
	};

	const logoutClickHandler = async () => {
		dispatch(authController.logout());
	};

	const accountClickHandler = () => {
		history.push('/account');
		menuCloseHandler();
	};

	return (
		<Fragment>
			<Avatar
				user={props.authUser}
				size={1.5}
				clickable={true}
				onClick={(event) => setAnchorEl(event.target)}
			/>
			<Menu
				anchorEl={anchorEl}
				keepMounted={true}
				open={!!anchorEl}
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
};

export default NavbarAvatar;
