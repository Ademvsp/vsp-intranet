import MaterialTable from 'material-table';
import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import tableIcons from '../../../utils/table-icons';
import columnSchema from './column-schema';
import {
  getUserAuthData,
  revokeRefreshTokens
} from '../../../store/actions/user';
import EditUserDialog from './EditUserDialog';
import AddIcon from '@material-ui/icons/Add';
import FloatingActionButton from '../../../components/FloatingActionButton';
import NewUserDialog from './NewUserDialog';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { Paper } from '@material-ui/core';

const FlatContainer = (props) => (
  <Paper {...props} variant='outlined' style={{ border: 0 }} />
);

const Users = (props) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.dataState);
  const [selectedUserData, setSelectedUserData] = useState();
  const [loading, setLoading] = useState();
  const [refreshTokenUserId, setRefreshTokenUserId] = useState();
  const [showRevokeConfirmDialog, setShowRevokeConfirmDialog] = useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);

  const copyUserIdClickHandler = (event, rowData) => {
    navigator.clipboard.writeText(rowData.userId);
  };

  const revokeRefreshTokenClickHandler = (_event, rowData) => {
    setShowRevokeConfirmDialog(true);
    setRefreshTokenUserId(rowData.userId);
  };

  const revokeRefreshTokenHandler = async () => {
    setLoading(true);
    await dispatch(revokeRefreshTokens(refreshTokenUserId));
    revokeConfirmDialogCloseDialog();
    setLoading(false);
  };

  const revokeConfirmDialogCloseDialog = () => {
    setShowRevokeConfirmDialog(false);
    setRefreshTokenUserId(null);
  };

  const editClickHandler = async (event, rowData) => {
    setLoading(true);
    const userAuthData = await dispatch(getUserAuthData(rowData.userId));
    const newSelectedUserData = {
      userId: userAuthData.uid,
      data: {
        admin: userAuthData.admin,
        active: !userAuthData.disabled,
        firstName: rowData.firstName,
        lastName: rowData.lastName,
        email: rowData.email,
        authPhone: userAuthData.phoneNumber,
        phone: rowData.phone,
        extension: rowData.extension,
        title: rowData.title,
        location: rowData.location.locationId,
        manager: rowData.manager
      }
    };
    setSelectedUserData(newSelectedUserData);
    setLoading(false);
  };

  const userTableData = users.map((user) => ({
    ...user,
    fullName: user.getFullName(),
    managerFullName: users.find((u) => u.userId === user.manager).getFullName()
  }));

  const pageSizeOptions = [];
  let pageSizeOption = 0;
  do {
    const difference = userTableData.length - pageSizeOption;
    if (difference <= 10) {
      pageSizeOption += difference;
    } else {
      pageSizeOption += 10;
    }
    pageSizeOptions.push(pageSizeOption);
  } while (pageSizeOption < userTableData.length);

  return (
    <Fragment>
      <ConfirmDialog
        open={showRevokeConfirmDialog}
        cancel={revokeConfirmDialogCloseDialog}
        confirm={revokeRefreshTokenHandler}
        title='Admin Panel'
        message='This will revoke and log the user out of all devices in case they have lost or misplaced a device.'
        loading={loading}
      />
      <NewUserDialog
        open={showNewUserDialog}
        close={() => setShowNewUserDialog(false)}
      />
      {selectedUserData && (
        <EditUserDialog
          open={!!selectedUserData}
          close={() => setSelectedUserData(null)}
          userData={selectedUserData}
        />
      )}
      <MaterialTable
        isLoading={!users || loading}
        icons={tableIcons}
        columns={columnSchema}
        data={userTableData}
        options={{
          showTitle: false,
          paginationType: 'normal',
          minBodyHeight: window.innerHeight / 1.5,
          maxBodyHeight: window.innerHeight / 1.5,
          pageSize: 10,
          pageSizeOptions: pageSizeOptions,
          actionsColumnIndex: -1
        }}
        actions={[
          {
            icon: tableIcons.FileCopy,
            tooltip: 'Copy User ID',
            onClick: copyUserIdClickHandler
          },
          {
            icon: tableIcons.Edit,
            tooltip: 'Edit User',
            onClick: editClickHandler
          },
          {
            icon: tableIcons.Lock,
            tooltip: 'Revoke Refresh Tokens',
            onClick: revokeRefreshTokenClickHandler
          }
        ]}
        components={{
          Container: FlatContainer
        }}
      />
      <FloatingActionButton
        style={{ zIndex: 100 }}
        color='primary'
        tooltip='Add User'
        onClick={() => setShowNewUserDialog(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
};

export default Users;
