import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as postController from '../../controllers/post';
import { Pagination } from '@material-ui/lab';
import { CircularProgress } from '@material-ui/core';
import PostCard from './PostCard';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import NewPost from './NewPost';
import queryString from 'query-string';
import PageContainer from '../../components/PageContainer';

const NewsFeed = (props) => {
	const params = useParams();
	const history = useHistory();
	const location = useLocation();
	const initialPage = 1;
	const MAX_PER_PAGE = 5;
	const dispatch = useDispatch();
	const { postsCounter } = useSelector((state) => state.dataState);
	const [page, setPage] = useState(initialPage);
	const [searchResults, setSearchResults] = useState();
	const [dataSource, setDataSource] = useState();
	const [postIds, setPostIds] = useState();
	const [activePostId, setActivePostId] = useState(null);

	//Mount and dismount
	useEffect(() => {
		dispatch(postController.subscribePostsCounterListener());
		return () => {
			postController.unsubscribePostsCounter();
		};
	}, [dispatch]);

	//If search results change or postsCounter changes, update the data source
	useEffect(() => {
		if (postsCounter) {
			let newDataSource = postsCounter.documents;
			if (searchResults) {
				newDataSource = searchResults;
			}
			setDataSource(newDataSource);
		}
	}, [postsCounter, searchResults, history, location]);

	//If search results, or clear search results, reset back to page 1
	useEffect(() => {
		// history.replace(`/newsfeed/page/${initialPage}`);
	}, [searchResults, history]);

	//When a new change in the data source is detected
	useEffect(() => {
		if (dataSource) {
			let newPage = initialPage;
			//Coming from direct link
			if (location.pathname === '/newsfeed/post') {
				const { postId } = queryString.parse(location.search);
				const index = dataSource.findIndex((document) => document === postId);
				if (index !== -1) {
					newPage = Math.floor(index / MAX_PER_PAGE) + 1;
					const newActivePostId = postId;
					setActivePostId(newActivePostId);
				} else {
					newPage = initialPage;
					history.replace(`/newsfeed/page/${initialPage}`);
				}
			}
			//Common case
			if (location.pathname.startsWith('/newsfeed/page')) {
				const pageNumber = parseInt(params.page);
				const lastPage = Math.ceil(dataSource.length / MAX_PER_PAGE);
				if (pageNumber > 0 && pageNumber <= lastPage) {
					newPage = pageNumber;
				} else {
					newPage = initialPage;
					history.replace(`/newsfeed/page/${initialPage}`);
				}
			}
			//Slicing the data source to only include 5 results
			const START_INDEX = newPage * MAX_PER_PAGE - MAX_PER_PAGE;
			const END_INDEX = START_INDEX + MAX_PER_PAGE;
			const newPostIds = dataSource.slice(START_INDEX, END_INDEX);
			setPage(newPage);
			setPostIds(newPostIds);
		}
	}, [dataSource, location.pathname, location.search, params.page, history]);

	if (!postIds) {
		return <CircularProgress />;
	}

	const count = Math.ceil(dataSource.length / MAX_PER_PAGE);

	return (
		<PageContainer width={35}>
			<NewPost
				searchResults={searchResults}
				setSearchResults={setSearchResults}
			/>
			{postIds.map((postId) => {
				let scroll = false;
				if (activePostId === postId) {
					scroll = true;
				}
				return (
					<PostCard
						key={postId}
						postId={postId}
						setActivePostId={setActivePostId}
						scroll={scroll}
					/>
				);
			})}
			<Pagination
				color='primary'
				count={count}
				page={page}
				onChange={(_event, value) =>
					history.push(`/newsfeed/page/${value.toString()}`)
				}
				showFirstButton={true}
				showLastButton={true}
			/>
		</PageContainer>
	);
};

export default NewsFeed;
