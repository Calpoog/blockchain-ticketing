import { ADD_LOG } from './logsActions';

export default function logsReducer(state = {}, action) {
    const { type, log, contractName } = action;
    const contract = state[contractName];
    
    switch (type) {
        // listen for contract creation to make an entry in the logs state
        // case ADD_LOG:
        //     return {
        //         ...state,
        //         [contractName]: {
        //             state[log.event].concat(log)
        //         }
        //     };

        default: return state;
    }
};