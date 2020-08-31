import { SET_AUTH_USER, SET_AUTH_TOUCHED, LOGOUT } from '../utils/constants';

const initialState = {
	authUser: null,
	touched: false
};

export default (state = initialState, action) => {
	switch (action.type) {
		case SET_AUTH_USER:
			return {
				...state,
				authUser: action.authUser
			};
		case SET_AUTH_TOUCHED:
			return {
				...state,
				touched: true
			};
		case LOGOUT:
			return {
				...state,
				authUser: initialState.authUser
			};
		default:
			return state;
	}
};
