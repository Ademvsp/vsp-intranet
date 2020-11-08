import {
  Card,
  CardContent,
  Container,
  Paper,
  Tab,
  Tabs,
  useMediaQuery
} from '@material-ui/core';
import { TabContext, TabPanel } from '@material-ui/lab';
import React, { useEffect } from 'react';
import { useState } from 'react';
import Users from './Users';

const AdminPanel = (props) => {
  const tabs = [
    { name: 'Users', Component: Users },
    { name: 'Permissions', Component: null },
    { name: 'Customers', Component: null },
    { name: 'Vendors', Component: null }
  ];
  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = tabs[activeTab].Component;
  const mobile = useMediaQuery('(max-width: 767px)');

  return (
    <Container disableGutters maxWidth='lg'>
      <Paper variant='outlined'>
        <Tabs
          variant={mobile ? 'scrollable' : 'fullWidth'}
          centered
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
        >
          {tabs.map((tab) => (
            <Tab key={tab.name} label={tab.name} />
          ))}
        </Tabs>
        <ActiveComponent />
      </Paper>
    </Container>
  );
};

export default AdminPanel;
