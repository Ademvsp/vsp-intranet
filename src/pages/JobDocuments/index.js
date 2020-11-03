import { Container } from '@material-ui/core';
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
      const admin = await JobDocument.isAdmin();
      setPermissions({ admin: admin });
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
          if (permissions.admin || userId === newSelectedJobDocument.user) {
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
      {/* <NewProjectDialog
      open={newProjectDialogOpen}
      close={() => setNewProjectDialogOpen(false)}
      projectNames={projects.map((project) => project.name)}
    />
     */}
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
        />
      </Container>
      <FloatingActionButton
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
