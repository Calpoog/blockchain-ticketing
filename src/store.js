import { browserHistory } from 'react-router'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux'
import reducer from './reducer'
//import rootSaga from './rootSaga'
//import createSagaMiddleware from 'redux-saga'

// Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const routingMiddleware = routerMiddleware(browserHistory)
//const sagaMiddleware = createSagaMiddleware()

const initialState = {
}

const store = createStore(
  reducer,
  initialState,
  composeEnhancers(
    applyMiddleware(
      thunkMiddleware,
      routingMiddleware,
      //sagaMiddleware
    )
  )
)

//sagaMiddleware.run(rootSaga)

export default store