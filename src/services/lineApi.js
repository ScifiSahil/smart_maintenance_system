/**
 * ─── LINE MASTER SERVICE ─────────────────────────────────────────────
 * smartpm_line_master ke liye REST calls — apiAuth.js ke through.
 * Equipment Register ke "Line Name" filter dropdown, aur Configuration >
 * Line Master CRUD page — dono isi service se data lete hain.
 * ─────────────────────────────────────────────────────────────────────
 */

import apiAuth from "./apiAuth";

const LINE_MASTER_URL = "/api/v1/collection/smartpm_line_master";

// List — response shape: { objects: [...], result_complete: true }
export function fetchLines() {
  return apiAuth.get(LINE_MASTER_URL);
}

export function createLine(data) {
  return apiAuth.post(LINE_MASTER_URL, data);
}

export function updateLine(cdbObjectId, data) {
  return apiAuth.putOrPatch(`${LINE_MASTER_URL}/${cdbObjectId}`, data);
}

export function deleteLine(cdbObjectId) {
  return apiAuth.delete(`${LINE_MASTER_URL}/${cdbObjectId}`);
}