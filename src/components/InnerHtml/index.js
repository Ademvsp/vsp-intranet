import React from 'react';
import { StyledDiv } from './styled-components';
import { transformForWeb } from '../../utils/html-transformer';

const InnerHtml = (props) => {
	return (
		<StyledDiv
			dangerouslySetInnerHTML={{
				__html: transformForWeb(props.html)
			}}
		/>
	);
};

export default InnerHtml;
