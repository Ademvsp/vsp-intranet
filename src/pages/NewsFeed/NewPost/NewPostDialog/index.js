import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	Grid,
	ListItemAvatar,
	Typography,
	TextField,
	DialogContent,
	Dialog
} from '@material-ui/core';
import Avatar from '../../../../components/Avatar';
import ActionsBar from '../../../../components/ActionsBar';
import BalloonEditorWrapper from '../../../../components/BalloonEditorWrapper';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import { addPost } from '../../../../store/actions/post';
const NewPostDialog = (props) => {
	const dispatch = useDispatch();
	const { authUser, open, close, clearSearchResults } = props;
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const [notifyUsers, setNotifyUsers] = useState([]);
	const [attachments, setAttachments] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [validatedOnMount, setValidatedOnMount] = useState(false);
	const initialValues = { title: '', body: '' };

	const dialogCloseHandler = () => {
		if (!loading) {
			close();
		}
	};

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await dispatch(addPost(values, attachments, notifyUsers));
		setLoading(false);
		if (result) {
			formik.setValues(initialValues, true);
			setAttachments([]);
			setNotifyUsers([]);
			clearSearchResults();
			close();
			history.push('/newsfeed/page/1');
		}
	};
	const validationSchema = yup.object().shape({
		title: yup.string().label('title').required(),
		body: yup.string().label('body').required()
	});

	const { firstName, lastName } = authUser;
	const fullName = `${firstName} ${lastName}`;

	const formik = useFormik({
		initialValues: initialValues,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	const { validateForm } = formik;

	useEffect(() => {
		validateForm();
		setValidatedOnMount(true);
	}, [validateForm]);

	return (
		<Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
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
							buttonLoading={loading}
							loading={loading || uploading || !validatedOnMount}
							isValid={formik.isValid}
							onClick={formik.handleSubmit}
							tooltipPlacement='top'
							actionButtonText='Post'
						/>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default NewPostDialog;
