import styled from 'styled-components';
import { withTheme } from '@material-ui/core/styles';
import { List } from '@material-ui/core';

export const StyledContainer = withTheme(styled.div`
  border-color: ${(props) =>
    props.isDragActive && props.theme.palette.primary.main};
  opacity: ${(props) => (props.isDragActive ? '1' : '0.4')};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border-width: 1px;
  border-radius: 4px;
  border-style: dashed;
  background-color: ${(props) => props.theme.palette.background.default};
  transition: border 0.24s ease-in-out;
  &:hover {
    cursor: pointer;
    opacity: 1;
    border-color: ${(props) => props.theme.palette.primary.main};
  }
`);

export const StyledList = styled(List)`
  max-height: 300px;
  margin-top: 20px;
  overflow-y: overlay;
  &
    span.MuiTypography-root.MuiListItemText-primary.MuiTypography-body1.MuiTypography-displayBlock {
    overflow-x: auto;
    white-space: nowrap;
  }
`;
