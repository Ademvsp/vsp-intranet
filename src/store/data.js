import {
	SET_USERS,
	SET_ACTIVE_USERS,
	SET_USERS_TOUCHED,
	SET_POSTS_COUNTER,
	SET_EVENTS,
	SET_LOCATIONS,
	SET_USERS_COUNTER,
	SET_ACTIVE_USERS_COUNTER
} from '../utils/actions';

const initialState = {
	users: null,
	activeUsers: null,
	usersCounter: null,
	activeUsersCounter: null,
	usersTouched: false,
	postsCounter: null,
	events: null,
	locations: null
};

export default (state = initialState, action) => {
	switch (action.type) {
		case SET_USERS:
			return {
				...state,
				users: action.users
			};
		case SET_ACTIVE_USERS:
			return {
				...state,
				activeUsers: action.activeUsers
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
		case SET_USERS_COUNTER:
			return {
				...state,
				userCounter: action.userCounter
			};
		case SET_ACTIVE_USERS_COUNTER:
			return {
				...state,
				activeUsersCounter: action.activeUsersCounter
			};
		case SET_EVENTS:
			return {
				...state,
				events: action.events
			};
		case SET_LOCATIONS:
			return {
				...state,
				locations: action.locations
			};
		default:
			return state;
	}
};
