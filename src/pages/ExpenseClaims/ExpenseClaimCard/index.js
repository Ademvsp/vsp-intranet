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
  Badge,
  Tooltip,
  useMediaQuery
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
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
import AttachmentsContainer from '../../../components/AttachmentsContainer';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const ExpenseClaimCard = withTheme((props) => {
  const dispatch = useDispatch();
  const scrollRef = useRef();
  const { authUser } = useSelector((state) => state.authState);
  const { users } = useSelector((state) => state.dataState);
  const {
    expenseClaimId,
    scroll,
    setActiveExpenseClaimId,
    permissions
  } = props;
  const [expenseClaim, setExpenseClaim] = useState();
  const [showComments, setShowComments] = useState(false);
  const mobile = useMediaQuery('(max-width: 767px)');

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
      if (expenseClaimListener) {
        expenseClaimListener();
      }
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

  const newCommentHandler = async (values) => {
    const result = await dispatch(addComment(expenseClaim, values));
    return result;
  };

  const commentsClickHandler = () => {
    setShowComments((prevState) => !prevState);
  };

  const commentLikeClickHandler = async (reverseIndex) => {
    //Comments get reversed to display newest first, need to switch it back
    const index = expenseClaim.comments.length - reverseIndex - 1;
    const newExpenseClaim = new ExpenseClaim({ ...expenseClaim });
    await newExpenseClaim.toggleCommentLike(index);
  };

  let commentIcon = <CommentOutlinedIcon />;
  const commentUsers = expenseClaim.comments.map((comment) => comment.user);
  if (commentUsers.includes(authUser.userId)) {
    commentIcon = <CommentRoundedIcon />;
  }
  const commentToolip = () => {
    const commentUsers = users.filter((user) => {
      const commentUserIds = expenseClaim.comments.map(
        (comment) => comment.user
      );
      return commentUserIds.includes(user.userId);
    });
    const tooltip = commentUsers.map((commentUser) => (
      <div key={commentUser.userId}>{commentUser.getFullName()}</div>
    ));
    return tooltip;
  };

  const commentButton = (
    <Button
      style={{ textTransform: 'unset' }}
      size='small'
      color='secondary'
      onClick={commentsClickHandler}
      startIcon={
        <Badge color='secondary' badgeContent={expenseClaim.comments.length}>
          {commentIcon}
        </Badge>
      }
    >
      Comment
    </Button>
  );

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
          <Grid container direction='column' spacing={2}>
            <Grid
              item
              style={{ width: mobile ? window.innerWidth * 0.85 : 'unset' }}
            >
              <ExpenseClaimTable expenseClaim={expenseClaim} />
            </Grid>
            <Grid item>
              <AttachmentsContainer attachments={expenseClaim.attachments} />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
          <Grid container direction='column' spacing={2}>
            <Grid item container direction='row' justify='flex-end' spacing={1}>
              <ActionButtons
                expenseClaim={expenseClaim}
                user={user}
                permissions={permissions}
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
                {expenseClaim.comments.length > 0 ? (
                  <Tooltip title={commentToolip()}>{commentButton}</Tooltip>
                ) : (
                  commentButton
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardActions>
        <Collapse in={showComments} timeout='auto'>
          <Comments
            submitHandler={newCommentHandler}
            comments={[...expenseClaim.comments].reverse()}
            actionBarNotificationProps={{
              enabled: true,
              tooltip:
                'The expenses admin, the original requester and their manager will be notified automatically',
              readOnly: true
            }}
            commentLikeClickHandler={commentLikeClickHandler}
          />
        </Collapse>
      </Card>
    </div>
  );
});

export default ExpenseClaimCard;
