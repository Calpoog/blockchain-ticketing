const web3Reducer = (state = null, action) => {
  if (action.type === 'WEB3_INITIALIZED') return action.web3;

  return state
}

export default web3Reducer
