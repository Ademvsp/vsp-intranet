import React, { Fragment, useState } from 'react';
import { StyledChip } from '../styled-components';
import {
  Grid,
  CardContent,
  IconButton,
  Tooltip,
  Card
} from '@material-ui/core';
import Avatar from '../../../components/Avatar';
import { useSelector } from 'react-redux';
import { Search as SearchIcon, Clear as ClearIcon } from '@material-ui/icons';
import NewPostDialog from './NewPostDialog';
import SearchPostDialog from './SearchPostDialog';
import { useHistory } from 'react-router-dom';
import FloatingActionButton from '../../../components/FloatingActionButton';
import AddIcon from '@material-ui/icons/Add';

const NewPost = (props) => {
  const history = useHistory();
  const { authUser } = useSelector((state) => state.authState);
  const { searchResults, setSearchResults } = props;
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [searchPostDialogOpen, setSearchPostDialogOpen] = useState(false);

  const clearResultsHandler = () => {
    setSearchResults(null);
    history.replace('/newsfeed/page/1');
  };

  return (
    <Fragment>
      <Card elevation={2}>
        <CardContent>
          <Grid
            container
            direction='row'
            alignItems='center'
            justify='space-between'
            spacing={1}
          >
            <Grid item>
              <Avatar user={authUser} />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              <StyledChip
                label='Write a post...'
                variant='outlined'
                onClick={() => setNewPostDialogOpen(true)}
              />
              <NewPostDialog
                authUser={authUser}
                open={newPostDialogOpen}
                close={() => setNewPostDialogOpen(false)}
                clearSearchResults={() => setSearchResults(null)}
              />
            </Grid>
            <Grid item>
              {searchResults ? (
                <Tooltip
                  title={`${searchResults.length} Result${
                    searchResults.length === 1 ? '' : 's'
                  }`}
                  placement='bottom'
                >
                  <IconButton onClick={clearResultsHandler}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title='Search' placement='bottom'>
                  <IconButton onClick={() => setSearchPostDialogOpen(true)}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              )}
              <SearchPostDialog
                open={searchPostDialogOpen}
                close={() => setSearchPostDialogOpen(false)}
                setSearchResults={setSearchResults}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <FloatingActionButton
        style={{ zIndex: 100 }}
        color='primary'
        tooltip='New Post'
        onClick={() => setNewPostDialogOpen(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
};

export default NewPost;
