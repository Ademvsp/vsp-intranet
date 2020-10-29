import { SHORT_DATE } from '../../../utils/date';
import { format } from 'date-fns';
import * as yup from 'yup';

const columnSchema = [
	{
		field: 'date',
		title: 'Date Purchased',
		type: 'date',
		render: (rowData) => format(rowData.date, SHORT_DATE),
		validate: (rowData) => {
			try {
				yup.date().required().max(new Date()).validateSync(rowData.date);
				return true;
			} catch {
				return false;
			}
		}
	},
	{
		field: 'description',
		title: 'Description',
		type: 'string',
		validate: (rowData) => {
			try {
				yup.string().required().validateSync(rowData.description);
				return true;
			} catch {
				return false;
			}
		}
	},
	{
		field: 'value',
		title: 'Receipt Value',
		type: 'currency',
		validate: (rowData) => {
			try {
				yup.number().required().min(1).max(100000).validateSync(rowData.value);
				return true;
			} catch {
				return false;
			}
		}
	}
];

export default columnSchema;
