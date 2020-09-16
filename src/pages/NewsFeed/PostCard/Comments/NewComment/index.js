import React, { useState } from 'react';
import { StyledContainer } from './styled-components';
import { ListItemAvatar, Grid } from '@material-ui/core';
import Avatar from '../../../../../components/Avatar';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import * as postController from '../../../../../controllers/post';
import BalloonEditorWrapper from '../../../../../components/BalloonEditorWrapper';
import ActionsBar from '../../../../../components/ActionsBar';
import * as notificationController from '../../../../../controllers/notification';
import { NEW_COMMENT } from '../../../../../utils/notification-types';

const NewComment = (props) => {
	const dispatch = useDispatch();
	const { authUser, post } = props;
	const [uploading, setUploading] = useState();
	const [loading, setLoading] = useState(false);
	const [attachments, setAttachments] = useState([]);
	const [notifyUsers, setNotifyUsers] = useState([]);
	const { users } = useSelector((state) => state.dataState);

	const initialValues = { body: '' };
	const initialErrors = { body: true };

	const validationSchema = yup.object().shape({
		body: yup.string().label('Comment').required()
	});

	const submitHandler = async (values) => {
		setLoading(true);
		await dispatch(
			postController.addComment(post, values.body, attachments, notifyUsers)
		);
		setLoading(false);
		formik.setValues(initialValues, true);
		setAttachments([]);
		setNotifyUsers([]);
		const recipients = users.filter(
			(user) =>
				post.subscribers.includes(user.userId) ||
				notifyUsers.includes(user.userId)
		);
		if (recipients.length > 0) {
			try {
				const comment = post.comments.pop();
				await notificationController.sendNotification({
					type: NEW_COMMENT,
					recipients: recipients,
					postId: post.postId,
					title: post.title,
					commentBody: comment.body,
					attachments: comment.attachments
				});
				// eslint-disable-next-line no-empty
			} catch (error) {}
		}
	};

	const formik = useFormik({
		initialValues: initialValues,
		initialErrors: initialErrors,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	return (
		<StyledContainer>
			<ListItemAvatar>
				<Avatar user={authUser} />
			</ListItemAvatar>
			<Grid container direction='column' spacing={1}>
				<Grid item>
					<BalloonEditorWrapper
						value={formik.values.body}
						setValue={formik.handleChange('body')}
						setUploading={setUploading}
						loading={loading}
						borderChange={false}
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
						loading={loading || uploading}
						isValid={formik.isValid}
						onClick={formik.handleSubmit}
						tooltipPlacement='bottom'
						actionButtonText='Post'
					/>
				</Grid>
			</Grid>
		</StyledContainer>
	);
};

export default NewComment;
