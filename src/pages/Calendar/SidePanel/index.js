import React, { useState, Fragment } from 'react';
import { List, ListItem, ListItemText, Collapse } from '@material-ui/core';
import { StyledPanelContainer } from './styled-components';
import {
	ExpandLess as ExpandLessIcon,
	ExpandMore as ExpandMoreIcon
} from '@material-ui/icons';
import { useSelector } from 'react-redux';
import CalendarsListeItem from './CalendarsListItem';
import EventTypesListItem from './EventTypesListItem';
import WorkFromHomeListItem from './WorkFromHomeListItem';
import LeaveListItem from './LeaveListItem';
import { eventTypeNames } from '../../../utils/event-types';
import SkeletonContainer from './SkeletonContainer';

const Panel = (props) => {
	const initialPanelItems = [
		{
			name: 'Calendars',
			expanded: true,
			component: <CalendarsListeItem />
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
			name: 'Annual Leave',
			expanded: false,
			component: (
				<LeaveListItem
					eventTypeId={eventTypeNames.ANNUAL_LEAVE.toLowerCase()}
				/>
			)
		},
		{
			name: 'Sick Leave',
			expanded: false,
			component: (
				<LeaveListItem eventTypeId={eventTypeNames.SICK_LEAVE.toLowerCase()} />
			)
		},
		{
			name: 'On Site',
			expanded: false,
			component: (
				<LeaveListItem eventTypeId={eventTypeNames.ON_SITE.toLowerCase()} />
			)
		}
	];
	const [panelItems, setPanelItems] = useState(initialPanelItems);
	const { events } = useSelector((state) => state.dataState);
	const expandClickHandler = (index) => {
		setPanelItems((prevState) => {
			const newPanelItems = [...prevState];
			newPanelItems[index].expanded = !prevState[index].expanded;
			return newPanelItems;
		});
	};

	return (
		<StyledPanelContainer>
			{!events ? (
				<SkeletonContainer />
			) : (
				<List>
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
				</List>
			)}
		</StyledPanelContainer>
	);
};

export default Panel;
