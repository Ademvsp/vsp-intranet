import React, { Fragment } from 'react';
import {
  List,
  Divider,
  Button,
  Grid,
  CardContent,
  ListItem
} from '@material-ui/core';
import Comment from './Comment';
import NewComment from './NewComment';
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';

const Comments = (props) => {
  const {
    comments,
    submitHandler,
    actionBarNotificationProps,
    commentLikeClickHandler
  } = props;
  return (
    <CardContent>
      <Grid container direction='column'>
        <Grid item>
          <NewComment
            submitHandler={submitHandler}
            actionBarNotificationProps={actionBarNotificationProps}
          />
        </Grid>
        <Grid item>
          {comments.length > 0 ? (
            <Button
              style={{ textTransform: 'unset' }}
              size='small'
              endIcon={<ArrowDropDownIcon />}
              color='secondary'
            >
              Newest Comments
            </Button>
          ) : null}
        </Grid>
        <Grid item>
          <List>
            {comments.map((comment, index) => {
              return (
                <Fragment
                  key={comment.metadata.createdAt.toDate().getTime().toString()}
                >
                  {index > 0 ? <Divider variant='middle' light={true} /> : null}
                  <ListItem>
                    <Comment
                      comment={comment}
                      commentLikeClickHandler={() =>
                        commentLikeClickHandler(index)
                      }
                    />
                  </ListItem>
                </Fragment>
              );
            })}
          </List>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default Comments;
