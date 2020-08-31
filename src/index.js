import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import StoreProvider from './utils/store-provider';
import ThemeProvider from './utils/theme-provider';
import MessageHandler from './utils/message-provider';

ReactDOM.render(
	<BrowserRouter>
		<StoreProvider>
			<ThemeProvider>
				<MessageHandler>
					<App />
				</MessageHandler>
			</ThemeProvider>
		</StoreProvider>
	</BrowserRouter>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
