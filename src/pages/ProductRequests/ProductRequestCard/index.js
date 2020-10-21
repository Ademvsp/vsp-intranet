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
import * as productRequestController from '../../../controllers/product-request';
import { format } from 'date-fns';
import {
	StyledCardHeader,
	StyledCardContent,
	StyledButton,
	StyledCardActions
} from './styled-components';
import ProductRequest from '../../../models/product-request';
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
// import PostCardMenu from './PostCardMenu';
import Card from '../../../components/Card';
import { LONG_DATE_TIME } from '../../../utils/date';
import ProductRequestForm from './ProductRequestForm';

const ProductRequestCard = withTheme((props) => {
	const dispatch = useDispatch();
	const scrollRef = useRef();
	const { authUser } = useSelector((state) => state.authState);
	const { users } = useSelector((state) => state.dataState);
	const { productRequestId, scroll, setActiveProductRequestId } = props;
	const [productRequest, setProductRequest] = useState();
	const [showComments, setShowComments] = useState(false);

	useEffect(() => {
		if (scroll && productRequest) {
			scrollToComponent(scrollRef.current, {
				ease: 'linear',
				align: 'top',
				offset: -90,
				duration: 500
			});
			setActiveProductRequestId(null);
		}
	}, [scroll, setActiveProductRequestId, productRequest]);

	useEffect(() => {
		let productRequestListener;
		const asyncFunction = async () => {
			productRequestListener = productRequestController
				.getListener(productRequestId)
				.onSnapshot((doc) => {
					const metadata = {
						...doc.data().metadata,
						createdAt: doc.data().metadata.createdAt.toDate(),
						updatedAt: doc.data().metadata.updatedAt.toDate()
					};
					const action = {
						...doc.data().action,
						actionedAt: doc.data().action.actionedAt?.toDate()
					};
					const newProductRequest = new ProductRequest({
						...doc.data(),
						productRequestId: doc.id,
						action: action,
						metadata: metadata
					});
					setProductRequest(newProductRequest);
				});
		};
		asyncFunction();
		return () => {
			productRequestListener();
		};
	}, [productRequestId, users]);

	if (!productRequest) {
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
		// const result = await dispatch(
		// 	productRequestController.addComment(
		// 		productRequest,
		// 		body,
		// 		attachments,
		// 		notifyUsers
		// 	)
		// );
		// return result;
	};

	const commentsClickHandler = () => {
		setShowComments((prevState) => !prevState);
	};

	const commentsCount = productRequest.comments.length;
	let commentButtonText = 'Comment';
	if (commentsCount > 0) {
		commentButtonText = `${commentsCount} Comment`;
		if (commentsCount > 1) {
			commentButtonText = `${commentButtonText}s`;
		}
	}

	console.log(productRequest);

	const user = users.find((user) => user.userId === productRequest.user);
	console.log(user);
	const postDate = productRequest.metadata.createdAt;

	return (
		<div ref={scrollRef}>
			<Card elevation={2}>
				<CardHeader
					avatar={<Avatar user={user} clickable={true} contactCard={true} />}
					title={productRequest.finalSku || productRequest.vendorSku}
					titleTypographyProps={{
						variant: 'body1'
					}}
					subheader={`${user.firstName} ${user.lastName}`}
					// action={<PostCardMenu productRequest={productRequest} />}
				/>
				<CardContent>
					<Grid container direction='column' spacing={1}>
						<Grid item>
							<ProductRequestForm productRequest={productRequest} />
						</Grid>
						<Grid item>
							<AttachmentsContainer attachments={productRequest.attachments} />
						</Grid>
					</Grid>
				</CardContent>
				<CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
					<Grid container direction='row' justify='space-between'>
						<Grid item>
							<Typography color='secondary' component='span' variant='body2'>
								{format(postDate, LONG_DATE_TIME)}
							</Typography>
						</Grid>
						<Grid item>
							<Button
								style={{ textTransform: 'unset' }}
								size='small'
								color='secondary'
								onClick={commentsClickHandler}
								startIcon={
									productRequest.comments.length === 0 && <CommentIcon />
								}
							>
								{commentButtonText}
							</Button>
						</Grid>
					</Grid>
				</CardActions>
				<Collapse in={showComments} timeout='auto'>
					<Comments
						authUser={authUser}
						submitHandler={newCommentHandler}
						comments={[...productRequest.comments].reverse()}
					/>
				</Collapse>
			</Card>
		</div>
	);
});

export default ProductRequestCard;
