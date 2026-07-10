/**
 * ─── LINES REDUCER ───────────────────────────────────────────────────
 * smartpm_line_master ka data store karta hai — plantsReducer jaisa pattern.
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  LINE_MASTER_LOAD_REQUEST,
  LINE_MASTER_LOAD_SUCCESS,
  LINE_MASTER_LOAD_FAILURE,
} from "../actions/lineActions";

const initialState = {
  items: [],      // [{ cdb_object_id, plant_code, line_name }, ...]
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

export default function linesReducer(state = initialState, action) {
  switch (action.type) {
    case LINE_MASTER_LOAD_REQUEST:
      return { ...state, status: "loading" };
    case LINE_MASTER_LOAD_SUCCESS:
      return { ...state, status: "succeeded", items: action.payload, error: null };
    case LINE_MASTER_LOAD_FAILURE:
      return { ...state, status: "failed", error: action.payload };
    default:
      return state;
  }
}
