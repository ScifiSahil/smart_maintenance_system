// reducers/plantsReducer.js
// Plant master ke liye chhota reducer — equipmentReducer jaisा pattern.

const initialState = {
  items: [],       // [{ plant_code, plant_name, cdb_object_id }, ...]
  status: 'idle',  // idle | loading | succeeded | failed
  error: '',
};

const plantsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PLANTS_LOAD_PENDING':
      return { ...state, status: 'loading', error: '' };

    case 'PLANTS_LOAD_FULFILLED':
      return { ...state, status: 'succeeded', items: action.payload, error: '' };

    case 'PLANTS_LOAD_REJECTED':
      return { ...state, status: 'failed', error: action.payload };

    default:
      return state;
  }
};

export default plantsReducer;