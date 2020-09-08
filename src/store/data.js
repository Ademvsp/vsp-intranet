import {
	SET_USERS,
	SET_USERS_TOUCHED,
	SET_POSTS_COUNTER
} from '../utils/constants';

const initialState = {
	users: null,
	usersTouched: false,
	postsCounter: null
};

export default (state = initialState, action) => {
	switch (action.type) {
		case SET_USERS:
			return {
				...state,
				users: action.users
			};
		case SET_USERS_TOUCHED:
			return {
				...state,
				usersTouched: true
			};
		case SET_POSTS_COUNTER:
			return {
				...state,
				postsCounter: action.postsCounter
			};
		default:
			return state;
	}
};
