/**
 * ─── EQUIPMENT REDUCER ───────────────────────────────────────────────
 * reducers/index.js mein combineReducers ke andar register karna hai:
 *   import equipment from './equipmentReducer';
 *   export default combineReducers({ ..., equipment });
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  EQUIPMENT_LOAD_REQUEST,
  EQUIPMENT_LOAD_SUCCESS,
  EQUIPMENT_LOAD_FAILURE,
  EQUIPMENT_SET_FILTERS,
} from "../actions/equipmentActions";

const initialState = {
  items: [],
  filters: {
    plant_code: "all",
    status: "all",
    search: "",
    line_name: "all",
    machine_name: "all",
    assembly: "all",
    sub_assembly: "all",
  },
  status: "idle",
  error: null,
};

export default function equipmentReducer(state = initialState, action) {
  switch (action.type) {
    case EQUIPMENT_LOAD_REQUEST:
      return { ...state, status: "loading" };
    case EQUIPMENT_LOAD_SUCCESS:
      return { ...state, status: "succeeded", items: action.payload };
    case EQUIPMENT_LOAD_FAILURE:
      return { ...state, status: "failed", error: action.payload };
    case EQUIPMENT_SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}