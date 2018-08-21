import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import contracts from './contracts/contractsReducer';
import tickets from './tickets/ticketsReducer';
import events from './events/eventsReducer';
import web3 from './util/web3/web3Reducer';
import account from './util/web3/accountReducer';

const reducer = combineReducers({
    routing: routerReducer,
    web3,
    account,
    contracts,
    tickets,
    events
});

export default reducer;
