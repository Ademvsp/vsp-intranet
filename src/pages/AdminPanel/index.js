import { Card, Container, Tab, Tabs, useMediaQuery } from '@material-ui/core';
import React from 'react';
import { useState } from 'react';
import Customers from './Customers';
import Permissions from './Permissions';
import Users from './Users';

const AdminPanel = (props) => {
  const tabs = [
    { name: 'Users', Component: Users },
    { name: 'Permissions', Component: Permissions },
    { name: 'Customers', Component: Customers },
    { name: 'Vendors', Component: null }
  ];
  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = tabs[activeTab].Component;
  const mobile = useMediaQuery('(max-width: 767px)');

  return (
    <Container disableGutters maxWidth='lg'>
      <Card>
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
      </Card>
    </Container>
  );
};

export default AdminPanel;
