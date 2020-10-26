import React, { useEffect, useState } from 'react';
import { StyledContainer } from './styled-components';
import { ListItemAvatar, Grid } from '@material-ui/core';
import Avatar from '../../Avatar';
import { useFormik } from 'formik';
import * as yup from 'yup';
import BalloonEditorWrapper from '../../BalloonEditorWrapper';
import ActionsBar from '../../ActionsBar';

const NewComment = (props) => {
	const [uploading, setUploading] = useState();
	const [loading, setLoading] = useState(false);
	const [validatedOnMount, setValidatedOnMount] = useState(false);
	const [attachments, setAttachments] = useState([]);
	const [notifyUsers, setNotifyUsers] = useState([]);

	const initialValues = { body: '' };

	const validationSchema = yup.object().shape({
		body: yup.string().label('Comment').required()
	});

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await props.submitHandler(
			values.body,
			attachments,
			notifyUsers
		);
		setLoading(false);
		if (result) {
			formik.setValues(initialValues, true);
			setAttachments([]);
			setNotifyUsers([]);
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
				<Avatar user={props.authUser} />
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
							enabled: props.enableNotifyUsers,
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
						tooltipPlacement='bottom'
						actionButtonText='Post'
					/>
				</Grid>
			</Grid>
		</StyledContainer>
	);
};

export default NewComment;
