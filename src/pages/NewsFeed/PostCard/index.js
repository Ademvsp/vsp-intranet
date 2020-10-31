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
	Grid,
	Badge
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import Post from '../../../models/post';
import Comments from '../../../components/Comments';
import { Skeleton } from '@material-ui/lab';
import InnerHtml from '../../../components/InnerHtml';
import AttachmentsContainer from '../../../components/AttachmentsContainer';
import Avatar from '../../../components/Avatar';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import ThumbUpRoundedIcon from '@material-ui/icons/ThumbUpRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import scrollToComponent from 'react-scroll-to-component';
import PostCardMenu from './PostCardMenu';
import Card from '../../../components/Card';
import { LONG_DATE_TIME } from '../../../utils/date';
import { addComment } from '../../../store/actions/post';

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

	const newCommentHandler = async (values) => {
		const result = await dispatch(addComment(post, values));
		return result;
	};

	const commentsClickHandler = () => {
		setShowComments((prevState) => !prevState);
	};

	const likeClickHandler = async () => {
		await post.toggleLike();
	};

	let commentIcon = <CommentOutlinedIcon />;
	const commentUsers = post.comments.map((comment) => comment.user);
	if (commentUsers.includes(authUser.userId)) {
		commentIcon = <CommentRoundedIcon />;
	}

	let likeIcon = <ThumbUpOutlinedIcon />;
	if (post.likes.includes(authUser.userId)) {
		likeIcon = <ThumbUpRoundedIcon />;
	}

	const user = users.find((user) => user.userId === post.user);
	const postDate = post.metadata.createdAt;

	return (
		<div ref={scrollRef}>
			<Card elevation={2}>
				<CardHeader
					avatar={<Avatar user={user} clickable={true} contactCard={true} />}
					title={user.getFullName()}
					titleTypographyProps={{
						variant: 'body1'
					}}
					subheader={post.title}
					action={<PostCardMenu post={post} />}
				/>
				<CardContent>
					<InnerHtml html={post.body} />
					<AttachmentsContainer attachments={post.attachments} />
				</CardContent>
				<CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
					<Grid container justify='space-evenly' wrap='nowrap'>
						<Grid item container justify='flex-start' alignItems='center'>
							<Grid item>
								<Typography color='secondary' component='span' variant='body2'>
									{format(postDate, LONG_DATE_TIME)}
								</Typography>
							</Grid>
						</Grid>
						<Grid
							item
							container
							spacing={1}
							justify='flex-end'
							alignItems='center'
						>
							<Grid item>
								<Button
									style={{ textTransform: 'unset' }}
									size='small'
									color='secondary'
									onClick={commentsClickHandler}
									startIcon={
										<Badge color='primary' badgeContent={post.comments.length}>
											{commentIcon}
										</Badge>
									}
								>
									Comment
								</Button>
							</Grid>
							<Grid item>
								<Button
									style={{ textTransform: 'unset' }}
									size='small'
									color='secondary'
									onClick={likeClickHandler}
									startIcon={
										<Badge color='primary' badgeContent={post.likes.length}>
											{likeIcon}
										</Badge>
									}
								>
									Like
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</CardActions>
				<Collapse in={showComments} timeout='auto'>
					<Comments
						authUser={authUser}
						submitHandler={newCommentHandler}
						comments={[...post.comments].reverse()}
						actionBarNotificationProps={{
							enabled: true,
							tooltip: 'All post participants will be notified automatically'
						}}
					/>
				</Collapse>
			</Card>
		</div>
	);
});

export default PostCard;
