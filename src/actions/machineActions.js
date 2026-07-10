/**
 * ─── MACHINE MASTER ACTIONS ──────────────────────────────────────────
 * Action types + CRUD thunks. Reducer: reducers/machinesReducer.js
 * smartpm_machine_master se Machine Name filter dropdown (Equipment
 * Register) aur Configuration > Machine Master CRUD page — dono isi se
 * chalte hain.
 * ─────────────────────────────────────────────────────────────────────
 */

import { fetchMachines, createMachine, updateMachine, deleteMachine } from "../services/machineApi";

export const MACHINE_MASTER_LOAD_REQUEST = "MACHINE_MASTER_LOAD_REQUEST";
export const MACHINE_MASTER_LOAD_SUCCESS = "MACHINE_MASTER_LOAD_SUCCESS";
export const MACHINE_MASTER_LOAD_FAILURE = "MACHINE_MASTER_LOAD_FAILURE";

// Machine master list load karta hai — response.objects array nikalta hai.
// Har machine apne line_name aur plant_code ke saath aata hai — isliye
// Machine dropdown/table ko selected Plant/Line ke hisaab se scope kiya ja sakta hai.
export function loadMachines() {
  return async function (dispatch) {
    dispatch({ type: MACHINE_MASTER_LOAD_REQUEST });
    try {
      const res = await fetchMachines();
      const items = (res.objects || [])
        .map((o) => ({
          cdb_object_id: o.cdb_object_id,
          plant_code: o.plant_code,
          line_name: o.line_name,
          machine_name: o.machine_name,
        }))
        .sort((a, b) => String(a.machine_name).localeCompare(String(b.machine_name)));
      dispatch({ type: MACHINE_MASTER_LOAD_SUCCESS, payload: items });
    } catch (err) {
      dispatch({ type: MACHINE_MASTER_LOAD_FAILURE, payload: err.message });
    }
  };
}

// Naya machine banata hai — success par list refresh karta hai
export function addMachine(data) {
  return async function (dispatch) {
    try {
      await createMachine(data);
      dispatch(loadMachines());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

// Machine update karta hai (cdb_object_id se)
export function editMachine(cdbObjectId, data) {
  return async function (dispatch) {
    try {
      await updateMachine(cdbObjectId, data);
      dispatch(loadMachines());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

// Machine delete karta hai (cdb_object_id se)
export function removeMachine(cdbObjectId) {
  return async function (dispatch) {
    try {
      await deleteMachine(cdbObjectId);
      dispatch(loadMachines());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}