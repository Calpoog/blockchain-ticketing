import { ADD_TICKET } from './ticketsActions';

export default function ticketsReducer(state = {}, action) {
    switch (action.type) {
        case ADD_TICKET:
            if (action.ticket instanceof Array) {
                return action.ticket.reduce((newState, ticket) => {
                    newState[ticket.id] = ticket;
                    return newState;
                }, { ...state });
            } else {
                return { ...state, [action.ticket.id]: action.ticket };
            }

        default: return state;
    }
};