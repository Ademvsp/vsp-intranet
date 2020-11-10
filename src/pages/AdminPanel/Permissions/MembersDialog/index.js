import React, { useState } from 'react';
import {
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
import { useDispatch, useSelector } from 'react-redux';
import { AvatarGroup } from '@material-ui/lab';
import Avatar from '../../../../components/Avatar';
import { setPermissions } from '../../../../store/actions/permission';
import ActionsBar from '../../../../components/ActionsBar';

const MembersDialog = withTheme((props) => {
  const { open, close, selectedPermission } = props;
  const { users } = useSelector((state) => state.dataState);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState();
  const [checkedUsers, setCheckedUsers] = useState(
    selectedPermission.members.map((member) => member.userId)
  );

  const closeHandler = () => {
    if (!loading) {
      close();
    }
  };

  const confirmClickHandler = async () => {
    setLoading(true);
    const result = await dispatch(
      setPermissions(
        selectedPermission.collection,
        selectedPermission.group,
        checkedUsers
      )
    );
    setLoading(false);
    if (result) {
      setCheckedUsers([]);
      close();
    }
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
        <ActionsBar
          buttonLoading={loading}
          disabled={loading}
          isValid={true}
          onClick={confirmClickHandler}
          tooltipPlacement='top'
          actionButtonText='Update'
        />
      </DialogActions>
    </Dialog>
  );
});

export default MembersDialog;
