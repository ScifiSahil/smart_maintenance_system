// js/src/services/technicianApi.js
// Technician master — used by PlannerPage to populate executor dropdowns
// (Assign Executors row, Plan WO modal, Executor Calendar filter) instead of
// the old hardcoded name list.
//
// Table: smartpm_technician_master
// Columns: cdb_object_id, name, technician_role, plant_code, is_active, created_at

import { BASE, AUTH } from "./apiConfig";

const BASIC_AUTH = AUTH;
const TECHNICIAN_API = `${BASE}/api/v1/collection/smartpm_technician_master`;

async function doGet(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", Authorization: BASIC_AUTH },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const extractRows = (j) => j?.objects ?? j?.data ?? j?.results ?? [];
const filterUrl = (base, clause) => `${base}?$filter=${encodeURIComponent(clause)}`;

// Returns active technicians, sorted by name.
// Each row: { cdb_object_id, name, technician_role, plant_code, is_active }
export const fetchTechnicians = async () => {
  const rows = extractRows(await doGet(filterUrl(TECHNICIAN_API, "is_active eq '1'")));
  return rows.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
};
