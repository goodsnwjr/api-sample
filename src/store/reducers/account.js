import { GET_LIST, UPDATE_USER } from '../actions/account';

const initialState = {
  list: [],
  total: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_LIST:
      return { ...state, ...action.payload };
    case UPDATE_USER:
      let newList = [...state.list];
      const target = newList.findIndex((item) => item.id === action.payload.id);
      if (target > -1) {
        newList[target] = action.payload;
      }
      return { ...state, list: newList };
    default:
      return state;
  }
};
