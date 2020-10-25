import React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { reduxBatch } from '@manaflair/redux-batch';
import ReduxThunk from 'redux-thunk';
import authReducer from '../store/reducers/auth';
import messageReducer from '../store/reducers/message';
import notificationReducer from '../store/reducers/notification';
import dataReducer from '../store/reducers/data';
import uploadReducer from '../store/reducers/upload';
import { composeWithDevTools } from 'redux-devtools-extension';

const rootReducer = combineReducers({
	authState: authReducer,
	messageState: messageReducer,
	notificationState: notificationReducer,
	dataState: dataReducer,
	uploadState: uploadReducer
});

const store = createStore(
	rootReducer,
	composeWithDevTools(applyMiddleware(ReduxThunk), reduxBatch)
);

const StoreProvider = (props) => {
	return <Provider store={store}>{props.children}</Provider>;
};

export default StoreProvider;
