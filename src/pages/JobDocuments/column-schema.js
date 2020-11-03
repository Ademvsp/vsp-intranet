/* eslint-disable react/display-name */
import { SHORT_DATE } from '../../utils/date';
import { format } from 'date-fns';

const columnSchema = [
  {
    field: 'jobDocumentId',
    title: 'Job Document ID',
    type: 'string',
    hidden: true
  },
  {
    field: 'metadata.createdAt',
    title: 'Date',
    type: 'date',
    render: (rowData) => format(rowData.metadata.createdAt, SHORT_DATE)
  },
  {
    field: 'salesOrder',
    title: 'Sales Order',
    type: 'string'
  },
  {
    field: 'customer.name',
    title: 'Customer',
    type: 'string'
  },
  {
    field: 'siteReference',
    title: 'Site Reference',
    type: 'string'
  }
];

export default columnSchema;
