/**
 * ─── LINE MASTER ACTIONS ─────────────────────────────────────────────
 * Action types + CRUD thunks. Reducer: reducers/linesReducer.js
 * smartpm_line_master se Line Name filter dropdown (Equipment Register)
 * aur Configuration > Line Master CRUD page — dono isi se chalte hain.
 * ─────────────────────────────────────────────────────────────────────
 */

import { fetchLines, createLine, updateLine, deleteLine } from "../services/lineApi";

export const LINE_MASTER_LOAD_REQUEST = "LINE_MASTER_LOAD_REQUEST";
export const LINE_MASTER_LOAD_SUCCESS = "LINE_MASTER_LOAD_SUCCESS";
export const LINE_MASTER_LOAD_FAILURE = "LINE_MASTER_LOAD_FAILURE";

// Line master list load karta hai — response.objects array nikalta hai
export function loadLines() {
  return async function (dispatch) {
    dispatch({ type: LINE_MASTER_LOAD_REQUEST });
    try {
      const res = await fetchLines();
      const items = (res.objects || [])
        .map((o) => ({
          cdb_object_id: o.cdb_object_id,
          plant_code: o.plant_code,
          line_name: o.line_name,
        }))
        .sort((a, b) => String(a.line_name).localeCompare(String(b.line_name)));
      dispatch({ type: LINE_MASTER_LOAD_SUCCESS, payload: items });
    } catch (err) {
      dispatch({ type: LINE_MASTER_LOAD_FAILURE, payload: err.message });
    }
  };
}

// Naya line banata hai — success par list refresh karta hai
export function addLine(data) {
  return async function (dispatch) {
    try {
      await createLine(data);
      dispatch(loadLines());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

// Line update karta hai (cdb_object_id se)
export function editLine(cdbObjectId, data) {
  return async function (dispatch) {
    try {
      await updateLine(cdbObjectId, data);
      dispatch(loadLines());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

// Line delete karta hai (cdb_object_id se)
export function removeLine(cdbObjectId) {
  return async function (dispatch) {
    try {
      await deleteLine(cdbObjectId);
      dispatch(loadLines());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}
