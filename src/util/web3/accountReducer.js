const accountReducer = (state = null, action) => {
  if (action.type === 'USE_ACCOUNT') return action.account;

  return state
}

export default accountReducer
