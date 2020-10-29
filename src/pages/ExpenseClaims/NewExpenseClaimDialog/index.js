import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	MenuItem,
	TextField,
	withTheme
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import leaveTypes from '../../../data/leave-types';
import ActionsBar from '../../../components/ActionsBar';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { LONG_DATE } from '../../../utils/date';
import { isAfter } from 'date-fns';
import { addLeaveRequest } from '../../../store/actions/leave-request';
import columnSchema from './column-schema';
import MaterialTable from 'material-table';
import tableIcons from '../../../utils/table-icons';

const NewExpenseClaimDialog = withTheme((props) => {
	const dispatch = useDispatch();

	const { open, close } = props;
	const [loading, setLoading] = useState();
	const [validatedOnMount, setValidatedOnMount] = useState(false);

	const validationSchema = yup.object().shape({
		attachments: yup.array().required().min(1),
		expenses: yup.array().required().min(1)
	});

	const initialValues = {
		attachments: [],
		expenses: []
	};

	const dialogCloseHandler = () => {
		if (!loading) {
			close();
		}
	};

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await dispatch(addLeaveRequest(values));
		setLoading(false);
		if (result) {
			formik.setValues(initialValues);
			close();
		}
	};

	const formik = useFormik({
		initialValues: initialValues,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	const { validateForm, setFieldValue, values } = formik;
	const { start, end } = values;
	//Add 1 hour if end date is set to less than start date
	useEffect(() => {
		if (isAfter(start, end)) {
			setFieldValue('end', start);
		}
	}, [start, end, setFieldValue]);

	useEffect(() => {
		validateForm();
		setValidatedOnMount(true);
	}, [validateForm]);

	return (
		<Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
			<DialogTitle>New Expense Claim</DialogTitle>
			<DialogContent>
				<MaterialTable
					columns={columnSchema}
					data={formik.values.expenses}
					icons={tableIcons}
					options={{
						search: false,
						showTitle: false,
						paging: false,
						pageSize: formik.values.expenses.length
					}}
					editable={{
						onRowAdd: (newData) =>
							new Promise((resolve, _reject) => {
								formik.setFieldValue('expenses', [
									...formik.values.expenses,
									newData
								]);
								resolve();
							}),
						onRowUpdate: (newData, oldData) =>
							new Promise((resolve, _reject) => {
								const dataUpdate = [...formik.values.expenses];
								const index = oldData.tableData.id;
								dataUpdate[index] = {
									...newData,
									date: new Date(newData.date)
								};
								formik.setFieldValue('expenses', [...dataUpdate]);
								resolve();
							}),
						onRowDelete: (oldData) =>
							new Promise((resolve, _reject) => {
								const dataDelete = [...formik.values.expenses];
								const index = oldData.tableData.id;
								dataDelete.splice(index, 1);
								formik.setFieldValue('expenses', [...dataDelete]);
								resolve();
							})
					}}
				/>
			</DialogContent>
			<DialogActions>
				<ActionsBar
					attachments={{
						enabled: true,
						attachments: formik.values.attachments,
						setAttachments: (attachments) =>
							formik.setFieldValue('attachments', attachments),
						emptyTooltip: 'You must attach at least one receipt'
					}}
					notifications={{
						enabled: true,
						readOnly: true,
						tooltip: 'Your manager will be notified automatically'
					}}
					buttonLoading={loading}
					loading={loading || !validatedOnMount}
					isValid={formik.isValid}
					onClick={formik.handleSubmit}
					tooltipPlacement='top'
					actionButtonText='Submit'
				/>
			</DialogActions>
		</Dialog>
	);
});

export default NewExpenseClaimDialog;
