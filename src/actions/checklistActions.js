/**
 * ─── CHECKLIST ACTIONS ───────────────────────────────────────────────
 * Action types + thunk creators for PM Checklist Builder.
 * Reducer: reducers/checklistReducer.js
 * Pattern equipmentActions.js jaisa hi hai — try/catch se success/fail.
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  fetchChecklistHeaders,
  createChecklistHeader,
  updateChecklistHeader,
  deleteChecklistHeader,
  fetchChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "../services/checklistApi";

export const CHECKLIST_HEADERS_LOAD_REQUEST = "CHECKLIST_HEADERS_LOAD_REQUEST";
export const CHECKLIST_HEADERS_LOAD_SUCCESS = "CHECKLIST_HEADERS_LOAD_SUCCESS";
export const CHECKLIST_HEADERS_LOAD_FAILURE = "CHECKLIST_HEADERS_LOAD_FAILURE";

export const CHECKLIST_ITEMS_LOAD_REQUEST = "CHECKLIST_ITEMS_LOAD_REQUEST";
export const CHECKLIST_ITEMS_LOAD_SUCCESS = "CHECKLIST_ITEMS_LOAD_SUCCESS";
export const CHECKLIST_ITEMS_LOAD_FAILURE = "CHECKLIST_ITEMS_LOAD_FAILURE";

export const CHECKLIST_SET_SELECTED_HEADER = "CHECKLIST_SET_SELECTED_HEADER";

// Kaunsi checklist header abhi builder mein khuli hai — UI select se set hota hai
export function setSelectedChecklistHeader(cdbObjectId) {
  return { type: CHECKLIST_SET_SELECTED_HEADER, payload: cdbObjectId };
}

// ── Headers ──
export function loadChecklistHeaders() {
  return async function (dispatch) {
    dispatch({ type: CHECKLIST_HEADERS_LOAD_REQUEST });
    try {
      const res = await fetchChecklistHeaders();
      dispatch({ type: CHECKLIST_HEADERS_LOAD_SUCCESS, payload: res.objects || [] });
    } catch (err) {
      dispatch({ type: CHECKLIST_HEADERS_LOAD_FAILURE, payload: err.message });
    }
  };
}

// Naya checklist header banata hai (equipment + frequency choose karke)
// Success par headers list refresh + naya header select ho jata hai
export function addChecklistHeader(data) {
  return async function (dispatch) {
    try {
      const res = await createChecklistHeader(data);
      await dispatch(loadChecklistHeaders());
      if (res?.cdb_object_id) {
        dispatch(setSelectedChecklistHeader(res.cdb_object_id));
      }
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

export function editChecklistHeader(cdbObjectId, data) {
  return async function (dispatch) {
    try {
      await updateChecklistHeader(cdbObjectId, data);
      dispatch(loadChecklistHeaders());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

export function removeChecklistHeader(cdbObjectId) {
  return async function (dispatch) {
    try {
      await deleteChecklistHeader(cdbObjectId);
      dispatch(loadChecklistHeaders());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

// ── Items (Check Points) ──
export function loadChecklistItems() {
  return async function (dispatch) {
    dispatch({ type: CHECKLIST_ITEMS_LOAD_REQUEST });
    try {
      const res = await fetchChecklistItems();
      dispatch({ type: CHECKLIST_ITEMS_LOAD_SUCCESS, payload: res.objects || [] });
    } catch (err) {
      dispatch({ type: CHECKLIST_ITEMS_LOAD_FAILURE, payload: err.message });
    }
  };
}

// Naya check point banata hai — success par items list refresh
export function addCheckPoint(data) {
  return async function (dispatch) {
    try {
      await createChecklistItem(data);
      dispatch(loadChecklistItems());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

export function editCheckPoint(cdbObjectId, data) {
  return async function (dispatch) {
    try {
      await updateChecklistItem(cdbObjectId, data);
      dispatch(loadChecklistItems());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}

export function removeCheckPoint(cdbObjectId) {
  return async function (dispatch) {
    try {
      await deleteChecklistItem(cdbObjectId);
      dispatch(loadChecklistItems());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
}
