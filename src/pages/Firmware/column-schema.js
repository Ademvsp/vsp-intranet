/* eslint-disable react/display-name */
import { SHORT_DATE } from '../../utils/date';
import { format } from 'date-fns';

const columnSchema = [
  {
    field: 'firmwareId',
    title: 'Firmware ID',
    type: 'string',
    hidden: true
  },
  {
    field: 'body',
    title: 'Notes',
    type: 'string',
    hidden: true,
    searchable: true
  },
  {
    field: 'metadata.createdAt',
    title: 'Date',
    type: 'date',
    render: (rowData) => format(rowData.metadata.createdAt, SHORT_DATE)
  },
  {
    field: 'title',
    title: 'Title',
    type: 'string'
  },
  {
    field: 'products',
    title: 'Products Affected',
    type: 'string',
    render: (rowData) => rowData.products.join(', ')
  }
];

export default columnSchema;
