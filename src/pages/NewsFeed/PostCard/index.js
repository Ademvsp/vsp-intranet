import React, { useEffect, useState, useRef } from 'react';
import {
	Collapse,
	Typography,
	IconButton,
	Button,
	CardHeader,
	CardContent,
	CardActions,
	withTheme,
	Grid
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
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
import { addComment } from '../../../store/actions/product-request';

const PostCard = withTheme((props) => {
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
			postListener = Post.getListener(postId).onSnapshot((doc) => {
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
				<CardHeader
					avatar={
						<Skeleton animation='pulse' variant='circle'>
							<Avatar user={authUser} />
						</Skeleton>
					}
					title={<Skeleton animation='pulse' height={20} width='60%' />}
					subheader={<Skeleton animation='pulse' height={20} width='40%' />}
					action={
						<IconButton disabled={true}>
							<MoreVertIcon />
						</IconButton>
					}
				/>
				<CardContent>
					<Skeleton animation='pulse' variant='rect' height={200} />
				</CardContent>
				<CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
					<Grid container justify='space-between'>
						<Skeleton animation='pulse' height={20} width='20%' />
						<Skeleton animation='pulse' height={30} width='10%' />
					</Grid>
				</CardActions>
			</Card>
		);
	}

	const newCommentHandler = async (body, attachments, notifyUsers) => {
		const result = await dispatch(
			addComment(post, body, attachments, notifyUsers)
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
				<CardHeader
					avatar={<Avatar user={user} clickable={true} contactCard={true} />}
					title={post.title}
					titleTypographyProps={{
						variant: 'body1'
					}}
					subheader={`${user.firstName} ${user.lastName}`}
					action={<PostCardMenu post={post} />}
				/>
				<CardContent>
					<InnerHtml html={post.body} />
					<AttachmentsContainer attachments={post.attachments} />
				</CardContent>
				        
				<CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
					<Grid container justify='space-between'>
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
					</Grid>
				</CardActions>
				<Collapse in={showComments} timeout='auto'>
					<Comments
						authUser={authUser}
						submitHandler={newCommentHandler}
						comments={[...post.comments].reverse()}
						enableNotifyUsers={true}
					/>
				</Collapse>
			</Card>
		</div>
	);
});

export default PostCard;
