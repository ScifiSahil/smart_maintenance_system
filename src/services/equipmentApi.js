/**
 * ─── EQUIPMENT SERVICE ───────────────────────────────────────────────
 * Equipment Register ke liye REST calls — apiAuth.js ke through.
 * ─────────────────────────────────────────────────────────────────────
 */

import apiAuth from "./apiAuth";

const EQUIPMENT_URL = "/api/v1/collection/smartpm_admin_equipment_master";

// List — response shape: { objects: [...], result_complete: true }
export function fetchEquipment() {
  return apiAuth.get(EQUIPMENT_URL);
}

export function fetchEquipmentById(cdbObjectId) {
  return apiAuth.get(`${EQUIPMENT_URL}/${cdbObjectId}`);
}

export function createEquipment(data) {
  return apiAuth.post(EQUIPMENT_URL, data);
}

export function updateEquipment(cdbObjectId, data) {
  return apiAuth.putOrPatch(`${EQUIPMENT_URL}/${cdbObjectId}`, data);
}

export function deleteEquipment(cdbObjectId) {
  return apiAuth.delete(`${EQUIPMENT_URL}/${cdbObjectId}`);
}
