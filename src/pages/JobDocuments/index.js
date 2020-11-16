import { CardContent, Container, Grid, Typography } from '@material-ui/core';
import MaterialTable from 'material-table';
import React, { Fragment, useEffect, useState } from 'react';
import FloatingActionButton from '../../components/FloatingActionButton';
import AddIcon from '@material-ui/icons/Add';
import JobDocument from '../../models/job-document';
import tableColumns from '../../utils/table-icons';
import columnSchema from './column-schema';
import NewJobDocumentDialog from './NewJobDocumentDialog';
import EditJobDocumentDialog from './EditJobDocumentDialog';
import ViewJobDocumentDialog from './ViewJobDocumentDialog';
import { useHistory, useParams } from 'react-router-dom';
import { READ, UPDATE } from '../../utils/actions';
import { useSelector } from 'react-redux';
import AttachmentsContainer from '../../components/AttachmentsContainer';

const JobDocuments = (props) => {
  const { push, replace } = useHistory();
  const params = useParams();
  const { action } = props;
  const { authUser } = useSelector((state) => state.authState);
  const { userId } = authUser;
  const [permissions, setPermissions] = useState();
  const [jobDocuments, setJobDocuments] = useState();
  const [selectedJobDocument, setSelectedJobDocument] = useState();
  const [showAddJobDocumentDialog, setShowAddJobDocumentDialogOpen] = useState(
    false
  );
  const [showEditJobDocumentDialog, setShowEditJobDocumentDialog] = useState(
    false
  );
  const [showViewJobDocumentDialog, setShowViewJobDocumentDialog] = useState(
    false
  );

  useEffect(() => {
    const asyncFunction = async () => {
      const newPermissions = await JobDocument.getPermissions();
      setPermissions(newPermissions);
    };
    asyncFunction();
  }, []);

  useEffect(() => {
    let jobDocumentsListener;
    if (permissions !== undefined) {
      jobDocumentsListener = JobDocument.getListener().onSnapshot(
        (snapshot) => {
          const newJobDocuments = snapshot.docs.map((doc) => {
            const metadata = {
              ...doc.data().metadata,
              createdAt: doc.data().metadata.createdAt.toDate(),
              updatedAt: doc.data().metadata.updatedAt.toDate()
            };
            return new JobDocument({
              ...doc.data(),
              jobDocumentId: doc.id,
              metadata: metadata
            });
          });
          setJobDocuments(newJobDocuments);
        }
      );
    }
    return () => {
      if (jobDocumentsListener) {
        jobDocumentsListener();
      }
    };
  }, [permissions]);

  useEffect(() => {
    if (jobDocuments) {
      if (action === READ) {
        setSelectedJobDocument(null);
      } else if (action === UPDATE) {
        const newSelectedJobDocument = jobDocuments.find(
          (jobDocument) => jobDocument.jobDocumentId === params.jobDocumentId
        );
        if (newSelectedJobDocument) {
          if (permissions.admins || userId === newSelectedJobDocument.user) {
            setShowEditJobDocumentDialog(true);
          } else {
            setShowViewJobDocumentDialog(true);
          }
          setSelectedJobDocument(newSelectedJobDocument);
        } else {
          push('/job-documents');
        }
      }
    }
  }, [action, jobDocuments, params.jobDocumentId, permissions, push, userId]);

  const closeDialogHandler = () => {
    setSelectedJobDocument(null);
    setShowAddJobDocumentDialogOpen(false);
    setShowViewJobDocumentDialog(false);
    setShowEditJobDocumentDialog(false);
    replace('/job-documents');
  };

  return (
    <Fragment>
      <NewJobDocumentDialog
        open={showAddJobDocumentDialog}
        close={closeDialogHandler}
      />
      {selectedJobDocument && (
        <Fragment>
          <EditJobDocumentDialog
            open={showEditJobDocumentDialog}
            close={closeDialogHandler}
            jobDocument={selectedJobDocument}
          />
          <ViewJobDocumentDialog
            open={showViewJobDocumentDialog}
            close={closeDialogHandler}
            jobDocument={selectedJobDocument}
          />
        </Fragment>
      )}
      <Container disableGutters maxWidth='lg'>
        <MaterialTable
          isLoading={!jobDocuments}
          icons={tableColumns}
          columns={columnSchema}
          data={jobDocuments}
          options={{
            showTitle: false,
            paginationType: 'normal',
            minBodyHeight: window.innerHeight / 1.5,
            maxBodyHeight: window.innerHeight / 1.5,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50, 100]
          }}
          onRowClick={(event, rowData) =>
            push(`/job-documents/${rowData.jobDocumentId}`)
          }
          detailPanel={(rowData) => {
            return (
              <CardContent>
                <Grid container direction='column' spacing={1}>
                  {rowData.body && (
                    <Grid item>
                      {rowData.body.split('\n').map((line, index) => {
                        if (!line) {
                          return <br />;
                        }
                        return (
                          <Typography key={`${index}${line}`}>
                            {line}
                          </Typography>
                        );
                      })}
                    </Grid>
                  )}
                  <Grid item>
                    <AttachmentsContainer attachments={rowData.attachments} />
                  </Grid>
                </Grid>
              </CardContent>
            );
          }}
        />
      </Container>
      <FloatingActionButton
        style={{ zIndex: 100 }}
        color='primary'
        tooltip='Add Job Document'
        onClick={() => setShowAddJobDocumentDialogOpen(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
};

export default JobDocuments;
