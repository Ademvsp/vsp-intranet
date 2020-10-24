import React from 'react';
import { Chip } from '@material-ui/core';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import CallIcon from '@material-ui/icons/Call';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import PanToolIcon from '@material-ui/icons/PanTool';
import CloseIcon from '@material-ui/icons/Close';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import DoneIcon from '@material-ui/icons/Done';
import { statusNames } from '../../data/project-status-types';
import { withTheme } from '@material-ui/core/styles';

const {
	EXPRESSION_OF_INTEREST,
	PROOF_OF_CONCEPT,
	QUOTATION_STAGE,
	AWAITING_QUOTATION_RESPONSE,
	ON_HOLD,
	CLOSED_STALE,
	CLOSED_LOST,
	CLOSED_WON
} = statusNames;

const ProjectStatusChip = withTheme((props) => {
	let ChipIcon;
	let color;
	switch (props.status) {
		case EXPRESSION_OF_INTEREST:
			ChipIcon = CallIcon;
			color = props.theme.palette.primary.main;
			break;
		case PROOF_OF_CONCEPT:
			ChipIcon = RemoveRedEyeIcon;
			color = props.theme.palette.primary.main;
			break;
		case QUOTATION_STAGE:
			ChipIcon = FormatListNumberedIcon;
			color = props.theme.palette.primary.main;
			break;
		case AWAITING_QUOTATION_RESPONSE:
			ChipIcon = HourglassEmptyIcon;
			color = props.theme.palette.warning.main;
			break;
		case ON_HOLD:
			ChipIcon = PanToolIcon;
			color = props.theme.palette.warning.main;
			break;
		case CLOSED_STALE:
			ChipIcon = PriorityHighIcon;
			color = props.theme.palette.warning.main;
			break;
		case CLOSED_LOST:
			ChipIcon = CloseIcon;
			color = props.theme.palette.error.main;
			break;
		case CLOSED_WON:
			ChipIcon = DoneIcon;
			color = props.theme.palette.success.main;
			break;
		default:
			break;
	}
	return (
		<Chip
			label={props.status}
			icon={<ChipIcon style={{ color: color }} />}
			variant='outlined'
			style={{ borderColor: color, color: color }}
		/>
	);
});

export default ProjectStatusChip;
