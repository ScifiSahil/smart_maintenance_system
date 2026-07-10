/**
 * ─── MACHINE MASTER SERVICE ──────────────────────────────────────────
 * smartpm_machine_master ke liye REST calls — apiAuth.js ke through.
 * Equipment Register ke "Machine Name" filter dropdown, aur Configuration >
 * Machine Master CRUD page — dono isi service se data lete hain.
 * ─────────────────────────────────────────────────────────────────────
 */

import apiAuth from "./apiAuth";

const MACHINE_MASTER_URL = "/api/v1/collection/smartpm_machine_master";

// List — response shape: { objects: [...], result_complete: true }
export function fetchMachines() {
  return apiAuth.get(MACHINE_MASTER_URL);
}

export function createMachine(data) {
  return apiAuth.post(MACHINE_MASTER_URL, data);
}

export function updateMachine(cdbObjectId, data) {
  return apiAuth.putOrPatch(`${MACHINE_MASTER_URL}/${cdbObjectId}`, data);
}

export function deleteMachine(cdbObjectId) {
  return apiAuth.delete(`${MACHINE_MASTER_URL}/${cdbObjectId}`);
}