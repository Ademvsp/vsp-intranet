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
import { Button, IconButton } from '@material-ui/core';
import { StyledAvatar } from '../../../../../utils/styled-components';
import {
	AttachFile as AttachFileIcon,
	AddAlert as AddAlertIcon
} from '@material-ui/icons';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import * as postController from '../../../../../controllers/post';

const NewComment = (props) => {
	const dispatch = useDispatch();
	const { authUser } = props;
	const [loading, setLoading] = useState(false);

	const initialValues = { body: '' };
	const initialErrors = { body: true };

	const validationSchema = yup.object().shape({
		body: yup.string().label('Comment').required()
	});

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await dispatch(
			postController.addComment(props.postId, values.body)
		);
		if (result) {
			formik.setValues(initialValues, true);
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
							config={{
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
								placeholder: 'Write a comment...',
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
				<StyledCardActions>
					<div>
						<IconButton>
							<AddAlertIcon />
						</IconButton>
						<IconButton>
							<AttachFileIcon />
						</IconButton>
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
