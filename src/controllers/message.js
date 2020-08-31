import { CLEAR_MESSAGE, SET_MESSAGE } from '../utils/constants';

export const clearMessage = () => {
	return { type: CLEAR_MESSAGE };
};

export const setMessage = (message) => {
	return {
		type: SET_MESSAGE,
		message
	};
};
