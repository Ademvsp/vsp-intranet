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
import { format, startOfDay } from 'date-fns';
import Comments from '../../../components/Comments';
import { Skeleton } from '@material-ui/lab';
import Avatar from '../../../components/Avatar';
import scrollToComponent from 'react-scroll-to-component';
import { LONG_DATE } from '../../../utils/date';
import AttachmentsContainer from '../../../components/AttachmentsContainer';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Promotion from '../../../models/promotion';
import InnerHtml from '../../../components/InnerHtml';
import PromotionCardMenu from './PromotionCardMenu';
import EditPromotionDialog from './EditPromotionDialog';
import { addComment, deletePromotion } from '../../../store/actions/promotion';
import ConfirmDialog from '../../../components/ConfirmDialog';

const PromotionCard = withTheme((props) => {
  const dispatch = useDispatch();
  const scrollRef = useRef();
  const { authUser } = useSelector((state) => state.authState);
  const { users } = useSelector((state) => state.dataState);
  const { promotionId, scroll, setActivePromotionId, permissions } = props;
  const [loading, setLoading] = useState(false);
  const [promotion, setPromotion] = useState();
  const [showComments, setShowComments] = useState(false);
  const [showEditPromotionDialog, setShowEditPromotionDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  useEffect(() => {
    if (scroll && promotion) {
      scrollToComponent(scrollRef.current, {
        ease: 'linear',
        align: 'top',
        offset: -90,
        duration: 500
      });
      setActivePromotionId(null);
    }
  }, [scroll, setActivePromotionId, promotion]);

  useEffect(() => {
    let promotionListener;
    const asyncFunction = async () => {
      promotionListener = Promotion.getListener(promotionId).onSnapshot(
        (doc) => {
          let newPromotion;
          if (doc.exists) {
            //This will handle for when promotion gets deleted
            const metadata = {
              ...doc.data().metadata,
              createdAt: doc.data().metadata.createdAt.toDate(),
              updatedAt: doc.data().metadata.updatedAt.toDate()
            };
            let expiry = null;
            if (doc.data().expiry) {
              expiry = doc.data().expiry.toDate();
            }
            newPromotion = new Promotion({
              ...doc.data(),
              promotionId: doc.id,
              metadata: metadata,
              expiry: expiry
            });
          }
          setPromotion(newPromotion);
        }
      );
    };
    asyncFunction();
    return () => {
      if (promotionListener) {
        promotionListener();
      }
    };
  }, [promotionId, users]);

  if (!promotion) {
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

  const deletePromotionHandler = async () => {
    setLoading(true);
    await dispatch(deletePromotion(promotion));
    setShowDeleteConfirmDialog(false);
    setLoading(false);
  };

  const newCommentHandler = async (values) => {
    const result = await dispatch(addComment(promotion, values));
    return result;
  };

  const commentsClickHandler = () => {
    setShowComments((prevState) => !prevState);
  };

  const commentLikeClickHandler = async (reverseIndex) => {
    //Comments get reversed to display newest first, need to switch it back
    const index = promotion.comments.length - reverseIndex - 1;
    const newPromotion = new Promotion({ ...promotion });
    await newPromotion.toggleCommentLike(index);
  };

  let commentIcon = <CommentOutlinedIcon />;
  const commentUsers = promotion.comments.map((comment) => comment.user);
  if (commentUsers.includes(authUser.userId)) {
    commentIcon = <CommentRoundedIcon />;
  }
  const commentToolip = () => {
    const commentUsers = users.filter((user) => {
      const commentUserIds = promotion.comments.map((comment) => comment.user);
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
        <Badge color='secondary' badgeContent={promotion.comments.length}>
          {commentIcon}
        </Badge>
      }
    >
      Comment
    </Button>
  );

  const user = users.find((user) => user.userId === promotion.user);
  const postDate = promotion.metadata.createdAt;
  const expiryDate = promotion.expiry;

  let expiryText = 'No Expiry Date';
  if (expiryDate) {
    const expired =
      startOfDay(expiryDate).getTime() < startOfDay(new Date()).getTime();
    expiryText = `Expire${expired ? 'd' : 's'} ${format(
      expiryDate,
      LONG_DATE
    )}`;
  }

  return (
    <div ref={scrollRef}>
      <EditPromotionDialog
        open={showEditPromotionDialog}
        close={() => setShowEditPromotionDialog(false)}
        promotion={promotion}
      />
      <ConfirmDialog
        open={showDeleteConfirmDialog}
        cancel={() => setShowDeleteConfirmDialog(false)}
        title='Promotions'
        message={`Are you sure you want to delete "${promotion.title}"?`}
        confirm={deletePromotionHandler}
        loading={loading}
      />
      <Card elevation={2}>
        <CardHeader
          avatar={<Avatar user={user} clickable={true} contactCard={true} />}
          title={user.getFullName()}
          titleTypographyProps={{
            variant: 'body1'
          }}
          subheader={promotion.title}
          action={
            permissions.admins ? (
              <PromotionCardMenu
                promotion={promotion}
                permissions={permissions}
                setShowEditPromotionDialog={setShowEditPromotionDialog}
                setShowDeleteConfirmDialog={setShowDeleteConfirmDialog}
              />
            ) : null
          }
        />
        <CardContent>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <InnerHtml html={promotion.body} />
            </Grid>
            <Grid item>
              <AttachmentsContainer attachments={promotion.attachments} />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
          <Grid container direction='column' spacing={2}>
            <Grid
              item
              container
              justify='space-between'
              alignItems='flex-end'
              wrap='nowrap'
            >
              <Grid item container direction='column' spacing={1}>
                <Grid item>
                  <Typography
                    color='secondary'
                    component='span'
                    variant='body2'
                  >
                    {`Posted on ${format(postDate, LONG_DATE)}`}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    color='secondary'
                    component='span'
                    variant='body2'
                  >
                    {expiryText}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item>
                {promotion.comments.length > 0 ? (
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
            comments={[...promotion.comments].reverse()}
            actionBarNotificationProps={{
              enabled: true
            }}
            commentLikeClickHandler={commentLikeClickHandler}
          />
        </Collapse>
      </Card>
    </div>
  );
});

export default PromotionCard;
