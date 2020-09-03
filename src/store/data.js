import { SET_USERS, SET_USERS_TOUHED } from '../utils/constants';

const initialState = {
	users: null,
	usersTouched: false
};

export default (state = initialState, action) => {
	switch (action.type) {
		case SET_USERS:
			return {
				...state,
				users: action.users
			};
		case SET_USERS_TOUHED:
			return {
				...state,
				usersTouched: true
			};
		default:
			return state;
	}
};
