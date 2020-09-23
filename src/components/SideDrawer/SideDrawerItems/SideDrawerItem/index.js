import {
	Collapse,
	ListItem,
	ListItemIcon,
	ListItemText
} from '@material-ui/core';
import React, { Fragment, useState, useContext } from 'react';
import {
	ExpandLess as ExpandLessIcon,
	ExpandMore as ExpandMoreIcon
} from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { withTheme } from '@material-ui/core/styles';
import { SideDrawerContext } from '../../../AppContainer';

const SideDrawerItem = withTheme((props) => {
	const history = useHistory();
	const { setDrawerOpen } = useContext(SideDrawerContext);
	const [expand, setExpand] = useState(false);
	const ExpandIcon = expand ? ExpandLessIcon : ExpandMoreIcon;
	const { Icon, text, link, subItems, subItem } = props;

	const listItemClickHandler = () => {
		if (subItems) {
			setExpand((prevState) => !prevState);
		} else {
			history.push(link);
			setDrawerOpen(false);
		}
	};

	return (
		<Fragment>
			<ListItem
				button={true}
				onClick={listItemClickHandler}
				style={{
					paddingLeft: subItem ? props.theme.spacing(4) : ''
				}}
			>
				<ListItemIcon>
					<Icon />
				</ListItemIcon>
				<ListItemText primary={text} />
				{subItems && <ExpandIcon />}
			</ListItem>
			{subItems && (
				<Collapse in={expand} timeout='auto' unmountOnExit>
					{subItems.map((subItem) => subItem)}
				</Collapse>
			)}
		</Fragment>
	);
});

export default SideDrawerItem;
