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
import { useHistory, useParams } from 'react-router-dom';
import { READ, UPDATE } from '../../utils/actions';

const JobDocuments = (props) => {
  const { push } = useHistory();
  const params = useParams();
  const { action } = props;
  const [jobDocuments, setJobDocuments] = useState();
  const [selectedJobDocument, setSelectedJobDocument] = useState();
  const [newJobDocumentDialogOpen, setNewJobDocumentDialogOpen] = useState(
    false
  );

  useEffect(() => {
    let jobDocumentsListener = JobDocument.getListener().onSnapshot(
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
    return () => {
      if (jobDocumentsListener) {
        jobDocumentsListener();
      }
    };
  }, []);

  useEffect(() => {
    if (jobDocuments) {
      if (action === READ) {
        setSelectedJobDocument(null);
      } else if (action === UPDATE) {
        const newSelectedJobDocument = jobDocuments.find(
          (jobDocument) => jobDocument.jobDocumentId === params.jobDocumentId
        );
        setSelectedJobDocument(newSelectedJobDocument);
      }
    }
  }, [action, jobDocuments, params.jobDocumentId]);

  return (
    <Fragment>
      <NewJobDocumentDialog
        open={newJobDocumentDialogOpen}
        close={() => setNewJobDocumentDialogOpen(false)}
      />
      {selectedJobDocument && (
        <EditJobDocumentDialog
          open={!!selectedJobDocument}
          close={() => push('/job-documents')}
          jobDocument={selectedJobDocument}
        />
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
        onClick={() => setNewJobDocumentDialogOpen(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
};

export default JobDocuments;
