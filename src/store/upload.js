import { START_UPLOAD, SET_UPLOAD_PROGRESS, FINISH_UPLOAD } from '../utils/constants';

const initialState = {
	files: null,
	filesProgress: null
};

export default (state = initialState, action) => {
	switch (action.type) {
		case START_UPLOAD:
			return {
				files: action.files,
				filesProgress: action.filesProgress
			};
		case SET_UPLOAD_PROGRESS:
			return {
				...state,
				filesProgress: action.filesProgress
			};
		case FINISH_UPLOAD:
			return {
				files: initialState.files,
				filesProgress: initialState.filesProgress
			};
		default:
			return state;
	}
};
