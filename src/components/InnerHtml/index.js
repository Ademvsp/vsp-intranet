import React from 'react';
import { StyledDiv } from './styled-components';
import htmlTransformer from '../../utils/html-transformer';

const InnerHtml = (props) => {
	return (
		<StyledDiv
			dangerouslySetInnerHTML={{
				__html: htmlTransformer(props.html)
			}}
		/>
	);
};

export default InnerHtml;
