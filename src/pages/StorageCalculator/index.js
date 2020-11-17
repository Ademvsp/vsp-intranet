import React, { Fragment, useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import {
  Box,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Slider,
  Typography,
  withTheme,
  useMediaQuery
} from '@material-ui/core';
import tableIcons from '../../utils/table-icons';
import { detailPanelHandler, columnSchema } from './table-data';
import FloatingActionButton from '../../components/FloatingActionButton';
import AddIcon from '@material-ui/icons/Add';
import { toDecimal, toPercentage } from '../../utils/data-transformer';
import AddCamerasDialog from './AddCamerasDialog';
import EditCamerasDialog from './EditCamerasDialog';

const StorageCalculator = withTheme((props) => {
  const [showAddCamerasDialog, setShowAddCamerasDialog] = useState(false);
  const [overhead, setOverhead] = useState(0);
  const [result, setResult] = useState();
  const [selectedCameraGroup, setSelectedCameraGroup] = useState();
  const [cameraGroups, setCameraGroups] = useState([]);
  const mobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    console.log(cameraGroups);
    const newResult = cameraGroups.reduce(
      (previousValue, currentValue) => {
        const overheadDecimal = overhead / 100;
        const bitrateOverhead = currentValue.bitrate * overheadDecimal;
        const storageOvherhead = currentValue.storage * overheadDecimal;
        const bitrateTotal = currentValue.bitrate * currentValue.quantity;
        const storageTotal = currentValue.storage * currentValue.quantity;
        return {
          quantity: previousValue.quantity + currentValue.quantity,
          bitrate: previousValue.bitrate + bitrateTotal + bitrateOverhead,
          storage: previousValue.storage + storageTotal + storageOvherhead
        };
      },
      { quantity: 0, bitrate: 0, storage: 0 }
    );
    setResult(newResult);
  }, [cameraGroups, overhead]);

  const addCameraGroupHandler = (cameraData) => {
    const newCameraGroups = [...cameraGroups, cameraData];
    setCameraGroups(newCameraGroups);
  };

  const deleteClickHandler = (rowData) => {
    const newCameraGroup = [...cameraGroups];
    newCameraGroup.splice(rowData.tableData.id, 1);
    setCameraGroups(newCameraGroup);
  };

  const editClickHandler = (rowData) => {
    setSelectedCameraGroup(rowData);
  };

  const editCameraGroupHandler = (cameraGroup) => {
    const cameraGroupIndex = cameraGroups.findIndex(
      (cg) => cg.tableData.id === cameraGroup.tableData.id
    );
    const newCameraGroups = [...cameraGroups];
    newCameraGroups.splice(cameraGroupIndex, 1, cameraGroup);
    setCameraGroups(newCameraGroups);
  };

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
        addCameraGroupHandler={addCameraGroupHandler}
      />
      {selectedCameraGroup && (
        <EditCamerasDialog
          open={!!selectedCameraGroup}
          close={() => setSelectedCameraGroup(null)}
          cameraGroup={selectedCameraGroup}
          editCameraGroupHandler={editCameraGroupHandler}
        />
      )}
      <Container disableGutters maxWidth='lg'>
        <Grid container direction='column' spacing={2}>
          <Grid item style={{ width: '-webkit-fill-available' }}>
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
              detailPanel={detailPanelHandler}
            />
          </Grid>
          <Grid item container direction='column' alignItems='flex-end'>
            <Box width={mobile ? '100%' : '35%'}>
              <Paper variant='outlined'>
                <CardHeader title='Summary' style={{ paddingBottom: 0 }} />
                <CardContent>
                  <Grid container direction='column' spacing={1}>
                    <Grid item>
                      <Typography>{`Overhead: ${toPercentage(
                        overhead
                      )}`}</Typography>
                      <Slider
                        valueLabelDisplay='auto'
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
        style={{ zIndex: 100 }}
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
