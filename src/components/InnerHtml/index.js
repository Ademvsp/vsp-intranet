import React from 'react';
import { transformForWeb } from '../../utils/html-transformer';
import styled from 'styled-components';

export const StyledDiv = styled.div`
  & figure {
    margin: 0;
  }
  & figure.image img {
    max-width: 100%;
  }
  overflow-wrap: anywhere;
`;

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
