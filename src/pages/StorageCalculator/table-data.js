import { toDecimal, toPercentage } from '../../utils/data-transformer';
import tableIcons from '../../utils/table-icons';
import {
  CardContent,
  Grid,
  TableBody,
  TableCell,
  TableRow
} from '@material-ui/core';
import React from 'react';

export const columnSchema = [
  {
    field: 'quantity',
    title: 'Quantity',
    type: 'numeric',
    align: 'center'
  },
  {
    field: 'resolution',
    title: 'Resolution',
    type: 'string',
    align: 'center'
  },
  {
    field: 'frameRate',
    title: 'Frame Rate',
    type: 'numeric',
    render: (rowData) => `${rowData.frameRate} fps`,
    align: 'center'
  },
  {
    field: 'compression',
    title: 'Compression',
    type: 'string',
    align: 'center'
  },
  {
    field: 'motion',
    title: 'Motion',
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.motion),
    align: 'center'
  },
  {
    field: 'bitrate',
    title: 'Birate',
    type: 'numeric',
    render: (rowData) => `${toDecimal(rowData.bitrate, 2)} Mbps`,
    align: 'center'
  },
  {
    field: 'storage',
    title: 'Storage',
    type: 'numeric',
    render: (rowData) => `${toDecimal(rowData.storage, 2)} TB`,
    align: 'center'
  }
];

export const detailsPanelHandler = (rowData) => {
  const bitrateTotal = rowData.bitrate * rowData.quantity;
  const storageTotal = rowData.storage * rowData.quantity;
  const bitrateText = `${toDecimal(bitrateTotal, 2)} Mbps`;
  const storageText = `${toDecimal(storageTotal, 2)} TB`;
  return (
    <CardContent>
      <Grid container direction='column' alignItems='flex-end'>
        <TableBody>
          <TableRow>
            <TableCell align='right'>Bitrate Total</TableCell>
            <TableCell align='right'>{bitrateText}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Storage Total</TableCell>
            <TableCell align='right'>{storageText}</TableCell>
          </TableRow>
        </TableBody>
      </Grid>
    </CardContent>
  );
};
