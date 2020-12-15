import {
  SET_USERS,
  SET_ACTIVE_USERS,
  SET_USERS_TOUCHED,
  SET_POSTS_DATA,
  SET_LOCATIONS,
  SET_USERS_DATA,
  SET_ACTIVE_USERS_DATA,
  SET_CUSTOMERS,
  SET_VENDORS,
  SET_SERVER_BUILD
} from '../../utils/actions';

const initialState = {
  browserBuild: 202012151647,
  serverBuild: null,
  users: null,
  activeUsers: null,
  usersData: null,
  activeUsersData: null,
  usersTouched: false,
  postsData: null,
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
    case SET_POSTS_DATA:
      return {
        ...state,
        postsData: action.postsData
      };
    case SET_USERS_DATA:
      return {
        ...state,
        usersData: action.usersData
      };
    case SET_ACTIVE_USERS_DATA:
      return {
        ...state,
        activeUsersData: action.activeUsersData
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
    case SET_SERVER_BUILD:
      return {
        ...state,
        serverBuild: action.serverBuild
      };
    default:
      return state;
  }
};
