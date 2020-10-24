import React, { useContext } from 'react';
import {
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Switch
} from '@material-ui/core';
import { EventContext } from '../..';
import eventTypes from '../../../../data/event-types';

const EventTypesListItem = (props) => {
	const { selectedEventTypes, setSelectedEventTypes } = useContext(
		EventContext
	);
	const eventTypeChangeHandler = (eventTypeName) => {
		let newSelectedEventTypes;
		const checked = selectedEventTypes.includes(eventTypeName);
		if (checked) {
			newSelectedEventTypes = selectedEventTypes.filter(
				(selectedEventType) => selectedEventType !== eventTypeName
			);
		} else {
			newSelectedEventTypes = selectedEventTypes.concat(eventTypeName);
		}
		setSelectedEventTypes(newSelectedEventTypes);
	};

	return eventTypes.map((eventType) => {
		return (
			<ListItem key={eventType.name}>
				<ListItemText primary={eventType.name} />
				<ListItemSecondaryAction>
					<Switch
						color='primary'
						checked={selectedEventTypes.includes(eventType.name)}
						onChange={eventTypeChangeHandler.bind(this, eventType.name)}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		);
	});
};

export default EventTypesListItem;
