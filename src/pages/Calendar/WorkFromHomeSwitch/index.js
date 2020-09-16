import React from 'react';
import {
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Switch
} from '@material-ui/core';
import * as authUserController from '../../../controllers/auth';
import { useSelector, useDispatch } from 'react-redux';

const WorkFromHomeSwitch = (props) => {
	const { authUser } = useSelector((state) => state.authState);
	const dispatch = useDispatch();

	const switchChangeHandler = async (settings) => {
		await dispatch(authUserController.updateSettings(settings));
	};

	return (
		<ListItem>
			<ListItemText primary='Work from Home' />
			<ListItemSecondaryAction>
				<Switch
					color='primary'
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
