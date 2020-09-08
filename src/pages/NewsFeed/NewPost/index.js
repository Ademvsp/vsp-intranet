import React, { Fragment, useState } from 'react';
import { StyledCard, StyledChip } from '../styled-components';
import { GridFlexGrow } from '../../../utils/styled-components';
import { Grid, CardContent, IconButton, Tooltip } from '@material-ui/core';
import Avatar from '../../../components/Avatar';
import { useSelector } from 'react-redux';
import { Search as SearchIcon, Clear as ClearIcon } from '@material-ui/icons';
import NewPostDialog from './NewPostDialog';
import SearchPostDialog from './SearchPostDialog';

const NewPost = (props) => {
	const { authUser } = useSelector((state) => state.authState);
	const { searchResults, setSearchResults } = props;
	const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
	const [searchPostDialogOpen, setSearchPostDialogOpen] = useState(false);

	return (
		<Fragment>
			<StyledCard elevation={2}>
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
						<GridFlexGrow item>
							<StyledChip
								label='Write a post...'
								variant='outlined'
								onClick={() => setNewPostDialogOpen(true)}
							/>
							<NewPostDialog
								authUser={authUser}
								newPostDialogOpen={newPostDialogOpen}
								setNewPostDialogOpen={setNewPostDialogOpen}
								setSearchResults={setSearchResults}
							/>
						</GridFlexGrow>
						<Grid item>
							{searchResults ? (
								<Tooltip title='Clear search results' placement='bottom'>
									<IconButton onClick={() => setSearchResults(null)}>
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
								searchPostDialogOpen={searchPostDialogOpen}
								setSearchPostDialogOpen={setSearchPostDialogOpen}
								setSearchResults={setSearchResults}
							/>
						</Grid>
					</Grid>
				</CardContent>
			</StyledCard>
		</Fragment>
	);
};

export default NewPost;
