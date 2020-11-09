/* eslint-disable react/display-name */
import React from 'react';
import { Chip, Grid } from '@material-ui/core';
import Avatar from '../../../components/Avatar';

const columnSchema = [
  {
    field: 'collection',
    title: 'Collection',
    type: 'string'
  },
  {
    field: 'group',
    title: 'Group',
    type: 'string'
  },
  {
    field: 'membersFullNames',
    title: 'Members',
    type: 'string',
    render: (rowData) => (
      <Grid item container spacing={1} alignItems='center'>
        {rowData.members.map((member) => (
          <Grid item key={member.userId}>
            <Chip
              color='secondary'
              avatar={<Avatar user={member} />}
              label={member.getFullName()}
              variant='outlined'
            />
          </Grid>
        ))}
      </Grid>
    )
  }
];

export default columnSchema;
