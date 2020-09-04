import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as threadController from '../../controllers/post';
import { Pagination } from '@material-ui/lab';
import { CircularProgress } from '@material-ui/core';
import PostCard from './PostCard';
// import firebase from '../../utils/firebase';
import { StyledPageContainer } from '../../utils/styled-components';

const NewsFeed = (props) => {
	const MAX_PER_PAGE = 5;
	const dispatch = useDispatch();
	const [page, setPage] = useState(1);
	const [postCounter, setPostCounter] = useState();
	const [postIds, setPostIds] = useState();

	useEffect(() => {
		const asyncFunction = async () => {
			const newThreadCounter = await dispatch(
				threadController.getPostCounter()
			);
			newThreadCounter.documents.reverse();
			setPostCounter(newThreadCounter);
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
				onChange={(_event, value) => setPage(value)}
				showFirstButton={true}
				showLastButton={true}
			/>
		</StyledPageContainer>
	);
};

export default NewsFeed;
