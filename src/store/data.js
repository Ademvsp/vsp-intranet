import {
	SET_USERS,
	SET_ACTIVE_USERS,
	SET_USERS_TOUCHED,
	SET_POSTS_COUNTER,
	SET_LOCATIONS,
	SET_USERS_COUNTER,
	SET_ACTIVE_USERS_COUNTER,
	SET_CUSTOMERS,
	SET_VENDORS
} from '../utils/actions';

const initialState = {
	users: null,
	activeUsers: null,
	usersCounter: null,
	activeUsersCounter: null,
	usersTouched: false,
	postsCounter: null,
	locations: null,
	customers: null,
	vendors: null
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
				usersCounter: action.usersCounter
			};
		case SET_ACTIVE_USERS_COUNTER:
			return {
				...state,
				activeUsersCounter: action.activeUsersCounter
			};
		case SET_LOCATIONS:
			return {
				...state,
				locations: action.locations
			};
		case SET_CUSTOMERS:
			return {
				...state,
				customers: action.customers
			};
		case SET_VENDORS:
			return {
				...state,
				vendors: action.vendors
			};
		default:
			return state;
	}
};
