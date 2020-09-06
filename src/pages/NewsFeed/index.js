import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as threadController from '../../controllers/post';
import { Pagination } from '@material-ui/lab';
import { CircularProgress } from '@material-ui/core';
import PostCard from './PostCard';
// import firebase from '../../utils/firebase';
import { StyledPageContainer } from '../../utils/styled-components';
import { withRouter } from 'react-router-dom';

const NewsFeed = withRouter((props) => {
	const initialPage = 1;
	const { match, history } = props;
	const paramsPage = match.params.page;
	const MAX_PER_PAGE = 5;
	const dispatch = useDispatch();
	const [page, setPage] = useState(initialPage);
	const [postCounter, setPostCounter] = useState();
	const [postIds, setPostIds] = useState();

	useEffect(() => {
		if (paramsPage && postCounter) {
			const newPage = parseInt(paramsPage);
			if (newPage && newPage < postCounter.count) {
				setPage(newPage);
			} else {
				history.replace(`/newsfeed/${initialPage}`);
			}
		}
	}, [paramsPage, postCounter, history]);

	useEffect(() => {
		const asyncFunction = async () => {
			const newPostCounter = await dispatch(threadController.getPostCounter());
			newPostCounter.documents.reverse();
			setPostCounter(newPostCounter);
		};
		asyncFunction();
	}, [dispatch]);

	useEffect(() => {
		const asyncFunction = async () => {
			const START_INDEX = page * MAX_PER_PAGE - MAX_PER_PAGE;
			const END_INDEX = START_INDEX + MAX_PER_PAGE;
			const newPostIds = postCounter.documents.slice(START_INDEX, END_INDEX);
			setPostIds(newPostIds);
		};
		if (postCounter) {
			asyncFunction();
		}
	}, [postCounter, page, dispatch]);

	if (!postIds) {
		return <CircularProgress />;
	}

	return (
		<StyledPageContainer>
			{postIds.map((postId) => (
				<PostCard key={postId} postId={postId} />
			))}
			<Pagination
				color='primary'
				count={Math.ceil(postCounter.count / MAX_PER_PAGE)}
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
