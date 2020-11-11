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
  Card
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import ProductRequest from '../../../models/product-request';
import Comments from '../../../components/Comments';
import { Skeleton } from '@material-ui/lab';
import AttachmentsContainer from '../../../components/AttachmentsContainer';
import Avatar from '../../../components/Avatar';
import scrollToComponent from 'react-scroll-to-component';
import { LONG_DATE_TIME } from '../../../utils/date';
import ProductRequestForm from './ProductRequestForm';
import ActionButtons from './ActionButtons';
import { addComment } from '../../../store/actions/product-request';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const ProductRequestCard = withTheme((props) => {
  const dispatch = useDispatch();
  const scrollRef = useRef();
  const { authUser } = useSelector((state) => state.authState);
  const { users } = useSelector((state) => state.dataState);
  const {
    permissions,
    productRequestId,
    scroll,
    setActiveProductRequestId
  } = props;
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
      productRequestListener = ProductRequest.getListener(
        productRequestId
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
        const newProductRequest = new ProductRequest({
          ...doc.data(),
          productRequestId: doc.id,
          actions: actions,
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
    const result = await dispatch(addComment(productRequest, values));
    return result;
  };

  const commentsClickHandler = () => {
    setShowComments((prevState) => !prevState);
  };

  const commentLikeClickHandler = async (reverseIndex) => {
    //Comments get reversed to display newest first, need to switch it back
    const index = productRequest.comments.length - reverseIndex - 1;
    const newEvent = new ProductRequest({ ...productRequest });
    await newEvent.toggleCommentLike(index);
  };

  let commentIcon = <CommentOutlinedIcon />;
  const commentUsers = productRequest.comments.map((comment) => comment.user);
  if (commentUsers.includes(authUser.userId)) {
    commentIcon = <CommentRoundedIcon />;
  }
  const commentToolip = () => {
    const commentUsers = users.filter((user) => {
      const commentUserIds = productRequest.comments.map(
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
        <Badge color='secondary' badgeContent={productRequest.comments.length}>
          {commentIcon}
        </Badge>
      }
    >
      Comments
    </Button>
  );

  const user = users.find((user) => user.userId === productRequest.user);
  const postDate = productRequest.metadata.createdAt;

  return (
    <div ref={scrollRef}>
      <Card elevation={2}>
        <CardHeader
          avatar={<Avatar user={user} clickable={true} contactCard={true} />}
          title={user.getFullName()}
          titleTypographyProps={{
            variant: 'body1'
          }}
          subheader={productRequest.finalSku || productRequest.vendorSku}
        />
        <CardContent>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <ProductRequestForm productRequest={productRequest} />
            </Grid>
            <Grid item>
              <AttachmentsContainer attachments={productRequest.attachments} />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
          <Grid container direction='column' spacing={2}>
            <Grid item container direction='row' justify='flex-end' spacing={1}>
              <ActionButtons
                productRequest={productRequest}
                permissions={permissions}
              />
            </Grid>
            <Grid item container direction='row' justify='space-between'>
              <Grid item>
                <Typography color='secondary' component='span' variant='body2'>
                  {format(postDate, LONG_DATE_TIME)}
                </Typography>
              </Grid>
              <Grid item>
                {productRequest.comments.length > 0 ? (
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
            comments={[...productRequest.comments].reverse()}
            actionBarNotificationProps={{
              enabled: true,
              tooltip:
                'The product request admin and the original requester will be notified automatically',
              readOnly: true
            }}
            commentLikeClickHandler={commentLikeClickHandler}
          />
        </Collapse>
      </Card>
    </div>
  );
});

export default ProductRequestCard;
