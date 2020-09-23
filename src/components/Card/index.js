import React from 'react';
import styled from 'styled-components';
import { Card as MaterialCard } from '@material-ui/core';

const Card = styled(
	// eslint-disable-next-line no-unused-vars
	({ headerPadding, contentPadding, ...otherProps }) => (
		<MaterialCard {...otherProps} />
	)
)`
	${(props) =>
		props.headerPadding &&
		`& div.MuiCardHeader-root { padding: ${props.headerPadding}}`}
	${(props) =>
		props.contentPadding &&
		`& div.MuiCardContent-root { padding: ${props.contentPadding}}`}
`;

export default Card;
