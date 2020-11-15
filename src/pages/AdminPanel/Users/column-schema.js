/* eslint-disable react/display-name */
import React from 'react';
import {
  Checkbox,
  Grid,
  ListItemAvatar,
  ListItemText
} from '@material-ui/core';
import Avatar from '../../../components/Avatar';

const columnSchema = [
  {
    field: 'userId',
    title: 'User ID',
    type: 'string',
    hidden: true,
    searchable: true
  },
  {
    field: 'active',
    title: 'Active',
    type: 'boolean',
    render: (rowData) => <Checkbox checked={rowData.active} />
  },
  {
    field: 'fullName',
    title: 'Name',
    type: 'string',
    render: (rowData) => (
      <Grid item container alignItems='center'>
        <Grid item>
          <ListItemAvatar>
            <Avatar user={rowData} />
          </ListItemAvatar>
        </Grid>
        <Grid item>
          <ListItemText primary={rowData.fullName} />
        </Grid>
      </Grid>
    )
  },
  {
    field: 'email',
    title: 'Email',
    type: 'string'
  },
  {
    field: 'managerFullName',
    title: 'Manager',
    type: 'string'
  }
];

export default columnSchema;
