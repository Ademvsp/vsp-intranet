import React, { useContext } from 'react';
import {
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Switch
} from '@material-ui/core';
import { EventContext } from '../..';
import eventTypes from '../../../../utils/event-types';

const EventTypesListItem = (props) => {
	const { selectedEventTypes, setSelectedEventTypes } = useContext(
		EventContext
	);
	const eventTypeChangeHandler = (eventTypeId) => {
		let newSelectedEventTypes;
		const checked = selectedEventTypes.includes(eventTypeId);
		if (checked) {
			newSelectedEventTypes = selectedEventTypes.filter(
				(selectedEventType) => selectedEventType !== eventTypeId
			);
		} else {
			newSelectedEventTypes = selectedEventTypes.concat(eventTypeId);
		}
		setSelectedEventTypes(newSelectedEventTypes);
	};

	return eventTypes.map((eventType) => {
		return (
			<ListItem key={eventType.eventTypeId}>
				<ListItemText primary={eventType.name} />
				<ListItemSecondaryAction>
					<Switch
						color='primary'
						checked={selectedEventTypes.includes(eventType.eventTypeId)}
						onChange={eventTypeChangeHandler.bind(this, eventType.eventTypeId)}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		);
	});
};

export default EventTypesListItem;
