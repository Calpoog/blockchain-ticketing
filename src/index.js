import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'

// Layouts
import App from './App'
import Home from './layouts/home/Home'
import Host from './layouts/host/Host'

import store from './store'

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
          <Route path="/host" component={Host} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root')
);
