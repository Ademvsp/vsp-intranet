import React, { useState } from 'react';
import { Grid, Tooltip, IconButton, Badge } from '@material-ui/core';
import ProgressWithLabel from '../ProgressWithLabel';
import { useSelector } from 'react-redux';
import {
	Attachment as AttachmentIcon,
	People as PeopleIcon
} from '@material-ui/icons';
import NotifyUsersList from '../NotifyUsersList';
import AttachmentsDropzone from '../AttachmentsDropZone';
import { StyledPostButton } from './styled-components';

const ActionsBar = (props) => {
	const uploadState = useSelector((state) => state.uploadState);
	const [notifyUsersOpen, setNotifyUsersOpen] = useState(false);
	const [dropzoneOpen, setDropzoneOpen] = useState(false);
	const {
		uploading,
		loading,
		notifyUsers,
		setNotifyUsers,
		attachments,
		setAttachments,
		isValid,
		handleSubmit,
		tooltipPlacement
	} = props;
	return (
		<Grid container direction='column'>
			<Grid item>
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
			</Grid>
			<Grid item container justify='flex-end' alignItems='center'>
				<Grid item>
					<Tooltip title='Notify staff' placement={tooltipPlacement}>
						<IconButton
							disabled={loading}
							onClick={setNotifyUsersOpen.bind(this, true)}
						>
							<Badge badgeContent={notifyUsers.length} color='secondary'>
								<PeopleIcon />
							</Badge>
						</IconButton>
					</Tooltip>
					<NotifyUsersList
						setNotifyUsersOpen={setNotifyUsersOpen}
						notifyUsersOpen={notifyUsersOpen}
						setNotifyUsers={setNotifyUsers}
						notifyUsers={notifyUsers}
					/>
				</Grid>
				<Grid item>
					<Tooltip title='Attachments' placement={tooltipPlacement}>
						<IconButton
							onClick={setDropzoneOpen.bind(this, true)}
							disabled={loading}
						>
							<Badge badgeContent={attachments.length} color='secondary'>
								<AttachmentIcon />
							</Badge>
						</IconButton>
					</Tooltip>
					<AttachmentsDropzone
						dropzoneOpen={dropzoneOpen}
						setDropzoneOpen={setDropzoneOpen}
						attachments={attachments}
						setAttachments={setAttachments}
					/>
				</Grid>
				<Grid item>
					<StyledPostButton
						variant='outlined'
						color='primary'
						onClick={handleSubmit}
						disabled={!isValid || loading || uploading}
					>
						Post
					</StyledPostButton>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default ActionsBar;
