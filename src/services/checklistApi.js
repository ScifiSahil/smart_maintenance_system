/**
 * ─── CHECKLIST SERVICE ───────────────────────────────────────────────
 * REST calls for the PM Checklist Builder — routed through apiAuth.js.
 * Two collections: header (one checklist = one equipment + frequency)
 * and item (the check points inside a checklist).
 * Classnames match PmAdmChkHeader / AdmChkItm defined in __init__.py.
 * ─────────────────────────────────────────────────────────────────────
 */

import apiAuth from "./apiAuth";

const HEADER_URL = "/api/v1/collection/smartpm_admin_checklist_header";
const ITEM_URL = "/api/v1/collection/smartpm_admin_checklist_item";

// ── Checklist Header (CP-101 — Centrifugal Pump Daily Checklist) ──
export function fetchChecklistHeaders() {
  return apiAuth.get(HEADER_URL);
}

export function createChecklistHeader(data) {
  return apiAuth.post(HEADER_URL, data);
}

export function updateChecklistHeader(cdbObjectId, data) {
  return apiAuth.putOrPatch(`${HEADER_URL}/${cdbObjectId}`, data);
}

export function deleteChecklistHeader(cdbObjectId) {
  return apiAuth.delete(`${HEADER_URL}/${cdbObjectId}`);
}

// ── Checklist Items (Bearing Temperature Check, Oil Level, etc.) ──
export function fetchChecklistItems() {
  return apiAuth.get(ITEM_URL);
}

export function createChecklistItem(data) {
  return apiAuth.post(ITEM_URL, data);
}

export function updateChecklistItem(cdbObjectId, data) {
  return apiAuth.putOrPatch(`${ITEM_URL}/${cdbObjectId}`, data);
}

export function deleteChecklistItem(cdbObjectId) {
  return apiAuth.delete(`${ITEM_URL}/${cdbObjectId}`);
}