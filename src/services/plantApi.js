/**
 * ─── PLANT MASTER SERVICE ────────────────────────────────────────────
 * smartpm_plant_master ke liye REST calls — apiAuth.js ke through.
 * Plant filter dropdown (Equipment Register) aur Configuration > Plant
 * Master CRUD page — dono isi service se data lete hain.
 * ─────────────────────────────────────────────────────────────────────
 */

import apiAuth from "./apiAuth";

const PLANT_MASTER_URL = "/api/v1/collection/smartpm_plant_master";

// List — response shape: { objects: [...], result_complete: true }
export function fetchPlants() {
  return apiAuth.get(PLANT_MASTER_URL);
}

export function createPlant(data) {
  return apiAuth.post(PLANT_MASTER_URL, data);
}

export function updatePlant(cdbObjectId, data) {
  return apiAuth.putOrPatch(`${PLANT_MASTER_URL}/${cdbObjectId}`, data);
}

export function deletePlant(cdbObjectId) {
  return apiAuth.delete(`${PLANT_MASTER_URL}/${cdbObjectId}`);
}
