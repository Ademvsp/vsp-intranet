import React from 'react';
import { ListItemAvatar, ListItemText } from '@material-ui/core';
import moment from 'moment';
import { StyledListHeader, StyledListItem } from './styled-components';
import InnerHtml from '../../../../../components/InnerHtml';
import AttachmentsContainer from '../../../../../components/AttachmentsContainer';
import Avatar from '../../../../../components/Avatar';
import { useSelector } from 'react-redux';

const Comment = (props) => {
	const { users } = useSelector((state) => state.dataState);
	const { comment } = props;

	const user = users.find((user) => user.userId === comment.user);

	return (
		<StyledListItem>
			<StyledListHeader>
				<ListItemAvatar>
					<Avatar user={user} clickable={true} contactCard={true} />
				</ListItemAvatar>
				<ListItemText
					primary={`${user.firstName} ${user.lastName}`}
					secondary={`${moment(comment.metadata.createdAt.toDate()).format(
						'llll'
					)}`}
				/>
			</StyledListHeader>
			<InnerHtml html={comment.body} />
			<AttachmentsContainer attachments={comment.attachments} />
		</StyledListItem>
	);
};

export default Comment;
