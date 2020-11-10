import { Paper } from '@material-ui/core';
import MaterialTable from 'material-table';
import React, { Fragment, useEffect, useState } from 'react';
import FloatingActionButton from '../../../components/FloatingActionButton';
import tableIcons from '../../../utils/table-icons';
import columnSchema from './column-schema';
import AddIcon from '@material-ui/icons/Add';
import UploadVendorsDialog from './UploadVendorsDialog';
import Vendor from '../../../models/vendor';

const FlatContainer = (props) => (
  <Paper {...props} variant='outlined' style={{ border: 0 }} />
);

const Vendors = (props) => {
  const [vendors, setVendors] = useState();
  const [showUploadVendorsDialog, setShowUploadVendorsDialog] = useState(false);

  useEffect(() => {
    let vendorsListener = Vendor.getExternalListener().onSnapshot(
      (snapshot) => {
        const newVendors = snapshot.docs.map((doc) => ({
          vendorId: doc.id,
          ...doc.data()
        }));
        setVendors(newVendors);
      }
    );
    return () => {
      if (vendorsListener) {
        vendorsListener();
      }
    };
  }, []);

  return (
    <Fragment>
      <UploadVendorsDialog
        open={showUploadVendorsDialog}
        close={() => setShowUploadVendorsDialog(false)}
        vendors={vendors}
      />
      <MaterialTable
        isLoading={!vendors}
        icons={tableIcons}
        columns={columnSchema}
        data={vendors}
        options={{
          showTitle: false,
          paginationType: 'normal',
          minBodyHeight: window.innerHeight / 1.5,
          maxBodyHeight: window.innerHeight / 1.5,
          pageSize: 10,
          pageSizeOptions: [10, 20, 50, 100, 500, 1000]
        }}
        components={{
          Container: FlatContainer
        }}
      />
      <FloatingActionButton
        style={{ zIndex: 100 }}
        color='primary'
        tooltip='Upload Vendors'
        onClick={() => setShowUploadVendorsDialog(true)}
      >
        <AddIcon />
      </FloatingActionButton>
    </Fragment>
  );
};

export default Vendors;
