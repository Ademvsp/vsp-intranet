/* eslint-disable react/display-name */
import React from 'react';
import ProjectStatusChip from '../../components/ProjectStatusChip';

const columnSchema = [
	{
		field: 'projectId',
		title: 'Project ID',
		type: 'string',
		hidden: true
	},
	{
		field: 'createdAt',
		title: 'Date',
		type: 'date'
	},
	{
		field: 'name',
		title: 'Name',
		type: 'string'
	},
	{
		field: 'customer',
		title: 'Customer',
		type: 'string'
	},
	{
		field: 'vendors',
		title: 'Vendors',
		type: 'string'
	},
	{
		field: 'status.name',
		title: 'Status',
		type: 'string',
		render: (rowData) => <ProjectStatusChip status={rowData.status} />
	},
	{
		field: 'value',
		title: 'Estimated Value',
		type: 'currency'
	}
];

export default columnSchema;
