import React, { Fragment, useState } from 'react';
import { StyledButtonContainer } from '../styled-components';
import { Button } from '@material-ui/core';
import ConfirmDialog from '../../../components/ConfirmDialog';
import * as authController from '../../../controllers/auth-user';
import { useDispatch } from 'react-redux';

const Logout = (props) => {
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const dispatch = useDispatch();

	const cancelClickHandler = () => {
		setShowConfirmDialog(false);
	};

	const confirmClickHandler = async () => {
		await dispatch(authController.logoutAll());
	};

	return (
		<Fragment>
			<ConfirmDialog
				open={showConfirmDialog}
				cancel={cancelClickHandler}
				confirm={confirmClickHandler}
				title='Logout'
				message='This will log you out of all devices in case you have lost or misplaced a device.'
			/>
			<StyledButtonContainer>
				<Button onClick={setShowConfirmDialog.bind(this, true)}>
					Log out of all devices
				</Button>
			</StyledButtonContainer>
		</Fragment>
	);
};

export default Logout;
