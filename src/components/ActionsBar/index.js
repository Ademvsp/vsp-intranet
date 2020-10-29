import React, { useState } from 'react';
import {
	Grid,
	Tooltip,
	IconButton,
	Badge,
	Button,
	Typography,
	withTheme
} from '@material-ui/core';
import ProgressWithLabel from '../ProgressWithLabel';
import { useSelector } from 'react-redux';
import {
	Attachment as AttachmentIcon,
	People as PeopleIcon,
	Comment as CommentIcon
} from '@material-ui/icons';
import NotifyUsersList from '../NotifyUsersList';
import AttachmentsDropzone from '../AttachmentsDropZone';
import { StyledButtonProgress } from './styled-components';

const ActionsBar = withTheme((props) => {
	const uploadState = useSelector((state) => state.uploadState);
	const [notifyUsersOpen, setNotifyUsersOpen] = useState(false);
	const [dropzoneOpen, setDropzoneOpen] = useState(false);
	const {
		notifications,
		attachments,
		comments,
		buttonLoading,
		loading,
		isValid,
		onClick,
		tooltipPlacement,
		actionButtonText,
		additionalButtons
	} = props;

	function getAttachmentsTooltip(attachments) {
		console.log(attachments);
	}

	return (
		<Grid container direction='column'>
			{uploadState.filesProgress && (
				<Grid item>
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
				</Grid>
			)}
			<Grid item container direction='row' wrap='nowrap' spacing={1}>
				<Grid
					item
					container
					direction='row'
					justify='flex-end'
					alignItems='center'
				>
					{comments?.enabled && (
						<Grid item>
							<Tooltip title='Comments' placement={tooltipPlacement}>
								<IconButton disabled={loading} onClick={comments.clickHandler}>
									<Badge badgeContent={comments.count} color='secondary'>
										<CommentIcon />
									</Badge>
								</IconButton>
							</Tooltip>
						</Grid>
					)}
					{notifications?.enabled && (
						<Grid item>
							<Tooltip
								title={notifications.tooltip || 'Notify staff'}
								placement={tooltipPlacement}
							>
								<IconButton
									disabled={loading}
									onClick={
										!notifications.readOnly &&
										setNotifyUsersOpen.bind(this, true)
									}
								>
									<Badge
										badgeContent={notifications.notifyUsers?.length}
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
					{attachments?.enabled && (
						<Grid item>
							<Tooltip
								title={
									attachments.attachments.length
										? attachments.attachments.map((attachment) => {
												return (
													<div key={attachment.name}>{attachment.name}</div>
												);
										  })
										: 'Attachments'
								}
								placement={tooltipPlacement}
							>
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
				</Grid>
				<Grid
					item
					container
					direction='row'
					justify='flex-end'
					alignItems='center'
					wrap='nowrap'
					spacing={1}
					style={{ flex: 1 }}
				>
					{additionalButtons &&
						additionalButtons.map((additionalButton) => (
							<Grid
								key={additionalButton.buttonText}
								item
								container
								justify='center'
								alignItems='center'
								style={{ position: 'relative' }}
							>
								<Button
									variant='outlined'
									color='primary'
									onClick={additionalButton.onClick}
									disabled={!isValid || loading}
								>
									{additionalButton.buttonText}
								</Button>
								{additionalButton.buttonLoading && (
									<StyledButtonProgress size={25} />
								)}
							</Grid>
						))}
					<Grid
						item
						container
						justify='center'
						alignItems='center'
						style={{ position: 'relative' }}
					>
						<Button
							variant='outlined'
							color='primary'
							onClick={onClick}
							disabled={!isValid || loading}
						>
							{actionButtonText}
						</Button>
						{buttonLoading && <StyledButtonProgress size={25} />}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
});

export default ActionsBar;
