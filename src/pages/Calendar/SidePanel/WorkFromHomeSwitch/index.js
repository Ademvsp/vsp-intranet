import React from 'react';
import {
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Switch
} from '@material-ui/core';
import * as userController from '../../../../controllers/user';
import { useSelector, useDispatch } from 'react-redux';

const WorkFromHomeSwitch = (props) => {
	const { authUser } = useSelector((state) => state.authState);
	const dispatch = useDispatch();

	const switchChangeHandler = async (settings) => {
		await dispatch(userController.updateSettings(settings));
	};

	return (
		<ListItem>
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
	);
};

export default WorkFromHomeSwitch;
