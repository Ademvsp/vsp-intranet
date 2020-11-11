import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TableCell,
  withTheme
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ActionsBar from '../../../components/ActionsBar';
import columnSchema from './column-schema';
import MaterialTable from 'material-table';
import tableIcons from '../../../utils/table-icons';
import { toCurrency } from '../../../utils/data-transformer';
import { addExpense } from '../../../store/actions/expense-claim';

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
    const newExpenses = values.expenses.map((expense) => ({
      date: expense.date,
      description: expense.description,
      value: expense.value
    }));
    const newValues = { ...values, expenses: newExpenses };
    setLoading(true);
    const result = await dispatch(addExpense(newValues));
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

  const { validateForm } = formik;

  useEffect(() => {
    validateForm();
    setValidatedOnMount(true);
  }, [validateForm]);

  const summaryBackgroundColor = props.theme.palette.background.default;
  const borderRadius = props.theme.spacing(1);

  const totalValue = formik.values.expenses.reduce(
    (previousValue, currentValue) => previousValue + currentValue.value,
    0
  );

  const FlatContainer = (props) => <Paper variant='outlined' {...props} />;
  const SummaryRow = (props) => (
    <Grid
      container
      justify='flex-end'
      style={{
        backgroundColor: summaryBackgroundColor,
        borderBottomRightRadius: borderRadius,
        borderBottomLeftRadius: borderRadius
      }}
    >
      <TableCell variant='body' style={{ borderBottom: 0 }}>
        Total Value:
      </TableCell>
      <TableCell variant='body' style={{ borderBottom: 0 }} align='right'>
        {toCurrency(totalValue, 2)}
      </TableCell>
    </Grid>
  );

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
            actionsColumnIndex: -1
          }}
          components={{
            Container: FlatContainer,
            Pagination: SummaryRow
          }}
          editable={{
            onRowAdd: (newData) =>
              new Promise((resolve, reject) => {
                if (!newData.date || !newData.description || !newData.value) {
                  reject();
                } else {
                  formik.setFieldValue('expenses', [
                    ...formik.values.expenses,
                    newData
                  ]);
                  resolve();
                }
              }),
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                if (!newData.date || !newData.description || !newData.value) {
                  reject();
                } else {
                  const dataUpdate = [...formik.values.expenses];
                  const index = oldData.tableData.id;
                  dataUpdate[index] = {
                    ...newData,
                    date: new Date(newData.date)
                  };
                  formik.setFieldValue('expenses', [...dataUpdate]);
                  resolve();
                }
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
          disabled={loading || !validatedOnMount}
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
