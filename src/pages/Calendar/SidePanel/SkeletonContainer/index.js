import React, { Fragment } from 'react';
import { Skeleton } from '@material-ui/lab';

const SkeletonContainer = (props) => {
	return (
		<Fragment>
			<Skeleton animation='pulse' width='100%' height={50} />
			<Skeleton animation='pulse' width='100%' height={50} />
			<Skeleton animation='pulse' width='100%' height={50} />
			<Skeleton animation='pulse' width='100%' height={50} />
			<Skeleton animation='pulse' width='100%' height={50} />
			<Skeleton animation='pulse' width='100%' height={50} />
		</Fragment>
	);
};

export default SkeletonContainer;
