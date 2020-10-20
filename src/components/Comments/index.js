import React, { Fragment } from 'react';
import { List, Divider, Button } from '@material-ui/core';
import Comment from './Comment';
import NewComment from './NewComment';
import {
	StyledNewCommentContainer,
	StyledButtonContainer
} from './styled-components';
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';

const Comments = (props) => {
	const { comments, submitHandler } = props;
	return (
		<Fragment>
			<StyledNewCommentContainer>
				<NewComment authUser={props.authUser} submitHandler={submitHandler} />
			</StyledNewCommentContainer>
			{comments.length > 0 ? (
				<StyledButtonContainer>
					<Button
						size='small'
						endIcon={<ArrowDropDownIcon />}
						color='secondary'
					>
						Newest comments
					</Button>
				</StyledButtonContainer>
			) : null}
			<List>
				{comments.map((comment, index) => {
					return (
						<Fragment
							key={comment.metadata.createdAt.toDate().getTime().toString()}
						>
							{index > 0 ? <Divider variant='middle' light={true} /> : null}
							<Comment comment={comment} />
						</Fragment>
					);
				})}
			</List>
		</Fragment>
	);
};

export default Comments;
