import React, { Fragment, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Menu, MenuItem, CircularProgress } from '@material-ui/core';
import * as AuthUserController from '../../../controllers/auth';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { StyledAvatar } from './styled-components';

const AccountAvatar = (props) => {
	const authUser = props.authUser;
	const fileInputRef = useRef();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [anchorElement, setAnchorElement] = useState(null);

	const menuCloseHandler = () => {
		setAnchorElement(null);
	};

	const removeClickHandler = () => {
		setShowConfirmDialog(true);
		menuCloseHandler();
	};

	const uploadClickHandler = () => {
		fileInputRef.current.click();
		menuCloseHandler();
	};

	const cancelClickHandler = () => {
		setShowConfirmDialog(false);
	};

	const confirmClickHandler = async () => {
		setLoading(true);
		await dispatch(AuthUserController.removePicture());
		setLoading(false);
		setShowConfirmDialog(false);
	};

	const fileSelectedHandler = async (event) => {
		setLoading(true);
		const files = [...event.target.files];
		if (files.length === 1) {
			await dispatch(AuthUserController.uploadPicture(files[0]));
		}
		setLoading(false);
		fileInputRef.current.value = null;
	};

	return (
		<Fragment>
			<ConfirmDialog
				open={showConfirmDialog}
				cancel={cancelClickHandler}
				confirm={confirmClickHandler}
				title='Profile Picture'
				message='Are you sure you want to remove your profile picture?'
			/>
			<StyledAvatar
				user={authUser}
				size={5}
				clickable={true}
				onClick={(event) => setAnchorElement(event.target)}
				customFallback={loading ? <CircularProgress /> : null}
			/>

			<input
				type='file'
				accept='image/*'
				hidden
				ref={fileInputRef}
				onChange={fileSelectedHandler}
			/>

			<Menu
				id='simple-menu'
				anchorEl={anchorElement}
				keepMounted
				open={!!anchorElement}
				onClose={menuCloseHandler}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				getContentAnchorEl={null}
			>
				<MenuItem onClick={uploadClickHandler}>Upload Picture</MenuItem>
				<MenuItem onClick={removeClickHandler}>Remove Picture</MenuItem>
			</Menu>
		</Fragment>
	);
};

export default AccountAvatar;
