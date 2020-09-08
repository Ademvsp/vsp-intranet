import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as postController from '../../controllers/post';
import { Pagination } from '@material-ui/lab';
import { CircularProgress } from '@material-ui/core';
import PostCard from './PostCard';
// import firebase from '../../utils/firebase';
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
	// const [postsCounter, setpostsCounter] = useState();
	const [postIds, setPostIds] = useState();

	useEffect(() => {
		dispatch(postController.subscribePostsCounterListener());
		return () => {
			dispatch(postController.unsubscribePostsCounter());
		};
	}, [dispatch]);

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
		const asyncFunction = async () => {
			const START_INDEX = page * MAX_PER_PAGE - MAX_PER_PAGE;
			const END_INDEX = START_INDEX + MAX_PER_PAGE;
			const newPostIds = postsCounter.documents.slice(START_INDEX, END_INDEX);
			setPostIds(newPostIds);
		};
		if (postsCounter) {
			asyncFunction();
		}
	}, [postsCounter, page, dispatch]);

	if (!postIds) {
		return <CircularProgress />;
	}

	return (
		<StyledPageContainer>
			<NewPost />
			{postIds.map((postId) => (
				<PostCard key={postId} postId={postId} />
			))}
			<Pagination
				color='primary'
				count={Math.ceil(postsCounter.count / MAX_PER_PAGE)}
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
