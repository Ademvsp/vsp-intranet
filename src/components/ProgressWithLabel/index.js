import React from 'react';
import { StyledProgressContainer } from './styled-components';
import { LinearProgress, Typography } from '@material-ui/core';


const ProgressWithLabel = (props) => {
	const { transferred, total } = props;
	const value = Math.round(transferred / total * 100);
	return (
		<StyledProgressContainer>
			<LinearProgress variant="determinate" value={value} color="secondary" />
			<Typography variant="body2" color="textSecondary">
				{`${value}%`}
			</Typography>
		</StyledProgressContainer>
	);
}

export default ProgressWithLabel;