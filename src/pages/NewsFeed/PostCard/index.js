import React, { useEffect, useState, Fragment } from 'react';
import { CircularProgress, Collapse, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import * as postContoller from '../../../controllers/post';
import moment from 'moment';
import {
	StyledCard,
	StyledCardHeader,
	StyledCardContent,
	StyledButton,
	StyledCardActions
} from './styled-components';
import { StyledAvatar } from '../../../utils/styled-components';
import Post from '../../../models/post';
import { Comment as CommentIcon } from '@material-ui/icons';
import Comments from './Comments';

const PostCard = (props) => {
	const { authUser } = useSelector((state) => state.authState);
	const { users } = useSelector((state) => state.dataState);
	const postId = props.postId;
	const [post, setPost] = useState();
	const [showComments, setShowComments] = useState(false);

	useEffect(() => {
		let postListener;
		const asyncFunction = async () => {
			const postRef = postContoller.getPostRef(postId);
			postListener = postRef.onSnapshot((doc) => {
				const newPost = new Post({
					postId: doc.id,
					attachments: doc.data().attachments,
					body: doc.data().body,
					comments: doc.data().comments,
					title: doc.data().title,
					createdAt: doc.data().createdAt,
					createdBy: doc.data().createdBy
				});
				setPost(newPost);
			});
		};
		asyncFunction();
		return () => {
			postListener();
		};
	}, [postId]);

	if (!post) {
		return <CircularProgress />;
	}
	const user = users.find((user) => user.userId === post.createdBy);

	const commentsClickHandler = () => {
		setShowComments((prevState) => !prevState);
	};

	const firstNameInitial = user.firstName.substring(0, 1);
	const lastNameInitial = user.lastName.substring(0, 1);
	const commentsCount = post.comments.length;
	let commentButtonText = 'Comment';
	if (commentsCount > 0) {
		commentButtonText = `${commentsCount} Comment`;
		if (commentsCount > 1) {
			commentButtonText = `${commentButtonText}s`;
		}
	}

	return (
		<StyledCard raised>
			<StyledCardHeader
				avatar={
					<Fragment>
						<StyledAvatar
							src={user.profilePicture}
							darkMode={authUser.settings.darkMode}
						>{`${firstNameInitial}${lastNameInitial}`}</StyledAvatar>
					</Fragment>
				}
				title={post.title}
				titleTypographyProps={{
					variant: 'body1'
				}}
				subheader={`${user.firstName} ${user.lastName}`}
			/>
			<StyledCardContent
				dangerouslySetInnerHTML={{
					__html: post.body
				}}
			/>
			<StyledCardActions>
				<Typography color='secondary' component='span' variant='body2'>
					{moment(post.createdAt.toDate()).format('llll')}
				</Typography>
				<StyledButton
					size='small'
					color='secondary'
					onClick={commentsClickHandler}
					startIcon={post.comments.length === 0 && <CommentIcon />}
				>
					{commentButtonText}
				</StyledButton>
			</StyledCardActions>
			<Collapse in={showComments} timeout='auto'>
				<Comments
					authUser={authUser}
					postId={postId}
					comments={[...post.comments].reverse()}
				/>
			</Collapse>
		</StyledCard>
	);
};

export default PostCard;
