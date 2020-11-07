import { Grid, Paper, TableCell, withTheme } from '@material-ui/core';
import React from 'react';
import MaterialTable from 'material-table';
import tableIcons from '../../../../utils/table-icons';
import columnSchema from './column-schema';
import { toCurrency } from '../../../../utils/data-transformer';

const ExpenseClaimForm = withTheme((props) => {
  const { expenseClaim } = props;

  const summaryBackgroundColor = props.theme.palette.background.default;
  const borderRadius = props.theme.spacing(1);

  const totalValue = expenseClaim.expenses.reduce(
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
    <MaterialTable
      isLoading={!expenseClaim}
      icons={tableIcons}
      columns={columnSchema}
      data={expenseClaim.expenses}
      options={{
        search: false,
        showTitle: false,
        toolbar: false,
        maxBodyHeight: props.theme.spacing(60),
        pageSize: expenseClaim.expenses.length,
        headerStyle: {
          borderTopRightRadius: borderRadius,
          borderTopLeftRadius: borderRadius
        }
      }}
      components={{
        Container: FlatContainer,
        Pagination: SummaryRow
      }}
    />
  );
});

export default ExpenseClaimForm;
