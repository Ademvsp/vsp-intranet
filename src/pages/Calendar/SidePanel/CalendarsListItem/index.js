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
	const [locations, setLocations] = useState();
	const { locations: dataStateLocations } = useSelector(
		(state) => state.dataState
	);
	const { selectedLocations, setSelectedLocations } = useContext(EventContext);

	useEffect(() => {
		const uniqueLocations = [];
		dataStateLocations.forEach((dataStateLocation) => {
			const locationMatch = !uniqueLocations.some(
				(uniqueLocation) => uniqueLocation.state === dataStateLocation.state
			);
			if (locationMatch) {
				uniqueLocations.push(dataStateLocation);
			}
		});
		setLocations(uniqueLocations);
	}, [dataStateLocations]);

	if (!locations) {
		return <CircularProgress />;
	}
	const locationChangeHandler = (locationId) => {
		let newSelectedLocations;
		const checked = selectedLocations.includes(locationId);
		if (checked) {
			newSelectedLocations = selectedLocations.filter(
				(selectedLocation) => selectedLocation !== locationId
			);
		} else {
			newSelectedLocations = selectedLocations.concat(locationId);
		}
		setSelectedLocations(newSelectedLocations);
	};

	return locations.map((location) => {
		return (
			<ListItem key={location.locationId}>
				<ListItemText primary={location.state} />
				<ListItemSecondaryAction>
					<StyledSwitch
						colors={location.colors}
						checked={selectedLocations.includes(location.locationId)}
						onChange={locationChangeHandler.bind(this, location.locationId)}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		);
	});
};

export default CalendarListItems;
