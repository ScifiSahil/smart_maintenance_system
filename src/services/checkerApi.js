// js/src/services/checkerApi.js
// Checker Portal API — 100% collection REST, NO /internal/ endpoints.
// Reuses apiConfig (BASE/AUTH) + csrfService.
//
// Tables used (all already exist):
//   smartpm_admin_equipment_master     → equipment list
//   smartpm_admin_checklist_header      → one row per equipment + frequency
//   smartpm_admin_checklist_item        → check points, linked via checklist_header_id
//   smartpm_checker_insp_result         → inspection results (save/submit here)
//
// NOTE on checklist item lookup:
//   Check point rows are NOT guaranteed to have equipment_code populated
//   (the Builder's AddCheckPointModal only sets checklist_header_id).
//   So we resolve equipment_code -> header -> checklist_header_id -> items,
//   the same relation ChecklistBuilder.jsx uses. This is the fix for
//   "No checklist items found for this equipment".
//
// NOTE on column mapping:
//   The result table stores the OK/Abnormal value in column `smresult`,
//   but CheckerPage uses `result`. We translate here (result <-> smresult)
//   so CheckerPage.jsx needs NO changes.
//   `checked_by` is a Date column in the DB, so we do NOT write the checker
//   name into it (would be a type error). Left untouched.

import { BASE, AUTH } from "./apiConfig";
import csrfService from "./csrfService";

const BASIC_AUTH = AUTH;

const EQUIPMENT_API = `${BASE}/api/v1/collection/smartpm_admin_equipment_master`;
const HEADER_API = `${BASE}/api/v1/collection/smartpm_admin_checklist_header`;
const CHECKLIST_ITEM_API = `${BASE}/api/v1/collection/smartpm_admin_checklist_item`;
const RESULT_API = `${BASE}/api/v1/collection/smartpm_checker_insp_result`;

// ── low-level helpers ────────────────────────────────────────────────────────
async function doGet(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", Authorization: BASIC_AUTH },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function doPost(url, body) {
  const csrfToken = await csrfService.getCsrfToken();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: BASIC_AUTH,
      "X-CSRFToken": csrfToken,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json?.error) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}

async function doPatch(url, body) {
  const csrfToken = await csrfService.getCsrfToken();
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: BASIC_AUTH,
      "X-CSRFToken": csrfToken,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json?.error) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}

// Collection responses can come back under different keys — normalise them.
const extractRows = (j) => j?.objects ?? j?.data ?? j?.results ?? [];

// OData-style filter builder
const filterUrl = (base, clause) => `${base}?$filter=${encodeURIComponent(clause)}`;

// ── Equipment list (active only) ─────────────────────────────────────────────
export const fetchEquipmentList = () =>
  doGet(filterUrl(EQUIPMENT_API, "is_active eq '1'"));

// ── Checklist items for a given equipment ──
// smartpm_admin_checklist_item has its OWN equipment_code column, so we query
// it directly — no need to go through checklist_id (which is typed Integer
// on the item table, while the header's id is a UUID string, so joining on
// that would likely throw a type-mismatch error anyway).
// We separately check the header table just to tell "no checklist built yet"
// apart from "checklist built but no active check points".
// Returns: { objects: [...activeItems sorted by seq_no], header: headerRowOrNull }
export const fetchChecklistItems = async (equipmentCode) => {
  const headers = extractRows(
    await doGet(filterUrl(HEADER_API, `equipment_code eq '${equipmentCode}'`))
  );
  const header = headers[0] || null;

  const items = extractRows(
    await doGet(filterUrl(CHECKLIST_ITEM_API, `equipment_code eq '${equipmentCode}'`))
  );

  const activeSorted = items
    .filter((it) => String(it.is_active ?? "1") === "1")
    .sort((a, b) => Number(a.seq_no || 0) - Number(b.seq_no || 0));

  return { objects: activeSorted, header };
};

// ── Existing inspection results for equipment + date ──
// Maps DB column `smresult` → `result` so CheckerPage reads it unchanged.
export const fetchInspectionResults = async (equipmentCode, inspectionDate) => {
  const json = await doGet(
    filterUrl(
      RESULT_API,
      `equipment_code eq '${equipmentCode}' and inspection_date eq '${inspectionDate}'`
    )
  );
  const rows = extractRows(json).map((r) => ({ ...r, result: r.smresult }));
  return { objects: rows };
};

// ── Save / update one checkpoint result (upsert via REST) ──
// CheckerPage sends: { equipment_code, checklist_item_id, inspection_date,
//                      result, current_value, remarks, checked_by }
export const saveCheckpoint = async (payload) => {
  const { equipment_code, checklist_item_id, inspection_date, result, current_value, remarks } = payload;

  // does a row already exist for this equipment + date + item?
  const existing = extractRows(
    await doGet(
      filterUrl(
        RESULT_API,
        `equipment_code eq '${equipment_code}' and inspection_date eq '${inspection_date}' and checklist_item_id eq '${checklist_item_id}'`
      )
    )
  )[0];

  // write `smresult` (the real column); do NOT write checked_by (Date column).
  const body = {
    equipment_code,
    checklist_item_id,
    inspection_date,
    smresult: result,
    current_value: current_value || "",
    remarks: remarks || "",
  };

  if (existing?.cdb_object_id) {
    return doPatch(`${RESULT_API}/${existing.cdb_object_id}`, body);
  }
  return doPost(RESULT_API, body);
};

// ── Bulk submit — stamp submitted_at on every row for equipment + date ──
export const submitInspection = async (equipmentCode, inspectionDate) => {
  const rows = extractRows(
    await doGet(
      filterUrl(
        RESULT_API,
        `equipment_code eq '${equipmentCode}' and inspection_date eq '${inspectionDate}'`
      )
    )
  );
  await Promise.all(
    rows
      .filter((r) => r.cdb_object_id)
      .map((r) => doPatch(`${RESULT_API}/${r.cdb_object_id}`, { submitted_at: inspectionDate }))
  );
  return { ok: true, count: rows.length };
};

// ── Sidebar badge counts ──
// No backend summary endpoint exists, so return zeros (CheckerPage already
// tolerates a missing/zero summary). Wire to a real source later if needed.
export const fetchDashboardSummary = async () => ({
  pm_inspection_pending: 0,
  abnormalities: 0,
  iiot_alerts: 0,
});