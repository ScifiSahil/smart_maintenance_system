/**
 * ─── MACHINES REDUCER ────────────────────────────────────────────────
 * smartpm_machine_master ka data store karta hai — plantsReducer jaisa pattern.
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  MACHINE_MASTER_LOAD_REQUEST,
  MACHINE_MASTER_LOAD_SUCCESS,
  MACHINE_MASTER_LOAD_FAILURE,
} from "../actions/machineActions";

const initialState = {
  items: [],      // [{ cdb_object_id, plant_code, line_name, machine_name }, ...]
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

export default function machinesReducer(state = initialState, action) {
  switch (action.type) {
    case MACHINE_MASTER_LOAD_REQUEST:
      return { ...state, status: "loading" };
    case MACHINE_MASTER_LOAD_SUCCESS:
      return { ...state, status: "succeeded", items: action.payload, error: null };
    case MACHINE_MASTER_LOAD_FAILURE:
      return { ...state, status: "failed", error: action.payload };
    default:
      return state;
  }
}
