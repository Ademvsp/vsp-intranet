import React, { Fragment, useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import {
  Box,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  withTheme
} from '@material-ui/core';
import tableIcons from '../../utils/table-icons';
import {
  columnSchema,
  detailPanelHandler,
  initialValues,
  presets
} from './table-data';
import { toPercentage } from '../../utils/data-transformer';
import EditDayDialog from './EditDayDialog';

const MotionCalculator = withTheme((props) => {
  const [result, setResult] = useState();
  const [motionValues, setMotionValues] = useState(initialValues);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [selectedDay, setSelectedDay] = useState();

  useEffect(() => {
    if (selectedPreset) {
      setMotionValues(selectedPreset.days);
    }
  }, [selectedPreset]);

  useEffect(() => {
    const dayAverages = motionValues.map(
      (motionValue) =>
        motionValue.values.reduce(
          (previousValue, currentValue) => previousValue + currentValue
        ) / motionValue.values.length
    );
    const minimum = Math.min(...dayAverages);
    const maximum = Math.max(...dayAverages);
    const average =
      dayAverages.reduce(
        (previousValue, currentValue) => previousValue + currentValue
      ) / dayAverages.length;
    setResult({ minimum, maximum, average });
  }, [motionValues]);

  const editDayHandler = (motionValue) => {
    const dayIndex = motionValues.findIndex(
      (mv) => mv.tableData.id === motionValue.tableData.id
    );
    const newMotionValues = [...motionValues];
    newMotionValues.splice(dayIndex, 1, motionValue);
    setMotionValues(newMotionValues);
  };

  return (
    <Fragment>
      {selectedDay && (
        <EditDayDialog
          open={!!selectedDay}
          close={() => setSelectedDay(null)}
          day={selectedDay}
          editDayHandler={editDayHandler}
        />
      )}
      <Container disableGutters maxWidth='lg'>
        <Grid container direction='column' spacing={2}>
          <Grid item>
            <MaterialTable
              icons={tableIcons}
              columns={columnSchema}
              data={motionValues}
              options={{
                showTitle: true,
                toolbar: true,
                search: false,
                paging: false,
                minBodyHeight: props.theme.spacing(30),
                maxBodyHeight: props.theme.spacing(60),
                actionsColumnIndex: -1
              }}
              onRowClick={(event, rowData) => setSelectedDay(rowData)}
              detailPanel={detailPanelHandler}
              title={
                <TextField
                  style={{ width: 200 }}
                  fullWidth
                  label='Presets'
                  select
                  value={selectedPreset}
                  onChange={(event) => setSelectedPreset(event.target.value)}
                >
                  {[...presets]
                    .sort((a, b) =>
                      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
                    )
                    .map((preset) => (
                      <MenuItem key={preset.name} value={preset}>
                        {preset.name}
                      </MenuItem>
                    ))}
                </TextField>
              }
            />
          </Grid>
          <Grid item container direction='column' alignItems='flex-end'>
            <Box width={'35%'}>
              <Paper variant='outlined'>
                <CardHeader title='Summary' style={{ paddingBottom: 0 }} />
                <CardContent>
                  <Grid container direction='column' spacing={1}>
                    <Grid item container justify='space-between'>
                      <Typography>Minimum</Typography>
                      <Typography>
                        {toPercentage(result?.minimum, 2)}
                      </Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Maximum</Typography>
                      <Typography>
                        {toPercentage(result?.maximum, 2)}
                      </Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Average</Typography>
                      <Typography>
                        {toPercentage(result?.average, 2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Fragment>
  );
});

export default MotionCalculator;
