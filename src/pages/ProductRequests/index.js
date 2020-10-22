import { CircularProgress, Container, Grid } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import * as productRequestController from '../../controllers/product-request';
import CollectionData from '../../models/collection-data';
import { READ_PAGE, READ_PRODUCT_REQUEST } from '../../utils/actions';
import ProductRequestCard from './ProductRequestCard';
import AddIcon from '@material-ui/icons/Add';
import FloatingActionButton from '../../components/FloatingActionButton';
import NewProductRequestDialog from './NewProductRequestDialog';

const ProductRequests = (props) => {
	const dispatch = useDispatch();

	const params = useParams();
	const { authUser } = useSelector((state) => state.authState);
	const { userId } = authUser;
	const { action } = props;
	const { replace, push } = useHistory();

	const initialPage = 1;
	const MAX_PER_PAGE = 5;

	const [collectionData, setCollectionData] = useState();
	const [dataSource, setDataSource] = useState();

	const [page, setPage] = useState(initialPage);
	const [productRequestIds, setProductRequestIds] = useState();
	const [activeRequestId, setActiveRequestId] = useState(null);

	const [
		showNewProductRequestDialog,
		setShowNewProductRequestDialog
	] = useState(false);

	//Mount and dismount
	useEffect(() => {
		let collectionDataListener;
		const asyncFunction = async () => {
			collectionDataListener = (
				await productRequestController.getCollectionDataListener(userId)
			).onSnapshot((snapshot) => {
				let newCollectionData = new CollectionData({
					collection: 'product-requests',
					count: 0,
					documents: []
				});
				if (snapshot.exists) {
					newCollectionData = new CollectionData({
						...snapshot.data(),
						collection: snapshot.id
					});
				}
				setCollectionData(newCollectionData);
			});
		};
		asyncFunction();
		return () => {
			if (collectionDataListener) {
				collectionDataListener();
			}
		};
	}, [dispatch, userId]);
	//If results change or collectionData changes, update the data source
	useEffect(() => {
		if (collectionData) {
			let newDataSource = [...collectionData.documents].reverse();
			setDataSource(newDataSource);
		}
	}, [collectionData]);
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
					replace(`/product-requests/page/${initialPage}`);
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
					replace(`/product-requests/page/${initialPage}`);
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

	const count = Math.ceil(dataSource.length / MAX_PER_PAGE);

	return (
		<Fragment>
			<NewProductRequestDialog
				open={showNewProductRequestDialog}
				close={() => setShowNewProductRequestDialog(false)}
			/>
			<Container disableGutters maxWidth='sm'>
				<Grid container direction='column' spacing={2}>
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
										push(`/product-requests/page/${value.toString()}`)
									}
									showFirstButton={true}
									showLastButton={true}
								/>
							</Grid>
						)}
					</Grid>
				</Grid>
			</Container>
			<FloatingActionButton
				color='primary'
				tooltip='Add Product Request'
				onClick={() => setShowNewProductRequestDialog(true)}
			>
				<AddIcon />
			</FloatingActionButton>
		</Fragment>
	);
};

export default ProductRequests;
