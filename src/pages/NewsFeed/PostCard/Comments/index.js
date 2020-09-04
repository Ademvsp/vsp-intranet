import React, { Fragment } from 'react';
import { List, Divider } from '@material-ui/core';
import Comment from './Comment';
import moment from 'moment';
import NewComment from './NewComment';
import { StyledNewCommentContainer } from './styled-components';

const Comments = (props) => {
	const { comments, postId } = props;
	return (
		<Fragment>
			<StyledNewCommentContainer>
				<NewComment authUser={props.authUser} postId={postId} />
			</StyledNewCommentContainer>
			<List>
				{comments.map((comment) => {
					return (
						<Fragment key={moment(comment.createdAt.toDate()).format('x')}>
							<Divider variant='middle' light={true} />
							<Comment comment={comment} />
						</Fragment>
					);
				})}
			</List>
		</Fragment>
	);
};

export default Comments;
