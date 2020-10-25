import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Pagination } from '@material-ui/lab';
import { CircularProgress, Container, Grid } from '@material-ui/core';
import PostCard from './PostCard';
import { useParams, useHistory } from 'react-router-dom';
import NewPost from './NewPost';
import CollectionData from '../../models/collection-data';
import { READ_PAGE, READ_POST } from '../../utils/actions';

const NewsFeed = (props) => {
	const params = useParams();
	const { action } = props;
	const { replace, push } = useHistory();
	const initialPage = 1;
	const MAX_PER_PAGE = 5;
	const dispatch = useDispatch();
	const [metadata, setMetadata] = useState();

	const [page, setPage] = useState(initialPage);
	const [searchResults, setSearchResults] = useState();
	const [dataSource, setDataSource] = useState();
	const [postIds, setPostIds] = useState();
	const [activePostId, setActivePostId] = useState(null);
	//Mount and dismount
	useEffect(() => {
		let collectionDataListener;
		collectionDataListener = CollectionData.getListener('posts').onSnapshot(
			(snapshot) => {
				const newPostsMetadata = new CollectionData({
					...snapshot.data(),
					collection: snapshot.id
				});
				setMetadata(newPostsMetadata);
			}
		);
		return () => {
			if (collectionDataListener) {
				collectionDataListener();
			}
		};
	}, [dispatch]);
	//If search results change or metadata changes, update the data source
	useEffect(() => {
		if (metadata) {
			let newDataSource = [...metadata.documents].reverse();
			if (searchResults) {
				newDataSource = searchResults;
			}
			setDataSource(newDataSource);
		}
	}, [metadata, searchResults]);
	//When a new change in the data source is detected
	useEffect(() => {
		if (dataSource) {
			let newPage = initialPage;
			if (action === READ_PAGE) {
				//Common case
				const pageNumber = parseInt(params.page);
				const lastPage = Math.ceil(dataSource.length / MAX_PER_PAGE);
				//lastPage === 0, means there are no records
				if ((pageNumber > 0 && pageNumber <= lastPage) || lastPage === 0) {
					newPage = pageNumber;
				} else {
					newPage = initialPage;
					replace(`/newsfeed/page/${initialPage}`);
				}
			} else if (action === READ_POST) {
				//Coming from direct link
				const postId = params.postId;
				const index = dataSource.findIndex((document) => document === postId);
				if (index !== -1) {
					newPage = Math.floor(index / MAX_PER_PAGE) + 1;
					const newActivePostId = postId;
					setActivePostId(newActivePostId);
				} else {
					newPage = initialPage;
					replace(`/newsfeed/page/${initialPage}`);
				}
			}
			//Slicing the data source to only include 5 results
			const START_INDEX = newPage * MAX_PER_PAGE - MAX_PER_PAGE;
			const END_INDEX = START_INDEX + MAX_PER_PAGE;
			const newPostIds = dataSource.slice(START_INDEX, END_INDEX);
			setPage(newPage);
			setPostIds(newPostIds);
		}
	}, [dataSource, action, params, replace]);

	if (!postIds) {
		return <CircularProgress />;
	}

	const count = Math.ceil(dataSource.length / MAX_PER_PAGE);

	return (
		<Container disableGutters maxWidth='sm'>
			<Grid container direction='column' spacing={2}>
				<Grid item>
					<NewPost
						action={props.action}
						searchResults={searchResults}
						setSearchResults={setSearchResults}
					/>
				</Grid>
				<Grid item container direction='column' spacing={2}>
					{postIds.map((postId) => {
						const scroll = activePostId === postId;
						return (
							<Grid item key={postId}>
								<PostCard
									postId={postId}
									setActivePostId={setActivePostId}
									scroll={scroll}
								/>
							</Grid>
						);
					})}
					{dataSource.length > 0 && (
						<Grid item container direction='row' justify='center'>
							<Pagination
								color='primary'
								count={count}
								page={page}
								onChange={(_event, value) =>
									push(`/newsfeed/page/${value.toString()}`)
								}
								showFirstButton={true}
								showLastButton={true}
							/>
						</Grid>
					)}
				</Grid>
			</Grid>
		</Container>
	);
};

export default NewsFeed;
