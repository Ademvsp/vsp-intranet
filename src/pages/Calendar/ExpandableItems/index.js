import React, { useState, Fragment, useContext } from 'react';
import { ListItem, ListItemText, Collapse } from '@material-ui/core';
import { StyledList } from './styled-components';
import {
	ExpandLess as ExpandLessIcon,
	ExpandMore as ExpandMoreIcon
} from '@material-ui/icons';
import CalendarsListItem from './CalendarsListItem';
import EventTypesListItem from './EventTypesListItem';
import WorkFromHomeListItem from './WorkFromHomeListItem';
import LeaveListItem from './LeaveListItem';
import SkeletonContainer from './SkeletonContainer';
import { EventContext } from '..';
import {
	ANNUAL_LEAVE,
	ON_SITE,
	OUT_OF_OFFICE,
	SICK_LEAVE
} from '../../../data/event-types';

const ExpandableItems = (props) => {
	const initialPanelItems = [
		{
			name: 'Calendars',
			expanded: true,
			component: <CalendarsListItem />
		},
		{
			name: 'Event Types',
			expanded: false,
			component: <EventTypesListItem />
		},
		{
			name: 'Work from Home',
			expanded: false,
			component: <WorkFromHomeListItem />
		},
		{
			name: 'Out of Office',
			expanded: false,
			component: <LeaveListItem eventTypeName={OUT_OF_OFFICE} />
		},
		{
			name: 'Annual Leave',
			expanded: false,
			component: <LeaveListItem eventTypeName={ANNUAL_LEAVE} />
		},
		{
			name: 'Sick Leave',
			expanded: false,
			component: <LeaveListItem eventTypeName={SICK_LEAVE} />
		},
		{
			name: 'On Site',
			expanded: false,
			component: <LeaveListItem eventTypeName={ON_SITE} />
		}
	];
	const [panelItems, setPanelItems] = useState(initialPanelItems);
	const { events } = useContext(EventContext);
	const expandClickHandler = (index) => {
		setPanelItems((prevState) => {
			const newPanelItems = [...prevState];
			newPanelItems[index].expanded = !prevState[index].expanded;
			return newPanelItems;
		});
	};

	if (!events) {
		return <SkeletonContainer />;
	}

	return (
		<StyledList>
			{panelItems.map((panelItem, index) => {
				const ExpandedIcon = panelItem.expanded
					? ExpandLessIcon
					: ExpandMoreIcon;
				return (
					<Fragment key={panelItem.name}>
						<ListItem button onClick={expandClickHandler.bind(this, index)}>
							<ListItemText primary={panelItem.name}></ListItemText>
							{<ExpandedIcon />}
						</ListItem>
						<Collapse in={panelItem.expanded} timeout='auto'>
							{panelItem.component}
						</Collapse>
					</Fragment>
				);
			})}
		</StyledList>
	);
};

export default ExpandableItems;
