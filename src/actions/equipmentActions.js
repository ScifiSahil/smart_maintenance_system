/**
 * ─── EQUIPMENT ACTIONS ───────────────────────────────────────────────
 * Action types + thunk creators. Reducer: reducers/equipmentReducer.js
 * Backend: cdb collection API — errors apiAuth se throw hote hain,
 * {success} field nahi hota, isliye try/catch se success/fail decide hota hai.
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  fetchEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from "../services/equipmentApi";

export const EQUIPMENT_LOAD_REQUEST = "EQUIPMENT_LOAD_REQUEST";
export const EQUIPMENT_LOAD_SUCCESS = "EQUIPMENT_LOAD_SUCCESS";
export const EQUIPMENT_LOAD_FAILURE = "EQUIPMENT_LOAD_FAILURE";
export const EQUIPMENT_SET_FILTERS = "EQUIPMENT_SET_FILTERS";

// Filters ko update karta hai — list dobara load component se hi call hoga
export function setEquipmentFilters(filters) {
  return { type: EQUIPMENT_SET_FILTERS, payload: filters };
}

// Equipment list load karta hai — response.objects array nikalta hai
export function loadEquipment() {
  return async function (dispatch) {
    dispatch({ type: EQUIPMENT_LOAD_REQUEST });
    try {
      const res = await fetchEquipment();
      dispatch({ type: EQUIPMENT_LOAD_SUCCESS, payload: res.objects || [] });
    } catch (err) {
      dispatch({ type: EQUIPMENT_LOAD_FAILURE, payload: err.message });
    }
  };
}

// Naya equipment banata hai — success par list refresh karta hai
// Return value { ok: true } ya { ok: false, message } — component isi se UI decide karega
export function addEquipment(data) {
  return async function (dispatch) {
    try {
      await createEquipment(data);
      dispatch(loadEquipment());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

// Equipment update karta hai (cdb_object_id se)
export function editEquipment(cdbObjectId, data) {
  return async function (dispatch) {
    try {
      await updateEquipment(cdbObjectId, data);
      dispatch(loadEquipment());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

// Equipment delete karta hai (cdb_object_id se)
export function removeEquipment(cdbObjectId) {
  return async function (dispatch) {
    try {
      await deleteEquipment(cdbObjectId);
      dispatch(loadEquipment());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}
