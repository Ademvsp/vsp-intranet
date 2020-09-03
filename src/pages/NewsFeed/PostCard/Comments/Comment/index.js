import React from 'react';
import { ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { StyledAvatar } from '../../../../../utils/styled-components';
import moment from 'moment';
import {
	StyledListHeader,
	StyledListItem,
	StyledListBody
} from './styled-components';

const Comment = (props) => {
	const { authUser } = useSelector((state) => state.authState);
	const { users } = useSelector((state) => state.dataState);
	const { comment } = props;
	const user = users.find((user) => user.userId === comment.user);

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
			<StyledListBody
				dangerouslySetInnerHTML={{
					__html: comment.body
				}}
			/>
		</StyledListItem>
	);
};

export default Comment;
