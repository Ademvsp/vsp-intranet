import React from 'react';
import { ListItemAvatar, ListItemText } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { StyledAvatar } from '../../../../../utils/styled-components';
import moment from 'moment';
import { StyledListHeader, StyledListItem } from './styled-components';
import InnerHtml from '../../../../../components/InnerHtml';
import AttachmentsContainer from '../../../../../components/AttachmentsContainer';

const Comment = (props) => {
	const { authUser } = useSelector((state) => state.authState);
	const { users } = useSelector((state) => state.dataState);
	const { comment } = props;
	const user = users.find((user) => user.userId === comment.createdBy);

	const firstNameInitial = user.firstName.substring(0, 1);
	const lastNameInitial = user.lastName.substring(0, 1);

	return (
		<StyledListItem>
			<StyledListHeader>
				<ListItemAvatar>
					<StyledAvatar
						src={user.profilePicture}
						darkMode={authUser.settings.darkMode}
					>{`${firstNameInitial}${lastNameInitial}`}</StyledAvatar>
				</ListItemAvatar>
				<ListItemText
					primary={`${user.firstName} ${user.lastName}`}
					secondary={`${moment(comment.createdAt.toDate()).format('llll')}`}
				/>
			</StyledListHeader>
			<InnerHtml html={comment.body} />
			<AttachmentsContainer attachments={comment.attachments} />
		</StyledListItem>
	);
};

export default Comment;
