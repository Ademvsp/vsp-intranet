import React, { Fragment, useState } from 'react';
import { StyledCard, StyledChip } from '../styled-components';
import { GridFlexGrow } from '../../../utils/styled-components';
import {
	ListItemAvatar,
	Dialog,
	Grid,
	Typography,
	TextField,
	CardContent,
	IconButton
} from '@material-ui/core';
import Avatar from '../../../components/Avatar';
import { useSelector, useDispatch } from 'react-redux';
import BalloonEditorWrapper from '../../../components/BalloonEditorWrapper';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { StyledDialogContent } from './styled-components';
import * as postController from '../../../controllers/post';
import ActionsBar from '../../../components/ActionsBar';
import { Search as SearchIcon } from '@material-ui/icons';

const NewPost = (props) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [notifyUsers, setNotifyUsers] = useState([]);
	const [attachments, setAttachments] = useState([]);
	const { authUser } = useSelector((state) => state.authState);
	const [dialogOpen, setDialogOpen] = useState(false);

	const initialValues = { title: '', body: '' };
	const initialErrors = { title: true, body: true };

	const validationSchema = yup.object().shape({
		title: yup.string().label('title').required(),
		body: yup.string().label('body').required()
	});

	const { firstName, lastName } = authUser;
	const fullName = `${firstName} ${lastName}`;

	const dialogCloseHandler = () => {
		if (!loading) {
			setDialogOpen(false);
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
			setDialogOpen(false);
		}
		setLoading(false);
	};

	const formik = useFormik({
		initialValues: initialValues,
		initialErrors: initialErrors,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	return (
		<Fragment>
			<StyledCard elevation={2}>
				<CardContent>
					<Grid
						container
						direction='row'
						alignItems='center'
						justify='space-between'
						spacing={1}
					>
						<Grid item>
							<Avatar user={authUser} />
						</Grid>
						<GridFlexGrow item>
							<StyledChip
								label='Write a post...'
								variant='outlined'
								onClick={() => setDialogOpen(true)}
							/>
						</GridFlexGrow>
						<Grid item>
							<IconButton>
								<SearchIcon />
							</IconButton>
						</Grid>
					</Grid>
				</CardContent>
			</StyledCard>
			<Dialog open={dialogOpen} onClose={dialogCloseHandler}>
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
								disabled={loading}
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
		</Fragment>
	);
};

export default NewPost;
