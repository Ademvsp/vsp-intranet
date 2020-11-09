import { CircularProgress, Container, Grid } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import CollectionData from '../../models/collection-data';
import Promotion from '../../models/promotion';
import { READ_PAGE, READ_PROMOTION } from '../../utils/actions';
import AddIcon from '@material-ui/icons/Add';
import FloatingActionButton from '../../components/FloatingActionButton';
import PromotionCard from './PromotionCard';
import NewPromotionDialog from './NewPromotionDialog';

const Promotions = (props) => {
  const initialPage = 1;
  const MAX_PER_PAGE = 5;

  const { replace, push } = useHistory();
  const params = useParams();
  const { action } = props;

  const dispatch = useDispatch();

  const [collectionData, setCollectionData] = useState();
  const [page, setPage] = useState(initialPage);
  const [dataSource, setDataSource] = useState();
  const [promotionIds, setPromotionIds] = useState();
  const [activePromotionId, setActivePromotionId] = useState(null);
  const [showNewPromotionDialog, setShowNewPromotionDialog] = useState(false);
  const [permissions, setPermissions] = useState();

  //Mount and dismount, get admin status
  useEffect(() => {
    const asyncFunction = async () => {
      const newPermissions = await Promotion.getPermissions();
      setPermissions(newPermissions);
    };
    asyncFunction();
  }, []);
  //Effect after checking permissions
  useEffect(() => {
    let collectionDataListener;
    if (permissions !== undefined) {
      collectionDataListener = CollectionData.getListener(
        'promotions'
      ).onSnapshot((snapshot) => {
        const newPostsCollectionData = new CollectionData({
          ...snapshot.data(),
          collection: snapshot.id
        });
        setCollectionData(newPostsCollectionData);
      });
    }
    return () => {
      if (collectionDataListener) {
        collectionDataListener();
      }
    };
  }, [dispatch, permissions]);
  //If collectionData changes, update the data source
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
          replace(`/promotions/page/${initialPage}`);
        }
      } else if (action === READ_PROMOTION) {
        //Coming from direct link
        const promotionId = params.promotionId;
        const index = dataSource.findIndex(
          (document) => document === promotionId
        );
        if (index !== -1) {
          newPage = Math.floor(index / MAX_PER_PAGE) + 1;
          const newPromotionId = promotionId;
          setActivePromotionId(newPromotionId);
        } else {
          newPage = initialPage;
          replace(`/promotions/page/${initialPage}`);
        }
      }
      //Slicing the data source to only include 5 results
      const START_INDEX = newPage * MAX_PER_PAGE - MAX_PER_PAGE;
      const END_INDEX = START_INDEX + MAX_PER_PAGE;
      const newPromotionIds = dataSource.slice(START_INDEX, END_INDEX);
      setPage(newPage);
      setPromotionIds(newPromotionIds);
    }
  }, [dataSource, action, params, replace]);

  if (!promotionIds) {
    return <CircularProgress />;
  }

  const count = Math.ceil(dataSource.length / MAX_PER_PAGE);

  return (
    <Fragment>
      <NewPromotionDialog
        open={showNewPromotionDialog}
        close={() => setShowNewPromotionDialog(false)}
      />
      <Container disableGutters maxWidth='sm'>
        <Grid container direction='column' spacing={2}>
          <Grid item container direction='column' spacing={2}>
            {promotionIds.map((promotionId) => {
              const scroll = activePromotionId === promotionId;
              return (
                <Grid item key={promotionId}>
                  <PromotionCard
                    promotionId={promotionId}
                    setActivePromotionId={setActivePromotionId}
                    scroll={scroll}
                    permissions={permissions}
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
                    push(`/promotions/page/${value.toString()}`)
                  }
                  showFirstButton={true}
                  showLastButton={true}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
      {permissions?.admins && (
        <FloatingActionButton
          style={{ zIndex: 100 }}
          color='primary'
          tooltip='Add Promotion'
          onClick={() => setShowNewPromotionDialog(true)}
        >
          <AddIcon />
        </FloatingActionButton>
      )}
    </Fragment>
  );
};

export default Promotions;
