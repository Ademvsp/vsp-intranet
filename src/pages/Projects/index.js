/* eslint-disable react/display-name */
import { Container } from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Project from '../../models/project';
import MaterialTable from 'material-table';
import columnSchema from './column-schema';
import tableColumns from '../../utils/table-icons';
import { useHistory, useParams } from 'react-router-dom';
import { READ, UPDATE } from '../../utils/actions';
import NewProjectDialog from './NewProjectDialog';
import EditProjectDialog from './EditProjectDialog';
import AddIcon from '@material-ui/icons/Add';
import FloatingActionButton from '../../components/FloatingActionButton';

const Projects = (props) => {
  const { push } = useHistory();
  const params = useParams();
  const { action } = props;
  const { authUser } = useSelector((state) => state.authState);
  const { users, usersData } = useSelector((state) => state.dataState);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState();
  const [selectedProject, setSelectedProject] = useState();

  useEffect(() => {
    let projectsListener;
    if (usersData && users) {
      if (users.length === usersData.documents.length) {
        projectsListener = Project.getListener(authUser.userId).onSnapshot(
          (snapshot) => {
            const newProjects = snapshot.docs.map((doc) => {
              const owners = doc
                .data()
                .owners.map((owner) =>
                  users.find((user) => user.userId === owner)
                );
              const metadata = {
                ...doc.data().metadata,
                createdAt: doc.data().metadata.createdAt.toDate(),
                updatedAt: doc.data().metadata.updatedAt.toDate()
              };
              return new Project({
                ...doc.data(),
                projectId: doc.id,
                owners: owners,
                metadata: metadata,
                reminder: doc.data().reminder.toDate()
              });
            });
            setProjects(newProjects);
          }
        );
      }
    }
    return () => {
      if (projectsListener) {
        projectsListener();
      }
    };
  }, [authUser.userId, users, usersData]);

  useEffect(() => {
    if (projects) {
      if (action === READ) {
        setSelectedProject(null);
      } else if (action === UPDATE) {
        const newSelectedProject = projects.find(
          (project) => project.projectId === params.projectId
        );
        setSelectedProject(newSelectedProject);
      }
    }
  }, [action, projects, params.projectId]);

  let data = [];
  if (projects) {
    data = projects.map((project) => {
      const vendors = project.vendors.map((vendor) => vendor.name).join(', ');
      const actions = [...project.actions];
      const action = actions.pop();
      const status = action.actionType;
      return {
        ...project,
        createdAt: project.metadata.createdAt,
        customer: project.customer.name,
        vendors: vendors,
        status: status
      };
    });
  }

  return (
    <Fragment>
      {projects && (
        <NewProjectDialog
          open={newProjectDialogOpen}
          close={() => setNewProjectDialogOpen(false)}
          projectNames={projects.map((project) => project.name)}
        />
      )}
      {selectedProject && projects && (
        <EditProjectDialog
          open={!!selectedProject}
          close={() => push('/projects')}
          projectNames={projects
            .map((project) => project.name)
            .filter((projectName) => projectName !== selectedProject.name)}
          project={selectedProject}
        />
      )}
      <Container disableGutters maxWidth='lg' style={{ height: 500 }}>
        <MaterialTable
          isLoading={!projects}
          icons={tableColumns}
          columns={columnSchema}
          data={data}
          options={{
            showTitle: false,
            paginationType: 'normal',
            minBodyHeight: window.innerHeight / 1.5,
            maxBodyHeight: window.innerHeight / 1.5,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50, 100]
          }}
          onRowClick={(event, rowData) =>
            push(`/projects/${rowData.projectId}`)
          }
        />
      </Container>
      <FloatingActionButton
        color='primary'
        tooltip='Add Project'
        onClick={() => setNewProjectDialogOpen(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
};

export default Projects;
