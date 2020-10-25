import { IconButton, Tooltip } from '@material-ui/core';
import React from 'react';
import {
	Brightness4 as Brightness4Icon,
	Brightness5 as Brightness5Icon
} from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettings } from '../../../store/actions/auth-user';

const DarkModeIcon = (props) => {
	const dispatch = useDispatch();
	const { authUser } = useSelector((state) => state.authState);
	const { darkMode } = authUser.settings;

	const darkModeChangeHandler = async () => {
		const settings = {
			...authUser.settings,
			darkMode: !darkMode
		};
		await dispatch(updateSettings(settings));
	};

	return (
		<Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
			<IconButton color='inherit' onClick={darkModeChangeHandler}>
				{darkMode ? <Brightness4Icon /> : <Brightness5Icon />}
			</IconButton>
		</Tooltip>
	);
};

export default DarkModeIcon;
