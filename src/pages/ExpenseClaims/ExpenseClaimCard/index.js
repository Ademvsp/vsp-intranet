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
import {
	Comment as CommentIcon,
	MoreVert as MoreVertIcon
} from '@material-ui/icons';
import Comments from '../../../components/Comments';
import { Skeleton } from '@material-ui/lab';
import Avatar from '../../../components/Avatar';
import scrollToComponent from 'react-scroll-to-component';
import Card from '../../../components/Card';
import { LONG_DATE_TIME } from '../../../utils/date';
import ExpenseClaimTable from './ExpenseClaimTable';
import ActionButtons from './ActionButtons';
import ExpenseClaim from '../../../models/expense-claim';
import { toCurrency } from '../../../utils/data-transformer';
import { addComment } from '../../../store/actions/expense-claim';

const ExpenseClaimCard = withTheme((props) => {
	const dispatch = useDispatch();
	const scrollRef = useRef();
	const { authUser } = useSelector((state) => state.authState);
	const { users } = useSelector((state) => state.dataState);
	const { expenseClaimId, scroll, setActiveExpenseClaimId, isAdmin } = props;
	const [expenseClaim, setExpenseClaim] = useState();
	const [showComments, setShowComments] = useState(false);

	useEffect(() => {
		if (scroll && expenseClaim) {
			scrollToComponent(scrollRef.current, {
				ease: 'linear',
				align: 'top',
				offset: -90,
				duration: 500
			});
			setActiveExpenseClaimId(null);
		}
	}, [scroll, setActiveExpenseClaimId, expenseClaim]);

	useEffect(() => {
		let expenseClaimListener;
		const asyncFunction = async () => {
			expenseClaimListener = ExpenseClaim.getListener(
				expenseClaimId
			).onSnapshot((doc) => {
				const metadata = {
					...doc.data().metadata,
					createdAt: doc.data().metadata.createdAt.toDate(),
					updatedAt: doc.data().metadata.updatedAt.toDate()
				};
				const actions = doc.data().actions.map((action) => ({
					...action,
					actionedAt: action.actionedAt.toDate()
				}));
				const expenses = doc.data().expenses.map((expense) => ({
					...expense,
					date: expense.date.toDate()
				}));
				const newExpenseClaim = new ExpenseClaim({
					...doc.data(),
					expenseClaimId: doc.id,
					actions: actions,
					metadata: metadata,
					expenses: expenses
				});
				setExpenseClaim(newExpenseClaim);
			});
		};
		asyncFunction();
		return () => {
			expenseClaimListener();
		};
	}, [expenseClaimId, users]);

	if (!expenseClaim) {
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
					<Skeleton animation='pulse' height={20} width='20%' />
					<Skeleton animation='pulse' height={30} width='10%' />
				</CardActions>
			</Card>
		);
	}

	const newCommentHandler = async (body, attachments) => {
		const result = await dispatch(addComment(expenseClaim, body, attachments));
		return result;
	};

	const commentsClickHandler = () => {
		setShowComments((prevState) => !prevState);
	};
	const commentsCount = expenseClaim.comments.length;
	let commentButtonText = 'Comment';
	if (commentsCount > 0) {
		commentButtonText = `${commentsCount} Comment`;
		if (commentsCount > 1) {
			commentButtonText = `${commentButtonText}s`;
		}
	}

	const user = users.find((user) => user.userId === expenseClaim.user);
	const postDate = expenseClaim.metadata.createdAt;
	const totalValue = expenseClaim.expenses.reduce(
		(previousValue, currentValue) => previousValue + currentValue.value,
		0
	);

	return (
		<div ref={scrollRef}>
			<Card elevation={2}>
				<CardHeader
					avatar={<Avatar user={user} clickable={true} contactCard={true} />}
					title={user.getFullName()}
					titleTypographyProps={{
						variant: 'body1'
					}}
					subheader={toCurrency(totalValue, 2)}
				/>
				<CardContent>
					<ExpenseClaimTable expenseClaim={expenseClaim} />
				</CardContent>
				<CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
					<Grid container direction='column' spacing={1}>
						<Grid item container direction='row' justify='flex-end' spacing={1}>
							<ActionButtons
								expenseClaim={expenseClaim}
								user={user}
								isAdmin={isAdmin}
								isManager={authUser.userId === expenseClaim.manager}
							/>
						</Grid>
						<Grid item container direction='row' justify='space-between'>
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
										expenseClaim.comments.length === 0 && <CommentIcon />
									}
								>
									{commentButtonText}
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</CardActions>
				<Collapse in={showComments} timeout='auto'>
					<Comments
						authUser={authUser}
						submitHandler={newCommentHandler}
						comments={[...expenseClaim.comments].reverse()}
						actionBarNotificationProps={{
							enabled: true,
							tooltip:
								'The expenses admin, the original requester and their manager will be notified automatically',
							readOnly: true
						}}
					/>
				</Collapse>
			</Card>
		</div>
	);
});

export default ExpenseClaimCard;
