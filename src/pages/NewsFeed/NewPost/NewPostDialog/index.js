import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	Grid,
	ListItemAvatar,
	Typography,
	TextField,
	DialogContent
} from '@material-ui/core';
import Avatar from '../../../../components/Avatar';
import ActionsBar from '../../../../components/ActionsBar';
import BalloonEditorWrapper from '../../../../components/BalloonEditorWrapper';
import * as postController from '../../../../controllers/post';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { StyledDialog } from '../../../../utils/styled-components';
import { useHistory } from 'react-router-dom';

const NewPostDialog = (props) => {
	const dispatch = useDispatch();
	const {
		authUser,
		newPostDialogOpen,
		setNewPostDialogOpen,
		setSearchResults
	} = props;
	const history = useHistory();
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
			history.push('/newsfeed/page/1');
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
		<StyledDialog
			width={500}
			open={newPostDialogOpen}
			onClose={dialogCloseHandler}
		>
			<DialogContent>
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
							notifications={{
								enabled: true,
								notifyUsers: notifyUsers,
								setNotifyUsers: setNotifyUsers
							}}
							attachments={{
								enabled: true,
								attachments: attachments,
								setAttachments: setAttachments
							}}
							loading={loading || uploading}
							isValid={formik.isValid}
							onClick={formik.handleSubmit}
							tooltipPlacement='top'
							actionButtonText='Post'
						/>
					</Grid>
				</Grid>
			</DialogContent>
		</StyledDialog>
	);
};

export default NewPostDialog;
