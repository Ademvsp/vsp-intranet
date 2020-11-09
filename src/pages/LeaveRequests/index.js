import { CircularProgress, Container, Grid } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import CollectionData from '../../models/collection-data';
import { READ_PAGE, READ_LEAVE_REQUEST } from '../../utils/actions';
import AddIcon from '@material-ui/icons/Add';
import FloatingActionButton from '../../components/FloatingActionButton';
import LeaveRequestCard from './LeaveRequestCard';
import NewLeaveRequestDialog from './NewLeaveRequestDialog';
import LeaveRequest from '../../models/leave-request';

const LeaveRequests = (props) => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.authState);
  const { userId } = authUser;

  const params = useParams();
  const { action } = props;
  const { replace, push } = useHistory();

  const initialPage = 1;
  const MAX_PER_PAGE = 5;

  const [collectionData, setCollectionData] = useState();
  const [dataSource, setDataSource] = useState();

  const [page, setPage] = useState(initialPage);
  const [leaveRequestIds, setLeaveRequestIds] = useState();
  const [activeLeaveRequestId, setActiveLeaveRequestId] = useState(null);

  const [permissions, setPermissions] = useState();
  const [showNewLeaveRequestDialog, setShowNewLeaveRequestDialog] = useState(
    false
  );

  //Mount and dismount, get admin status
  useEffect(() => {
    const asyncFunction = async () => {
      const newPermissions = await LeaveRequest.getPermissions();
      setPermissions(newPermissions);
    };
    asyncFunction();
  }, []);
  //Get leave requests based on user
  useEffect(() => {
    let collectionDataListener;
    const asyncFunction = async () => {
      let listenerRef;
      if (permissions.admins) {
        //Get all documents
        listenerRef = CollectionData.getListener('leave-requests');
      } else {
        //Get only documents where the user has ownership
        listenerRef = CollectionData.getNestedListener({
          document: 'leave-requests',
          subCollection: 'users',
          subCollectionDoc: userId
        });
      }
      collectionDataListener = listenerRef.onSnapshot((snapshot) => {
        let newCollectionData = new CollectionData({
          collection: 'leave-requests',
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
    if (permissions !== undefined) {
      asyncFunction();
    }
    return () => {
      if (collectionDataListener) {
        collectionDataListener();
      }
    };
  }, [dispatch, permissions, userId]);
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
          replace(`/leave-requests/page/${initialPage}`);
        }
      } else if (action === READ_LEAVE_REQUEST) {
        //Coming from direct link
        const leaveRequestId = params.leaveRequestId;
        const index = dataSource.findIndex(
          (document) => document === leaveRequestId
        );
        if (index !== -1) {
          newPage = Math.floor(index / MAX_PER_PAGE) + 1;
          const newActiveLeaveRequestId = leaveRequestId;
          setActiveLeaveRequestId(newActiveLeaveRequestId);
        } else {
          newPage = initialPage;
          replace(`/leave-requests/page/${initialPage}`);
        }
      }
      //Slicing the data source to only include 5 results
      const START_INDEX = newPage * MAX_PER_PAGE - MAX_PER_PAGE;
      const END_INDEX = START_INDEX + MAX_PER_PAGE;
      const newLeaveRequestIds = dataSource.slice(START_INDEX, END_INDEX);
      setPage(newPage);
      setLeaveRequestIds(newLeaveRequestIds);
    }
  }, [dataSource, action, params, replace]);

  if (!leaveRequestIds) {
    return <CircularProgress />;
  }

  const count = Math.ceil(dataSource.length / MAX_PER_PAGE);

  return (
    <Fragment>
      <NewLeaveRequestDialog
        open={showNewLeaveRequestDialog}
        close={() => setShowNewLeaveRequestDialog(false)}
      />
      <Container disableGutters maxWidth='sm'>
        <Grid container direction='column' spacing={2}>
          <Grid item container direction='column' spacing={2}>
            {leaveRequestIds.map((leaveRequestId) => {
              const scroll = activeLeaveRequestId === leaveRequestId;
              return (
                <Grid item key={leaveRequestId}>
                  <LeaveRequestCard
                    leaveRequestId={leaveRequestId}
                    setActiveLeaveRequestId={setActiveLeaveRequestId}
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
                    push(`/leave-requests/page/${value.toString()}`)
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
        style={{ zIndex: 100 }}
        color='primary'
        tooltip='Add Leave Request'
        onClick={() => setShowNewLeaveRequestDialog(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
};

export default LeaveRequests;
