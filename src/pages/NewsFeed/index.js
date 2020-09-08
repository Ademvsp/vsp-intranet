import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as postController from '../../controllers/post';
import { Pagination } from '@material-ui/lab';
import { CircularProgress } from '@material-ui/core';
import PostCard from './PostCard';
import { StyledPageContainer } from '../../utils/styled-components';
import { withRouter } from 'react-router-dom';
import NewPost from './NewPost';

const NewsFeed = withRouter((props) => {
	const initialPage = 1;
	const { match, history } = props;
	const paramsPage = match.params.page;
	const MAX_PER_PAGE = 5;
	const dispatch = useDispatch();
	const { postsCounter } = useSelector((state) => state.dataState);
	const [page, setPage] = useState(initialPage);
	const [postIds, setPostIds] = useState();
	const [searchResults, setSearchResults] = useState();
	const [dataSource, setDataSource] = useState();

	useEffect(() => {
		dispatch(postController.subscribePostsCounterListener());
		return () => {
			dispatch(postController.unsubscribePostsCounter());
		};
	}, [dispatch]);

	useEffect(() => {
		if (postsCounter) {
			let newDataSource = postsCounter.documents;
			if (searchResults) {
				newDataSource = searchResults;
				props.history.push('/newsfeed/1');
			}
			setDataSource(newDataSource);
		}
	}, [postsCounter, searchResults, props.history]);

	useEffect(() => {
		if (paramsPage && postsCounter) {
			const newPage = parseInt(paramsPage);
			if (newPage && newPage < postsCounter.count) {
				setPage(newPage);
			} else {
				history.replace(`/newsfeed/${initialPage}`);
			}
		}
	}, [paramsPage, postsCounter, history]);

	useEffect(() => {
		if (dataSource) {
			const START_INDEX = page * MAX_PER_PAGE - MAX_PER_PAGE;
			const END_INDEX = START_INDEX + MAX_PER_PAGE;
			const newPostIds = dataSource.slice(START_INDEX, END_INDEX);
			setPostIds(newPostIds);
		}
	}, [dataSource, page]);

	if (!postIds) {
		return <CircularProgress />;
	}

	const count = Math.ceil(dataSource.length / MAX_PER_PAGE);

	return (
		<StyledPageContainer>
			<NewPost
				searchResults={searchResults}
				setSearchResults={setSearchResults}
			/>
			{postIds.map((postId) => (
				<PostCard key={postId} postId={postId} />
			))}
			<Pagination
				color='primary'
				count={count}
				page={page}
				onChange={(_event, value) =>
					props.history.push(`/newsfeed/${value.toString()}`)
				}
				showFirstButton={true}
				showLastButton={true}
			/>
		</StyledPageContainer>
	);
});

export default NewsFeed;
