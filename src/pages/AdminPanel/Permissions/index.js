import { CircularProgress, Paper } from '@material-ui/core';
import MaterialTable from 'material-table';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MembersDialog from './MembersDialog';
import Permission from '../../../models/permission';
import tableIcons from '../../../utils/table-icons';
import columnSchema from './column-schema';
// import MembersDialog from './MembersDialog';

const FlatContainer = (props) => (
  <Paper {...props} variant='outlined' style={{ border: 0 }} />
);

const Permissions = (props) => {
  const dispatch = useDispatch();
  const { users, usersData } = useSelector((state) => state.dataState);
  const [permissions, setPermissions] = useState();
  const [selectedPermission, setSelectedPermission] = useState();

  useEffect(() => {
    let permissionsListener = Permission.getListener().onSnapshot(
      (snapshot) => {
        const permissions = snapshot.docs.map(
          (doc) => new Permission({ collection: doc.id, groups: doc.data() })
        );
        setPermissions(permissions);
      }
    );
    return () => {
      if (permissionsListener) {
        permissionsListener();
      }
    };
  }, [dispatch]);

  if (!permissions || users.length !== usersData.documents.length) {
    return <CircularProgress />;
  }

  const permissionTableData = [];
  for (const permission of permissions) {
    for (const group in permission.groups) {
      const members = users.filter((user) =>
        permission.groups[group].includes(user.userId)
      );
      const membersFullNames = members
        .map((member) => member.getFullName())
        .join(', ');
      permissionTableData.push({
        collection: permission.collection,
        group: group,
        members: members,
        membersFullNames: membersFullNames
      });
    }
  }

  return (
    <Fragment>
      {selectedPermission && (
        <MembersDialog
          close={() => setSelectedPermission(null)}
          open={!!selectedPermission}
          selectedPermission={selectedPermission}
        />
      )}
      <MaterialTable
        isLoading={!permissions}
        icons={tableIcons}
        columns={columnSchema}
        data={permissionTableData}
        options={{
          showTitle: false,
          paginationType: 'normal',
          minBodyHeight: window.innerHeight / 1.5,
          maxBodyHeight: window.innerHeight / 1.5,
          pageSize: 10,
          pageSizeOptions: [10, 20, 50],
          actionsColumnIndex: -1
        }}
        // actions={[
        //   {
        //     icon: tableIcons.FileCopy,
        //     tooltip: 'Copy User ID',
        //     onClick: copyUserIdClickHandler
        //   },
        //   {
        //     icon: tableIcons.Edit,
        //     tooltip: 'Edit Row',
        //     onClick: editClickHandler
        //   },
        //   {
        //     icon: tableIcons.Lock,
        //     tooltip: 'Revoke Refresh Tokens',
        //     onClick: revokeRefreshTokenClickHandler
        //   }
        // ]}
        components={{
          Container: FlatContainer
        }}
        onRowClick={(event, rowData) => setSelectedPermission(rowData)}
      />
    </Fragment>
  );
};

export default Permissions;
