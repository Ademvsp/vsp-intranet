import React, { Fragment, useState } from 'react';
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
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const Comments = (props) => {
  const {
    comments,
    submitHandler,
    actionBarNotificationProps,
    commentLikeClickHandler,
    collection
  } = props;
  const [sortNewest, setSortNewest] = useState(true);

  let sortedComments = [...comments];
  if (!sortNewest) {
    sortedComments.sort((a, b) =>
      a.metadata.createdAt > b.metadata.createdAt ? 1 : -1
    );
  }

  return (
    <CardContent>
      <Grid container direction='column'>
        <Grid item>
          <NewComment
            collection={collection}
            submitHandler={submitHandler}
            actionBarNotificationProps={actionBarNotificationProps}
            resetSort={() => setSortNewest(true)}
          />
        </Grid>
        <Grid item>
          {comments.length > 0 ? (
            <Button
              style={{ textTransform: 'unset' }}
              size='small'
              endIcon={<ArrowDropDownIcon />}
              color='secondary'
              onClick={() => setSortNewest((prevState) => !prevState)}
            >
              {`${sortNewest ? 'New' : 'Old'}est Comments`}
            </Button>
          ) : null}
        </Grid>
        <Grid item>
          <List>
            {sortedComments.map((comment, index) => {
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
