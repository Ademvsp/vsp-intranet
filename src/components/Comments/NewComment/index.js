import React, { useEffect, useState } from 'react';
import { StyledContainer } from './styled-components';
import { ListItemAvatar, Grid } from '@material-ui/core';
import Avatar from '../../Avatar';
import { useFormik } from 'formik';
import * as yup from 'yup';
import BalloonEditorWrapper from '../../BalloonEditorWrapper';
import ActionsBar from '../../ActionsBar';
import { useSelector } from 'react-redux';

const NewComment = (props) => {
	const { authUser } = useSelector((state) => state.authState);
	const [uploading, setUploading] = useState();
	const [loading, setLoading] = useState(false);
	const [validatedOnMount, setValidatedOnMount] = useState(false);

	const initialValues = {
		attachments: [],
		notifyUsers: [],
		body: ''
	};

	const validationSchema = yup.object().shape({
		attachments: yup.array().notRequired(),
		notifyUsers: yup.array().notRequired(),
		body: yup.string().label('Comment').trim().required()
	});

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await props.submitHandler(values);
		setLoading(false);
		if (result) {
			formik.setValues(initialValues, true);
		}
	};

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
		<StyledContainer>
			<ListItemAvatar>
				<Avatar user={authUser} />
			</ListItemAvatar>
			<Grid container direction='column' spacing={1}>
				<Grid item>
					<BalloonEditorWrapper
						value={formik.values.body}
						setValue={formik.handleChange('body')}
						setTouched={() => {}}
						setUploading={setUploading}
						loading={loading}
						borderChange={false}
						placeholder='Write a comment...'
					/>
				</Grid>
				<Grid item>
					<ActionsBar
						notifications={{
							enabled: props.actionBarNotificationProps.enabled,
							tooltip: props.actionBarNotificationProps.tooltip,
							readOnly: props.actionBarNotificationProps.readOnly,
							notifyUsers: formik.values.notifyUsers,
							setNotifyUsers: (notifyUsers) =>
								formik.setFieldValue('notifyUsers', notifyUsers)
						}}
						attachments={{
							enabled: true,
							attachments: formik.values.attachments,
							setAttachments: (attachments) =>
								formik.setFieldValue('attachments', attachments)
						}}
						buttonLoading={loading}
						loading={loading || uploading || !validatedOnMount}
						isValid={formik.isValid}
						onClick={formik.handleSubmit}
						tooltipPlacement='bottom'
						actionButtonText='Comment'
					/>
				</Grid>
			</Grid>
		</StyledContainer>
	);
};

export default NewComment;
