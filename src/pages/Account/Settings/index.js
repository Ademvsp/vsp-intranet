import React from 'react';
import {
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListItemSecondaryAction
} from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import { useDispatch } from 'react-redux';
import * as authController from '../../../controllers/auth-user';
import {
	Brightness4 as Brightness4Icon,
	Home as HomeIcon
} from '@material-ui/icons';

const Settings = (props) => {
	const authUser = props.authUser;
	const dispatch = useDispatch();

	const switchChangeHandler = async (settings) => {
		await dispatch(authController.updateSettings(settings));
	};

	return (
		<List>
			<ListItem>
				<ListItemIcon>
					<Brightness4Icon />
				</ListItemIcon>
				<ListItemText primary='Dark mode' />
				<ListItemSecondaryAction>
					<Switch
						checked={authUser.settings.darkMode}
						onChange={() =>
							switchChangeHandler({
								...authUser.settings,
								darkMode: !authUser.settings.darkMode
							})
						}
					/>
				</ListItemSecondaryAction>
			</ListItem>
			<ListItem>
				<ListItemIcon>
					<HomeIcon />
				</ListItemIcon>
				<ListItemText primary='Work from Home' />
				<ListItemSecondaryAction>
					<Switch
						checked={authUser.settings.workFromHome}
						onChange={() =>
							switchChangeHandler({
								...authUser.settings,
								workFromHome: !authUser.settings.workFromHome
							})
						}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		</List>
	);
};

export default Settings;
