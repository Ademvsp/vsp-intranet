import {
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  withTheme
} from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import Resource from '../../models/resource';

const Resources = withTheme((props) => {
  const [permissions, setPermissions] = useState();
  const [resources, setResources] = useState();

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

  // const resourceFolders = resources.map(resource => resource.folder);
  // const folders = [...new Set(resourceFolders)];
  // const groupedResources = folders.map()

  console.log(groupedFolders);

  return (
    <Container disableGutters maxWidth='sm'>
      <Card>
        <CardContent>
          <List>
            {groupedFolders.map((folder, index, array) => (
              <Fragment key={folder.name}>
                <ListItem>
                  <ListItemText primary={folder.name} />
                </ListItem>
                <List disablePadding>
                  {folder.resources.map((resource) => (
                    <ListItem
                      key={resource.name}
                      button
                      style={{ paddingLeft: props.theme.spacing(4) }}
                    >
                      <ListItemText primary={resource.name} />
                    </ListItem>
                  ))}
                </List>
                {index !== array.length - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
});

export default Resources;
