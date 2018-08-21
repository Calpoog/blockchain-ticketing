export const ADD_TICKET = 'ADD_TICKET';

export const addTicket = ticket => ({
    type: ADD_TICKET,
    ticket
});

export const actions = {
    addTicket
};

export const types = {
    ADD_TICKET
};