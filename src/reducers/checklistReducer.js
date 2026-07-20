/**
 * ─── CHECKLIST REDUCER ───────────────────────────────────────────────
 * store.js ke rootReducer mein register karna hai:
 *   import checklist from './reducers/checklistReducer';
 *   const rootReducer = combineReducers({ ..., checklist });
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  CHECKLIST_HEADERS_LOAD_REQUEST,
  CHECKLIST_HEADERS_LOAD_SUCCESS,
  CHECKLIST_HEADERS_LOAD_FAILURE,
  CHECKLIST_ITEMS_LOAD_REQUEST,
  CHECKLIST_ITEMS_LOAD_SUCCESS,
  CHECKLIST_ITEMS_LOAD_FAILURE,
  CHECKLIST_SET_SELECTED_HEADER,
} from "../actions/checklistActions";

const initialState = {
  headers: { items: [], status: "idle", error: null },
  items: { items: [], status: "idle", error: null },
  selectedHeaderId: null,
};

export default function checklistReducer(state = initialState, action) {
  switch (action.type) {
    case CHECKLIST_HEADERS_LOAD_REQUEST:
      return { ...state, headers: { ...state.headers, status: "loading" } };
    case CHECKLIST_HEADERS_LOAD_SUCCESS:
      return {
        ...state,
        headers: { items: action.payload, status: "succeeded", error: null },
        // Pehli baar load hone par first header auto-select ho jaye
        selectedHeaderId:
          state.selectedHeaderId ?? action.payload[0]?.cdb_object_id ?? null,
      };
    case CHECKLIST_HEADERS_LOAD_FAILURE:
      return { ...state, headers: { ...state.headers, status: "failed", error: action.payload } };

    case CHECKLIST_ITEMS_LOAD_REQUEST:
      return { ...state, items: { ...state.items, status: "loading" } };
    case CHECKLIST_ITEMS_LOAD_SUCCESS:
      return { ...state, items: { items: action.payload, status: "succeeded", error: null } };
    case CHECKLIST_ITEMS_LOAD_FAILURE:
      return { ...state, items: { ...state.items, status: "failed", error: action.payload } };

    case CHECKLIST_SET_SELECTED_HEADER:
      return { ...state, selectedHeaderId: action.payload };

    default:
      return state;
  }
}
