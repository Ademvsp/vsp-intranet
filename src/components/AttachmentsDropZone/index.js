import React, { useEffect, useCallback, useState, Fragment } from 'react';
import { useDropzone } from 'react-dropzone';
import {
	DialogActions,
	Dialog,
	Typography,
	ListItem,
	ListItemSecondaryAction,
	IconButton,
	ListItemText,
	Button
} from '@material-ui/core';
import { StyledContainer, StyledList } from './styled-components';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { StyledDialogContent } from './styled-components';
import fileSizeTranformer from '../../utils/filesize-tranformer';

const AttachmentsDropzone = (props) => {
	const { dropzoneOpen, setDropzoneOpen, attachments, setAttachments } = props;
	const [files, setFiles] = useState([]);

	useEffect(() => {
		if (dropzoneOpen) {
			setFiles(attachments);
		}
	}, [dropzoneOpen, attachments]);

	const onDrop = useCallback(
		(acceptedFiles) => {
			const newFiles = [...files];
			acceptedFiles.forEach((acceptedFile) => {
				const found = files.find((file) => {
					return acceptedFile.name === file.name;
				});
				if (!found) {
					newFiles.push(acceptedFile);
				}
			});
			setFiles(newFiles);
		},
		[files]
	);

	const {
		getRootProps,
		getInputProps,
		isDragActive
		// isDragAccept,
		// isDragReject
	} = useDropzone({ onDrop });

	const closeHandler = () => {
		setFiles([]);
		setDropzoneOpen(false);
	};

	const confirmClickHandler = () => {
		setAttachments(files);
		setFiles([]);
		setDropzoneOpen(false);
	};

	const deleteClickHandler = (index) => {
		const newFiles = [...files];
		newFiles.splice(index, 1);
		setFiles(newFiles);
	};

	return (
		<Dialog open={dropzoneOpen} onClose={closeHandler}>
			<StyledDialogContent>
				<StyledContainer {...getRootProps({ isDragActive })}>
					<input {...getInputProps()} />
					<Typography>Select files to upload</Typography>
					<Typography>or drag and drop here</Typography>
				</StyledContainer>
				{files.length > 0 ? (
					<StyledList>
						{files.map((file, index) => {
							return (
								<Fragment key={file.name}>
									<ListItem>
										<ListItemText
											primary={file.name}
											secondary={fileSizeTranformer(file.size)}
										/>
										<ListItemSecondaryAction>
											<IconButton
												onClick={deleteClickHandler.bind(this, index)}
											>
												<DeleteIcon />
											</IconButton>
										</ListItemSecondaryAction>
									</ListItem>
								</Fragment>
							);
						})}
					</StyledList>
				) : null}
			</StyledDialogContent>
			<DialogActions>
				<Button onClick={closeHandler} color='primary' variant='outlined'>
					Cancel
				</Button>
				<Button
					onClick={confirmClickHandler}
					color='primary'
					variant='contained'
				>
					Confirm
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AttachmentsDropzone;
