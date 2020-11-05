import React, { Fragment, useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  withTheme
} from '@material-ui/core';
import tableIcons from '../../utils/table-icons';
import { actions, detailsPanelHandler, columnSchema } from './table-data';
import FloatingActionButton from '../../components/FloatingActionButton';
import AddIcon from '@material-ui/icons/Add';
import { toDecimal, toPercentage } from '../../utils/data-transformer';
import AddCamerasDialog from './AddCamerasDialog';

const StorageCalculator = withTheme((props) => {
  const [showAddCamerasDialog, setShowAddCamerasDialog] = useState(false);
  const [overhead, setOverhead] = useState(0);
  const [result, setResult] = useState();
  const [cameraGroups, setCameraGroups] = useState([
    {
      quantity: 1,
      resolution: '6MP',
      frameRate: 12,
      compression: 'H.265',
      motion: 50,
      bitrate: 5.4,
      bitrateTotal: 10.8,
      storage: 10,
      storageTotal: 20
    }
  ]);

  useEffect(() => {
    const newResult = cameraGroups.reduce(
      (previousValue, currentValue) => {
        const overheadDecimal = overhead / 100;
        const bitrateOverhead = currentValue.bitrate * overheadDecimal;
        const storageOvherhead = currentValue.storage * overheadDecimal;
        return {
          quantity: previousValue.quantity + currentValue.quantity,
          bitrate:
            previousValue.bitrate + currentValue.bitrate + bitrateOverhead,
          storage:
            previousValue.storage + currentValue.storage + storageOvherhead
        };
      },
      { quantity: 0, bitrate: 0, storage: 0 }
    );
    setResult(newResult);
  }, [cameraGroups, overhead]);

  const deleteClickHandler = (rowData) => {
    const newCameraGroup = [...cameraGroups];
    newCameraGroup.splice(rowData.tableData.id, 1);
    setCameraGroups(newCameraGroup);
  };

  const editClickHandler = (rowData) => console.log(rowData.cameraGroups);

  const duplicateClickHandler = (rowData) => {
    const newRowData = { ...rowData };
    delete newRowData.cameraGroups;
    const newCameraGroup = [...cameraGroups, newRowData];
    setCameraGroups(newCameraGroup);
  };

  return (
    <Fragment>
      <AddCamerasDialog
        open={showAddCamerasDialog}
        close={() => setShowAddCamerasDialog(false)}
      />
      <Container disableGutters maxWidth='lg'>
        <Grid container direction='column' spacing={2}>
          <Grid item>
            <MaterialTable
              icons={tableIcons}
              columns={columnSchema}
              data={cameraGroups}
              options={{
                showTitle: false,
                search: false,
                toolbar: false,
                paging: false,
                minBodyHeight: props.theme.spacing(30),
                maxBodyHeight: props.theme.spacing(60),
                actionsColumnIndex: -1
              }}
              actions={[
                {
                  icon: tableIcons.Delete,
                  tooltip: 'Delete Row',
                  onClick: (event, rowData) => deleteClickHandler(rowData)
                },
                {
                  icon: tableIcons.Edit,
                  tooltip: 'Edit Row',
                  onClick: (event, rowData) => editClickHandler(rowData)
                },
                {
                  icon: tableIcons.LibraryAdd,
                  tooltip: 'Duplicate Row',
                  onClick: (event, rowData) => duplicateClickHandler(rowData)
                }
              ]}
              detailPanel={detailsPanelHandler}
            />
          </Grid>
          <Grid item container direction='column' alignItems='flex-end'>
            <Box width={'25%'}>
              <Paper variant='outlined'>
                <CardHeader title='Summary' style={{ paddingBottom: 0 }} />
                <CardContent>
                  <Grid container direction='column' spacing={1}>
                    <Grid item>
                      <Typography>{`Overhead: ${toPercentage(
                        overhead
                      )}`}</Typography>
                      <Slider
                        value={overhead}
                        onChange={(_event, newValue) => setOverhead(newValue)}
                      />
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Cameras</Typography>
                      <Typography>{toDecimal(result?.quantity)}</Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Bandwidth</Typography>
                      <Typography>{`${toDecimal(
                        result?.bitrate,
                        2
                      )} Mbps`}</Typography>
                    </Grid>
                    <Grid item container justify='space-between'>
                      <Typography>Storage</Typography>
                      <Typography>{`${toDecimal(
                        result?.storage,
                        2
                      )} TB`}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <FloatingActionButton
        color='primary'
        tooltip='Add Cameras'
        onClick={() => setShowAddCamerasDialog(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
});

export default StorageCalculator;
