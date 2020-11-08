import { CardContent, Container, Grid, Typography } from '@material-ui/core';
import MaterialTable from 'material-table';
import React, { Fragment, useEffect, useState } from 'react';
import FloatingActionButton from '../../components/FloatingActionButton';
import AddIcon from '@material-ui/icons/Add';
import Firmware from '../../models/firmware';
import tableIcons from '../../utils/table-icons';
import columnSchema from './column-schema';
import EditFirmwareDialog from './EditFirmwareDialog';
import ViewFirmwareDialog from './ViewFirmwareDialog';
import { useHistory, useParams } from 'react-router-dom';
import { READ, UPDATE } from '../../utils/actions';
import { useSelector } from 'react-redux';
import AttachmentsContainer from '../../components/AttachmentsContainer';
import NewFirmwareDialog from './NewFirmwareDialog';

const FirmwarePage = (props) => {
  const { push, replace } = useHistory();
  const params = useParams();
  const { action } = props;
  const { authUser } = useSelector((state) => state.authState);
  const { userId } = authUser;
  const [permissions, setPermissions] = useState();
  const [firmwares, setFirmwares] = useState();
  const [selectedFirmware, setSelectedFirmware] = useState();
  const [showNewFirmwareDialog, setShowNewFirmwareDialogOpen] = useState(false);
  const [showEditFirmwareDialog, setShowEditFirmwareDialog] = useState(false);
  const [showViewFirmwareDialog, setShowViewFirmwareDialog] = useState(false);

  useEffect(() => {
    const asyncFunction = async () => {
      const admin = await Firmware.isAdmin();
      setPermissions({ admin: admin });
    };
    asyncFunction();
  }, []);

  useEffect(() => {
    let firmwaresListener;
    if (permissions !== undefined) {
      firmwaresListener = Firmware.getListener().onSnapshot((snapshot) => {
        const newFirmwares = snapshot.docs.map((doc) => {
          const metadata = {
            ...doc.data().metadata,
            createdAt: doc.data().metadata.createdAt.toDate(),
            updatedAt: doc.data().metadata.updatedAt.toDate()
          };
          return new Firmware({
            ...doc.data(),
            firmwareId: doc.id,
            metadata: metadata
          });
        });
        setFirmwares(newFirmwares);
      });
    }
    return () => {
      if (firmwaresListener) {
        firmwaresListener();
      }
    };
  }, [permissions]);

  useEffect(() => {
    if (firmwares) {
      if (action === READ) {
        setSelectedFirmware(null);
      } else if (action === UPDATE) {
        const newSelectedFirmware = firmwares.find(
          (firmware) => firmware.firmwareId === params.firmwareId
        );
        if (newSelectedFirmware) {
          if (permissions.admin || userId === newSelectedFirmware.user) {
            setShowViewFirmwareDialog(true);
          } else {
            setShowEditFirmwareDialog(true);
          }
          setSelectedFirmware(newSelectedFirmware);
        } else {
          push('/firmware');
        }
      }
    }
  }, [action, firmwares, params.firmwareId, permissions, push, userId]);

  const closeDialogHandler = () => {
    setSelectedFirmware(null);
    setShowNewFirmwareDialogOpen(false);
    setShowViewFirmwareDialog(false);
    setShowEditFirmwareDialog(false);
    replace('/firmware');
  };

  return (
    <Fragment>
      <NewFirmwareDialog
        open={showNewFirmwareDialog}
        close={closeDialogHandler}
      />
      {selectedFirmware && (
        <Fragment>
          <EditFirmwareDialog
            open={showEditFirmwareDialog}
            close={closeDialogHandler}
            firmware={selectedFirmware}
          />
          <ViewFirmwareDialog
            open={showViewFirmwareDialog}
            close={closeDialogHandler}
            firmware={selectedFirmware}
          />
        </Fragment>
      )}
      <Container disableGutters maxWidth='lg'>
        <MaterialTable
          isLoading={!firmwares}
          icons={tableIcons}
          columns={columnSchema}
          data={firmwares}
          options={{
            showTitle: false,
            paginationType: 'normal',
            minBodyHeight: window.innerHeight / 1.5,
            maxBodyHeight: window.innerHeight / 1.5,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50, 100]
          }}
          onRowClick={(event, rowData) =>
            push(`/firmware/${rowData.firmwareId}`)
          }
          detailPanel={(rowData) => {
            return (
              <CardContent>
                <Grid container direction='column' spacing={1}>
                  {rowData.body && (
                    <Grid item>
                      <Typography>{rowData.body}</Typography>
                    </Grid>
                  )}
                  <Grid item>
                    <AttachmentsContainer attachments={rowData.attachments} />
                  </Grid>
                </Grid>
              </CardContent>
            );
          }}
        />
      </Container>
      <FloatingActionButton
        style={{ zIndex: 100 }}
        color='primary'
        tooltip='Add Firmware'
        onClick={() => setShowNewFirmwareDialogOpen(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
};

export default FirmwarePage;
