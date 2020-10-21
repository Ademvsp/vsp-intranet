import React, { useEffect, useState, useRef } from 'react';
import { Collapse, Typography, IconButton, Button } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import * as postController from '../../../controllers/post';
import { format } from 'date-fns';
import {
	StyledCardHeader,
	StyledCardContent,
	StyledCardActions
} from './styled-components';
import Post from '../../../models/post';
import {
	Comment as CommentIcon,
	MoreVert as MoreVertIcon
} from '@material-ui/icons';
import Comments from '../../../components/Comments';
import { Skeleton } from '@material-ui/lab';
import InnerHtml from '../../../components/InnerHtml';
import AttachmentsContainer from '../../../components/AttachmentsContainer';
import Avatar from '../../../components/Avatar';
import scrollToComponent from 'react-scroll-to-component';
import PostCardMenu from './PostCardMenu';
import Card from '../../../components/Card';
import { LONG_DATE_TIME } from '../../../utils/date';

const PostCard = (props) => {
	const dispatch = useDispatch();
	const scrollRef = useRef();
	const { authUser } = useSelector((state) => state.authState);
	const { users } = useSelector((state) => state.dataState);
	const { postId, scroll, setActivePostId } = props;
	const [post, setPost] = useState();
	const [showComments, setShowComments] = useState(false);

	useEffect(() => {
		if (scroll && post) {
			scrollToComponent(scrollRef.current, {
				ease: 'linear',
				align: 'top',
				offset: -90,
				duration: 500
			});
			setActivePostId(null);
		}
	}, [scroll, setActivePostId, post]);

	useEffect(() => {
		let postListener;
		const asyncFunction = async () => {
			postListener = postController.getListener(postId).onSnapshot((doc) => {
				const metadata = {
					...doc.data().metadata,
					createdAt: doc.data().metadata.createdAt.toDate(),
					updatedAt: doc.data().metadata.updatedAt.toDate()
				};
				const newPost = new Post({
					...doc.data(),
					postId: doc.id,
					metadata: metadata
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
		return (
			<Card elevation={2}>
				<StyledCardHeader
					skeleton={true}
					avatar={
						<Skeleton animation='pulse' variant='circle'>
							<Avatar user={authUser} />
						</Skeleton>
					}
					title={<Skeleton animation='pulse' height={10} width='60%' />}
					subheader={<Skeleton animation='pulse' height={10} width='40%' />}
					action={
						<IconButton disabled={true}>
							<MoreVertIcon />
						</IconButton>
					}
				/>
				<StyledCardContent skeleton={true}>
					<Skeleton animation='pulse' variant='rect' height={200} />
				</StyledCardContent>
				<StyledCardActions>
					<Skeleton animation='pulse' height={10} width='20%' />
					<Skeleton animation='pulse' height={15} width='10%' />
				</StyledCardActions>
			</Card>
		);
	}

	const newCommentHandler = async (body, attachments, notifyUsers) => {
		const result = await dispatch(
			postController.addComment(post, body, attachments, notifyUsers)
		);
		return result;
	};

	const commentsClickHandler = () => {
		setShowComments((prevState) => !prevState);
	};

	const commentsCount = post.comments.length;
	let commentButtonText = 'Comment';
	if (commentsCount > 0) {
		commentButtonText = `${commentsCount} Comment`;
		if (commentsCount > 1) {
			commentButtonText = `${commentButtonText}s`;
		}
	}

	const user = users.find((user) => user.userId === post.user);
	const postDate = post.metadata.createdAt;

	return (
		<div ref={scrollRef}>
			<Card elevation={2}>
				<StyledCardHeader
					avatar={<Avatar user={user} clickable={true} contactCard={true} />}
					title={post.title}
					titleTypographyProps={{
						variant: 'body1'
					}}
					subheader={`${user.firstName} ${user.lastName}`}
					action={<PostCardMenu post={post} />}
				/>
				<StyledCardContent>
					<InnerHtml html={post.body} />
					<AttachmentsContainer attachments={post.attachments} />
				</StyledCardContent>
				<StyledCardActions>
					<Typography color='secondary' component='span' variant='body2'>
						{format(postDate, LONG_DATE_TIME)}
					</Typography>
					<Button
						style={{ textTransform: 'unset' }}
						size='small'
						color='secondary'
						onClick={commentsClickHandler}
						startIcon={post.comments.length === 0 && <CommentIcon />}
					>
						{commentButtonText}
					</Button>
				</StyledCardActions>
				<Collapse in={showComments} timeout='auto'>
					<Comments
						authUser={authUser}
						submitHandler={newCommentHandler}
						comments={[...post.comments].reverse()}
					/>
				</Collapse>
			</Card>
		</div>
	);
};

export default PostCard;
