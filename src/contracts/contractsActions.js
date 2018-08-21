export const ADD_CONTRACT = 'ADD_CONTRACT';

export const addContract = (name, instance) => ({
    type: ADD_CONTRACT,
    name,
    instance
});

export const actions = {
    addContract
};

export const types = {
    ADD_CONTRACT
};