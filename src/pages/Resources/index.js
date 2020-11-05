import {
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  withTheme
} from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import Resource from '../../models/resource';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import LanguageIcon from '@material-ui/icons/Language';
import FloatingActionButton from '../../components/FloatingActionButton';
import AddIcon from '@material-ui/icons/Add';
import NewResrouceDialog from './NewResourceDialog';
import EditResourceDialog from './EditResourceDialog';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { useDispatch } from 'react-redux';
import ConfirmDialog from '../../components/ConfirmDialog';
import { deleteResource } from '../../store/actions/resource';

const Resources = withTheme((props) => {
  const dispatch = useDispatch();
  const [permissions, setPermissions] = useState();
  const [resources, setResources] = useState();
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [showEditResourceDialog, setShowEditResourceDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState();
  const [loading, setLoading] = useState(false);

  const closeDialogHandler = () => {
    setShowNewResourceDialog(false);
    setShowEditResourceDialog(false);
    setShowDeleteConfirmDialog(false);
    setSelectedResource(null);
  };

  const deleteClickHandler = (resource) => {
    setSelectedResource(resource);
    setShowDeleteConfirmDialog(true);
  };

  const deleteHandler = async () => {
    setLoading(true);
    const result = await dispatch(deleteResource(selectedResource));
    if (result) {
      closeDialogHandler();
    }
    setLoading(false);
  };

  const editClickHandler = (resource) => {
    setSelectedResource(resource);
    setShowEditResourceDialog(true);
  };

  useEffect(() => {
    const asyncFunction = async () => {
      const admin = await Resource.isAdmin();
      setPermissions({ admin: admin });
    };
    asyncFunction();
  }, []);

  useEffect(() => {
    let resourcesListener;
    if (permissions !== undefined) {
      resourcesListener = Resource.getListener().onSnapshot((snapshot) => {
        const newResources = snapshot.docs.map((doc) => {
          const metadata = {
            ...doc.data().metadata,
            createdAt: doc.data().metadata.createdAt.toDate(),
            updatedAt: doc.data().metadata.updatedAt.toDate()
          };
          return new Resource({
            ...doc.data(),
            resourceId: doc.id,
            metadata: metadata
          });
        });
        setResources(newResources);
      });
    }
    return () => {
      if (resourcesListener) {
        resourcesListener();
      }
    };
  }, [permissions]);

  if (!resources) {
    return <CircularProgress />;
  }

  const groupedFolders = [];
  for (const resource of resources) {
    const indexOfGroupedFolder = groupedFolders.findIndex(
      (folder) => folder.name === resource.folder
    );
    if (indexOfGroupedFolder !== -1) {
      groupedFolders[indexOfGroupedFolder].resources.push(resource);
    } else {
      groupedFolders.push({
        name: resource.folder,
        resources: [resource]
      });
    }
  }

  return (
    <Fragment>
      <NewResrouceDialog
        open={showNewResourceDialog}
        close={closeDialogHandler}
        folders={groupedFolders.map((folder) => folder.name)}
      />
      {!!selectedResource && (
        <Fragment>
          <ConfirmDialog
            open={showDeleteConfirmDialog}
            cancel={closeDialogHandler}
            title='Confirm Deletion'
            message={`Are you sure you want to delete "${selectedResource.name}"?`}
            confirm={deleteHandler}
            loading={loading}
          />
          <EditResourceDialog
            open={showEditResourceDialog}
            close={closeDialogHandler}
            resource={selectedResource}
            folders={groupedFolders.map((folder) => folder.name)}
          />
        </Fragment>
      )}
      <Container disableGutters maxWidth='md'>
        <Card>
          <CardContent>
            <List>
              {groupedFolders.map((folder, index, array) => {
                //Sort the resource names. Firebase sort separates lower and uppercase as separate entities
                const sortedResources = [...folder.resources].sort((a, b) =>
                  a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
                );
                return (
                  <Fragment key={folder.name}>
                    <ListItem>
                      <ListItemIcon>
                        <FolderOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary={folder.name} />
                    </ListItem>
                    <List disablePadding>
                      {sortedResources.map((resource) => (
                        <ListItem
                          key={resource.name}
                          button
                          style={{ paddingLeft: props.theme.spacing(4) }}
                          component='a'
                          href={resource.link}
                          target='_blank'
                        >
                          <ListItemIcon>
                            <LanguageIcon />
                          </ListItemIcon>
                          <ListItemText primary={resource.name} />
                          {permissions.admin && (
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={editClickHandler.bind(this, resource)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={deleteClickHandler.bind(
                                  this,
                                  resource
                                )}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      ))}
                    </List>
                    {index !== array.length - 1 && <Divider />}
                  </Fragment>
                );
              })}
            </List>
          </CardContent>
        </Card>
      </Container>
      {permissions.admin && (
        <FloatingActionButton
          color='primary'
          tooltip='Add Resource'
          onClick={() => setShowNewResourceDialog(true)}
        >
          <AddIcon />
        </FloatingActionButton>
      )}
    </Fragment>
  );
});

export default Resources;
