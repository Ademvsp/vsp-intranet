import React, { useState, useEffect } from 'react';
import {
  Button,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  DialogActions,
  useMediaQuery,
  Dialog,
  withTheme,
  DialogTitle,
  ListItem,
  DialogContent
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { AvatarGroup } from '@material-ui/lab';
import Avatar from '../Avatar';

const NotifyUsersList = withTheme((props) => {
  const { open, close, notifyUsers, setNotifyUsers } = props;
  const { activeUsers: users } = useSelector((state) => state.dataState);
  const [checkedUsers, setCheckedUsers] = useState([]);

  useEffect(() => {
    if (notifyUsers) {
      setCheckedUsers(notifyUsers);
    }
  }, [open, notifyUsers]);

  const closeHandler = () => {
    close();
  };

  const confirmClickHandler = () => {
    setNotifyUsers(checkedUsers);
    setCheckedUsers([]);
    close();
  };

  const checkHandler = (userId, checked) => () => {
    const newCheckedUsers = [...checkedUsers];
    if (checked) {
      const index = checkedUsers.findIndex(
        (checkedUser) => checkedUser === userId
      );
      newCheckedUsers.splice(index, 1);
    } else {
      newCheckedUsers.push(userId);
    }
    setCheckedUsers(newCheckedUsers);
  };

  const selectAllCheckHandler = () => {
    const checked = users.length === checkedUsers.length;
    let newCheckedUsers;
    if (checked) {
      newCheckedUsers = [];
    } else {
      newCheckedUsers = users.map((user) => user.userId);
    }
    setCheckedUsers(newCheckedUsers);
  };

  const mobile = useMediaQuery('(max-width: 767px)');

  return (
    <Dialog open={open} onClose={closeHandler} fullWidth maxWidth='sm'>
      <DialogTitle style={{ padding: `0 ${props.theme.spacing(3)}px` }}>
        <List dense>
          <ListItem style={{ paddingLeft: 0 }}>
            {checkedUsers.length > 0 ? (
              <ListItemAvatar>
                <AvatarGroup max={mobile ? 3 : 6}>
                  {checkedUsers.map((checkedUser) => {
                    const user = users.find(
                      (user) => user.userId === checkedUser
                    );
                    return <Avatar key={checkedUser} user={user} />;
                  })}
                </AvatarGroup>
              </ListItemAvatar>
            ) : null}
            <ListItemText
              style={{ textAlign: 'end' }}
              primary={'Select all'}
              secondary={`${checkedUsers.length} selected`}
            />
            <ListItemSecondaryAction>
              <Checkbox
                edge='end'
                onChange={selectAllCheckHandler}
                checked={users.length === checkedUsers.length}
                indeterminate={
                  checkedUsers.length > 0 && checkedUsers.length < users.length
                }
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogTitle>
      <DialogContent style={{ maxHeight: 300, overflowY: 'overlay' }}>
        <List dense>
          {users.map((user) => {
            const { firstName, lastName } = user;
            const checked = checkedUsers.some(
              (checkedUser) => checkedUser === user.userId
            );
            return (
              <ListItem
                button
                style={{ paddingLeft: 0 }}
                key={user.userId}
                onClick={checkHandler(user.userId, checked)}
              >
                <ListItemAvatar>
                  <Avatar user={user} />
                </ListItemAvatar>
                <ListItemText primary={`${firstName} ${lastName}`} />
                <ListItemSecondaryAction>
                  <Checkbox
                    edge='end'
                    onChange={checkHandler(user.userId, checked)}
                    checked={checked}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeHandler} color='primary' variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={confirmClickHandler}
          color='primary'
          variant='contained'
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default NotifyUsersList;
