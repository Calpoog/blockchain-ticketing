export const ADD_LOG = 'ADD_LOG';

export const addLog = (contractName, log) => ({
    type: ADD_LOG,
    contractName,
    log
});

export const actions = {
    addLog
};

export const types = {
    ADD_LOG
};