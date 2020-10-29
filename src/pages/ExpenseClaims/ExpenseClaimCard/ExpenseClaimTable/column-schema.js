import { SHORT_DATE } from '../../../../utils/date';
import { format } from 'date-fns';

const columnSchema = [
	{
		field: 'date',
		title: 'Date',
		type: 'date',
		render: (rowData) => format(rowData.date, SHORT_DATE)
	},
	{
		field: 'description',
		title: 'Description',
		type: 'string'
	},
	{
		field: 'value',
		title: 'Estimated Value',
		type: 'currency'
	}
];

export default columnSchema;
