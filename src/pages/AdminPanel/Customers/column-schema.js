/* eslint-disable react/display-name */
import { format } from 'date-fns';
import { SHORT_DATE } from '../../../utils/date';

const columnSchema = [
  {
    field: 'metadata.createdAt',
    title: 'Creation Date',
    type: 'date',
    render: (rowData) => format(rowData.metadata.createdAt.toDate(), SHORT_DATE)
  },
  {
    field: 'customerId',
    title: 'Customer ID',
    type: 'string'
  },
  {
    field: 'sourceId',
    title: 'Source ID',
    type: 'string'
  },
  {
    field: 'name',
    title: 'Name',
    type: 'string'
  }
];

export default columnSchema;
