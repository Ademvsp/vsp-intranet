import { Dialog as MaterialDialog } from '@material-ui/core';
import styled from 'styled-components';

const Dialog = styled(MaterialDialog)`
	${(props) =>
		props.width &&
		`& div.MuiDialog-paperWidthSm {
		width: ${props.width}px;
	}`}
`;

export default Dialog;
