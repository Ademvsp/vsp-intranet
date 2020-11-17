import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@material-ui/core';
import { StyledSwitch } from './styled-components';
import { EventContext } from '../..';

const CalendarListItems = (props) => {
  const [states, setStates] = useState();
  const { locations } = useSelector((state) => state.dataState);
  const { selectedStates, setSelectedStates } = useContext(EventContext);

  useEffect(() => {
    const uniqueStates = [];
    for (const location of locations) {
      if (!uniqueStates.includes(location.state)) {
        uniqueStates.push(location.state);
      }
    }
    setStates(uniqueStates);
  }, [locations]);

  if (!states) {
    return <CircularProgress />;
  }
  const stateChangedHandler = (locationId) => {
    let newSelectedLocations;
    const checked = selectedStates.includes(locationId);
    if (checked) {
      newSelectedLocations = selectedStates.filter(
        (selectedLocation) => selectedLocation !== locationId
      );
    } else {
      newSelectedLocations = selectedStates.concat(locationId);
    }
    setSelectedStates(newSelectedLocations);
  };

  return states.map((state) => {
    return (
      <ListItem key={state}>
        <ListItemText primary={state} />
        <ListItemSecondaryAction>
          <StyledSwitch
            colors={
              locations.find((location) => location.state === state).colors
            }
            checked={selectedStates.includes(state)}
            onChange={stateChangedHandler.bind(this, state)}
          />
        </ListItemSecondaryAction>
      </ListItem>
    );
  });
};

export default CalendarListItems;
