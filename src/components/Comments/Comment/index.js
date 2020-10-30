import React from 'react';
import { ListItemAvatar, ListItemText } from '@material-ui/core';
import { format } from 'date-fns';
import { StyledListHeader, StyledListItem } from './styled-components';
import InnerHtml from '../../InnerHtml';
import AttachmentsContainer from '../../AttachmentsContainer';
import Avatar from '../../Avatar';
import { useSelector } from 'react-redux';
import { LONG_DATE_TIME } from '../../../utils/date';

const Comment = (props) => {
	const { users } = useSelector((state) => state.dataState);
	const { comment } = props;
	const commentDate = comment.metadata.createdAt.toDate();

	const user = users.find((user) => user.userId === comment.user);

	return (
		<StyledListItem>
			<StyledListHeader>
				<ListItemAvatar>
					<Avatar user={user} clickable={true} contactCard={true} />
				</ListItemAvatar>
				<ListItemText
					primary={user.getFullName()}
					secondary={format(commentDate, LONG_DATE_TIME)}
				/>
			</StyledListHeader>
			<InnerHtml html={comment.body} />
			<AttachmentsContainer attachments={comment.attachments} />
		</StyledListItem>
	);
};

export default Comment;
