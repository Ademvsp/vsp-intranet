import { CircularProgress, Container, Grid } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import * as productRequestController from '../../controllers/product-request';
import CollectionData from '../../models/collection-data';
import { READ_PAGE, READ_PRODUCT_REQUEST } from '../../utils/actions';
import ProductRequestCard from './ProductRequestCard';

const ProductRequests = (props) => {
	const dispatch = useDispatch();

	const params = useParams();
	const { action } = props;
	const { replace, push } = useHistory();

	const initialPage = 1;
	const MAX_PER_PAGE = 5;

	const [metadata, setMetadata] = useState();
	const [dataSource, setDataSource] = useState();

	const [page, setPage] = useState(initialPage);
	const [productRequestIds, setProductRequestIds] = useState();
	const [activeRequestId, setActiveRequestId] = useState(null);

	const [adminChecked, setAdminChecked] = useState(false);

	useEffect(() => {
		const asyncFunction = async () => {
			const isAdmin = await dispatch(productRequestController.isAdmin());
			console.log(isAdmin);
		};
		asyncFunction();
	}, [dispatch]);

	//Mount and dismount
	useEffect(() => {
		let metadataListener;
		if (adminChecked) {
			metadataListener = productRequestController
				.getMetadataListener()
				.onSnapshot((snapshot) => {
					const newMetaData = new CollectionData({
						...snapshot.data(),
						collection: snapshot.id
					});
					setMetadata(newMetaData);
				});
		}
		return () => {
			if (metadataListener) {
				metadataListener();
			}
		};
	}, [dispatch, adminChecked]);
	//If search results change or metadata changes, update the data source
	useEffect(() => {
		if (metadata) {
			let newDataSource = [...metadata.documents].reverse();
			setDataSource(newDataSource);
		}
	}, [metadata]);
	//When a new change in the data source is detected
	useEffect(() => {
		if (dataSource) {
			let newPage = initialPage;
			if (action === READ_PAGE) {
				//Common case
				const pageNumber = parseInt(params.page);
				const lastPage = Math.ceil(dataSource.length / MAX_PER_PAGE);
				if (pageNumber > 0 && pageNumber <= lastPage) {
					newPage = pageNumber;
				} else {
					newPage = initialPage;
					replace(`/newsfeed/page/${initialPage}`);
				}
			} else if (action === READ_PRODUCT_REQUEST) {
				//Coming from direct link
				const productRequestIds = params.productRequestIds;
				const index = dataSource.findIndex(
					(document) => document === productRequestIds
				);
				if (index !== -1) {
					newPage = Math.floor(index / MAX_PER_PAGE) + 1;
					const newActiveProductRequestId = productRequestIds;
					setActiveRequestId(newActiveProductRequestId);
				} else {
					newPage = initialPage;
					replace(`/newsfeed/page/${initialPage}`);
				}
			}
			//Slicing the data source to only include 5 results
			const START_INDEX = newPage * MAX_PER_PAGE - MAX_PER_PAGE;
			const END_INDEX = START_INDEX + MAX_PER_PAGE;
			const newProductRequestIds = dataSource.slice(START_INDEX, END_INDEX);
			setPage(newPage);
			setProductRequestIds(newProductRequestIds);
		}
	}, [dataSource, action, params, replace]);

	if (!productRequestIds) {
		return <CircularProgress />;
	}

	console.log(productRequestIds);

	const count = Math.ceil(dataSource.length / MAX_PER_PAGE);

	return (
		<Container disableGutters maxWidth='sm'>
			<Grid container direction='column' spacing={2}>
				<Grid item>
					{/* <NewPost
						action={props.action}
						searchResults={searchResults}
						setSearchResults={setSearchResults}
					/> */}
				</Grid>
				<Grid item container direction='column' spacing={2}>
					{productRequestIds.map((productRequestId) => {
						const scroll = activeRequestId === productRequestId;
						return (
							<Grid item key={productRequestId}>
								<ProductRequestCard
									productRequestId={productRequestId}
									setActiveRequestId={setActiveRequestId}
									scroll={scroll}
								/>
								{/* <PostCard
									postId={postId}
									setActivePostId={setActivePostId}
									scroll={scroll}
								/> */}
							</Grid>
						);
					})}
					<Grid item container direction='row' justify='center'>
						<Pagination
							color='primary'
							count={count}
							page={page}
							onChange={(_event, value) =>
								push(`/product-requests/page/${value.toString()}`)
							}
							showFirstButton={true}
							showLastButton={true}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
};

export default ProductRequests;
