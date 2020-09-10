import React, { useState } from 'react';
import { Grid, Tooltip, IconButton, Badge, Button } from '@material-ui/core';
import ProgressWithLabel from '../ProgressWithLabel';
import { useSelector } from 'react-redux';
import {
	Attachment as AttachmentIcon,
	People as PeopleIcon
} from '@material-ui/icons';
import NotifyUsersList from '../NotifyUsersList';
import AttachmentsDropzone from '../AttachmentsDropZone';
import {
	StyledButtonProgress,
	StyledButtonContainer
} from './styled-components';

const ActionsBar = (props) => {
	const uploadState = useSelector((state) => state.uploadState);
	const [notifyUsersOpen, setNotifyUsersOpen] = useState(false);
	const [dropzoneOpen, setDropzoneOpen] = useState(false);
	const {
		notifications,
		attachments,
		loading,
		isValid,
		handleSubmit,
		tooltipPlacement,
		actionButtonText
	} = props;
	return (
		<Grid container direction='column'>
			<Grid item>
				{uploadState.filesProgress && (
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
				)}
			</Grid>
			<Grid item container justify='flex-end' alignItems='center'>
				{notifications.enabled && (
					<Grid item>
						<Tooltip title='Notify staff' placement={tooltipPlacement}>
							<IconButton
								disabled={loading}
								onClick={setNotifyUsersOpen.bind(this, true)}
							>
								<Badge
									badgeContent={notifications.notifyUsers.length}
									color='secondary'
								>
									<PeopleIcon />
								</Badge>
							</IconButton>
						</Tooltip>
						<NotifyUsersList
							setNotifyUsersOpen={setNotifyUsersOpen}
							notifyUsersOpen={notifyUsersOpen}
							setNotifyUsers={notifications.setNotifyUsers}
							notifyUsers={notifications.notifyUsers}
						/>
					</Grid>
				)}
				{attachments.enabled && (
					<Grid item>
						<Tooltip title='Attachments' placement={tooltipPlacement}>
							<IconButton
								onClick={setDropzoneOpen.bind(this, true)}
								disabled={loading}
							>
								<Badge
									badgeContent={attachments.attachments.length}
									color='secondary'
								>
									<AttachmentIcon />
								</Badge>
							</IconButton>
						</Tooltip>
						<AttachmentsDropzone
							dropzoneOpen={dropzoneOpen}
							setDropzoneOpen={setDropzoneOpen}
							attachments={attachments.attachments}
							setAttachments={attachments.setAttachments}
						/>
					</Grid>
				)}
				<Grid item>
					<StyledButtonContainer>
						<Button
							variant='outlined'
							color='primary'
							onClick={handleSubmit}
							disabled={!isValid || loading}
						>
							{actionButtonText}
						</Button>
						{loading && <StyledButtonProgress size={25} />}
					</StyledButtonContainer>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default ActionsBar;
