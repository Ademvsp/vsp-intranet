import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	Dialog,
	Grid,
	ListItemAvatar,
	Typography,
	TextField
} from '@material-ui/core';
import { StyledDialogContent } from './styled-components';
import Avatar from '../../../../components/Avatar';
import ActionsBar from '../../../../components/ActionsBar';
import BalloonEditorWrapper from '../../../../components/BalloonEditorWrapper';
import * as postController from '../../../../controllers/post';
import { useFormik } from 'formik';
import * as yup from 'yup';

const NewPostDialog = (props) => {
	const dispatch = useDispatch();
	const {
		authUser,
		newPostDialogOpen,
		setNewPostDialogOpen,
		setSearchResults
	} = props;
	const [loading, setLoading] = useState(false);
	const [notifyUsers, setNotifyUsers] = useState([]);
	const [attachments, setAttachments] = useState([]);
	const [uploading, setUploading] = useState(false);
	const initialValues = { title: '', body: '' };
	const initialErrors = { title: true, body: true };

	const dialogCloseHandler = () => {
		if (!loading) {
			setNewPostDialogOpen(false);
		}
	};

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await dispatch(
			postController.addPost(values, attachments, notifyUsers)
		);
		if (result) {
			formik.setValues(initialValues, true);
			setAttachments([]);
			setNotifyUsers([]);
			setNewPostDialogOpen(false);
			setSearchResults(null);
		}
		setLoading(false);
	};
	const validationSchema = yup.object().shape({
		title: yup.string().label('title').required(),
		body: yup.string().label('body').required()
	});

	const { firstName, lastName } = authUser;
	const fullName = `${firstName} ${lastName}`;

	const formik = useFormik({
		initialValues: initialValues,
		initialErrors: initialErrors,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	return (
		<Dialog open={newPostDialogOpen} onClose={dialogCloseHandler}>
			<StyledDialogContent>
				<Grid container direction='column' spacing={1}>
					<Grid
						item
						container
						direction='row'
						justify='flex-start'
						alignItems='center'
					>
						<ListItemAvatar>
							<Avatar user={authUser} />
						</ListItemAvatar>
						<Typography>{fullName}</Typography>
					</Grid>
					<Grid item>
						<TextField
							label='Title'
							margin='dense'
							fullWidth
							InputLabelProps={{ shrink: true }}
							value={formik.values.title}
							onChange={formik.handleChange('title')}
							onBlur={formik.handleBlur('title')}
							disabled={loading}
							autoFocus={true}
						/>
					</Grid>
					<Grid item>
						<BalloonEditorWrapper
							value={formik.values.body}
							setValue={formik.handleChange('body')}
							setUploading={setUploading}
							loading={loading}
							borderChange={true}
							minHeight={100}
							maxHeight={300}
						/>
					</Grid>
					<Grid item>
						<ActionsBar
							uploading={uploading}
							loading={loading}
							notifyUsers={notifyUsers}
							setNotifyUsers={setNotifyUsers}
							attachments={attachments}
							setAttachments={setAttachments}
							isValid={formik.isValid}
							handleSubmit={formik.handleSubmit}
							tooltipPlacement='top'
						/>
					</Grid>
				</Grid>
			</StyledDialogContent>
		</Dialog>
	);
};

export default NewPostDialog;
