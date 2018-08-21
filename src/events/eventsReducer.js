import { ADD_EVENT } from './eventsActions';

export default function eventsReducer(state = {}, action) {
    switch (action.type) {
        case ADD_EVENT:
            if (action.event instanceof Array) {
                return action.event.reduce((newState, event) => {
                    newState[event.id] = event;
                    return newState;
                }, { ...state });
            } else {
                return { ...state, [action.event.id]: action.event };
            }

        default: return state;
    }
};