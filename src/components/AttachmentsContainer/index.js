import React from 'react';
import { StyledAttachmentsContainer } from './styled-components';
import { Chip } from '@material-ui/core';
import { Attachment as AttachmentIcon } from '@material-ui/icons';

const AttachmentsContainer = (props) => {
	return (
		<StyledAttachmentsContainer>
			{props.attachments.map((attachment, index) => (
				<Chip
					key={`${index}-${attachment.name}`}
					label={attachment.name}
					icon={<AttachmentIcon />}
					color='primary'
					clickable={!!attachment.link}
					component='a'
					href={attachment.link || null}
					target='_blank'
					size='small'
					variant='outlined'
				/>
			))}
		</StyledAttachmentsContainer>
	);
};

export default AttachmentsContainer;
