import React, { useState } from 'react';
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon';
import CKEditor from '@ckeditor/ckeditor5-react';
import {
	StyledCard,
	StyledCardActions,
	StyledCardContent,
	StyledContainer,
	StyledTextAreaContainer
} from './styled-components';
import { Button, IconButton, Badge } from '@material-ui/core';
import { StyledAvatar } from '../../../../../utils/styled-components';
import {
	Attachment as AttachmentIcon,
	NotificationsActive as NotificationsActiveIcon
} from '@material-ui/icons';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import * as postController from '../../../../../controllers/post';
import AttachmentsDropzone from '../../../../../components/AttachmentsDropZone';
import ProgressWithLabel from '../../../../../components/ProgressWithLabel';
import NotifyUsersList from '../../../../../components/NotifyUsersList';

const NewComment = (props) => {
	const uploadState = useSelector((state) => state.uploadState);
	const dispatch = useDispatch();
	const { authUser } = props;
	const [loading, setLoading] = useState(false);
	const [attachments, setAttachments] = useState([]);
	const [dropzoneOpen, setDropzoneOpen] = useState(false);
	const [notifyUsers, setNotifyUsers] = useState([]);
	const [notifyUsersOpen, setNotifyUsersOpen] = useState(false);

	const initialValues = { body: '' };
	const initialErrors = { body: true };

	const validationSchema = yup.object().shape({
		body: yup.string().label('Comment').required()
	});

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await dispatch(
			postController.addComment(props.postId, values.body, attachments)
		);
		if (result) {
			formik.setValues(initialValues, true);
			setAttachments([]);
		}
		setLoading(false);
	};

	const formik = useFormik({
		initialValues: initialValues,
		initialErrors: initialErrors,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	const firstNameInitial = authUser.firstName.substring(0, 1);
	const lastNameInitial = authUser.lastName.substring(0, 1);
	return (
		<StyledContainer>
			<div className='MuiListItemAvatar-root'>
				<StyledAvatar src={authUser.profilePicture}>
					{`${firstNameInitial}${lastNameInitial}`}
				</StyledAvatar>
			</div>
			<StyledTextAreaContainer>
				<StyledCard>
					<StyledCardContent>
						<CKEditor
							editor={BalloonEditor}
							data={formik.values.body}
							onChange={(_event, editor) => {
								// setUploading(editor.getData().includes('<figure class="image"><img></figure>'));
								formik.setFieldValue('body', editor.getData());
							}}
							disabled={loading}
							config={{
								placeholder: 'Write a comment...',
								toolbar: {
									items: [
										'heading',
										'bold',
										'italic',
										'numberedList',
										'bulletedList',
										'indent',
										'outdent',
										'blockQuote',
										'insertTable',
										'tableColumn',
										'tableRow',
										'mergeTableCells',
										'link',
										'imageUpload'
									],
									shouldNotGroupWhenFull: true
								},
								extraPlugins: [
									// function MyCustomUploadAdapterPlugin(editor) {
									//   editor.plugins.get('FileRepository').createUploadAdapter = loader => {
									//     return new MyUploadAdapter(loader, collection);
									//   };
									// }
								],
								removePlugins: ['MediaEmbed']
							}}
						/>
					</StyledCardContent>
				</StyledCard>
				{uploadState.filesProgress ? (
					<ProgressWithLabel
						transferred={uploadState.filesProgress.reduce(
							(total, value) => (total += value.bytesTransferred),
							0
						)}
						total={uploadState.filesProgress.reduce(
							(total, value) => (total += value.totalBytes),
							0
						)}
					/>
				) : null}
				<StyledCardActions>
					<div>
						<IconButton
							disabled={loading}
							onClick={setNotifyUsersOpen.bind(this, true)}
						>
							<Badge badgeContent={notifyUsers.length} color='secondary'>
								<NotificationsActiveIcon />
							</Badge>
						</IconButton>
						<NotifyUsersList
							setNotifyUsersOpen={setNotifyUsersOpen}
							notifyUsersOpen={notifyUsersOpen}
							setNotifyUsers={setNotifyUsers}
							notifyUsers={notifyUsers}
						/>
						<IconButton
							onClick={setDropzoneOpen.bind(this, true)}
							disabled={loading}
						>
							<Badge badgeContent={attachments.length} color='secondary'>
								<AttachmentIcon />
							</Badge>
						</IconButton>
						<AttachmentsDropzone
							dropzoneOpen={dropzoneOpen}
							setDropzoneOpen={setDropzoneOpen}
							attachments={attachments}
							setAttachments={setAttachments}
						/>
					</div>
					<Button
						variant='outlined'
						color='primary'
						onClick={formik.handleSubmit}
						disabled={!formik.isValid || loading}
					>
						Post
					</Button>
				</StyledCardActions>
			</StyledTextAreaContainer>
		</StyledContainer>
	);
};

export default NewComment;
