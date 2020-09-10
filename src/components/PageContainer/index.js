import React from 'react';
import { StyledPageContainer } from './styled-components';

const PageContainer = (props) => {
	const { width, children } = props;
	return (
		<StyledPageContainer width={width} maxWidth={false}>
			{children}
		</StyledPageContainer>
	);
};

export default PageContainer;
