import React, { Fragment } from 'react';
import { List, Divider } from '@material-ui/core';
import Comment from './Comment';
import moment from 'moment';

const Comments = (props) => {
	const { comments } = props;
	new Date().toISOString();
	return (
		//Return post text box
		<List>
			{comments.map((comment) => {
				return (
					<Fragment key={moment(comment.createdAt).format('x')}>
						<Divider variant='middle' light={true} />
						<Comment comment={comment} />
					</Fragment>
				);
			})}
		</List>
	);
};

export default Comments;
