import React from 'react';
import { Card, CardContent, Container } from '@material-ui/core';
import { useSelector } from 'react-redux';
import Avatar from './AccountAvatar';
import Settings from './Settings';
import Logout from './Logout';

const Account = (props) => {
  const { authUser } = useSelector((state) => state.authState);

  return (
    <Container disableGutters maxWidth='xs'>
      <Card>
        <CardContent>
          <Avatar authUser={authUser} />
          <Settings authUser={authUser} />
          <Logout />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Account;
