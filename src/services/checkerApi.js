// js/src/services/checkerApi.js
// Checker Portal API — 100% collection REST, NO /internal/ endpoints.
// Reuses apiConfig (BASE/AUTH) + csrfService.
//
// Tables used (all already exist):
//   smartpm_admin_equipment_master   → equipment list
//   smartpm_admin_checklist_item      → checklist items (now has equipment_code)
//   smartpm_checker_insp_result       → inspection results (save/submit here)
//
// NOTE on column mapping:
//   The result table stores the OK/Abnormal value in column `smresult`,
//   but CheckerPage uses `result`. We translate here (result <-> smresult)
//   so CheckerPage.jsx needs NO changes.
//   `checked_by` is a Date column in the DB, so we do NOT write the checker
//   name into it (would be a type error). Left untouched.

import { BASE, AUTH } from "./apiConfig";
import csrfServiceImport from "./csrfService";

const BASIC_AUTH = AUTH;

const EQUIPMENT_API = `${BASE}/api/v1/collection/smartpm_admin_equipment_master`;
const HEADER_API = `${BASE}/api/v1/collection/smartpm_admin_checklist_header`;
const CHECKLIST_ITEM_API = `${BASE}/api/v1/collection/smartpm_admin_checklist_item`;
const RESULT_API = `${BASE}/api/v1/collection/smartpm_checker_insp_result`;
const ABNORMALITY_LOG_API = `${BASE}/api/v1/collection/smartpm_checker_abnormality_log`;

// ── Defensive CSRF token getter ──────────────────────────────────────────────
// csrfService.js's export shape can vary depending on how it was written
// (a plain function, an object with a method, or an object with a token
// property already fetched). This wrapper tries every common shape instead
// of assuming `csrfService()` is directly callable — which was throwing:
//   "(0, _csrfService__WEBPACK_IMPORTED_MODULE_1__.default) is not a function"
async function getCsrfToken() {
  const svc = csrfServiceImport;

  // Case 1: default export IS a function -> csrfService()
  if (typeof svc === "function") {
    return await svc();
  }

  // Case 2: default export is an object with a function on it
  if (svc && typeof svc.getToken === "function") {
    return await svc.getToken();
  }
  if (svc && typeof svc.fetchToken === "function") {
    return await svc.fetchToken();
  }
  if (svc && typeof svc.default === "function") {
    return await svc.default();
  }

  // Case 3: default export is already the token (string) or an object
  // holding it under a known key.
  if (typeof svc === "string") {
    return svc;
  }
  if (svc && typeof svc.token === "string") {
    return svc.token;
  }
  if (svc && typeof svc.csrfToken === "string") {
    return svc.csrfToken;
  }

  // Nothing matched — fail loudly with a clear message instead of a cryptic
  // webpack module error, so this is easy to spot if csrfService.js changes.
  console.error("checkerApi: unrecognized csrfService export shape:", svc);
  throw new Error(
    "Unable to resolve CSRF token — check csrfService.js export format"
  );
}

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
  const csrfToken = await getCsrfToken();
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
  const csrfToken = await getCsrfToken();
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

// ── Checklist items for a given equipment + header existence check ──────────
// Fetches BOTH the checklist header (to know if a checklist was ever built
// for this equipment) and the items (the actual check points), filtered by
// equipment_code on both tables. CheckerPage.jsx reads `.header` (boolean)
// and `.objects` (the item rows) from this response.
export const fetchChecklistItems = async (equipmentCode) => {
  const [headerJson, itemsJson] = await Promise.all([
    doGet(filterUrl(HEADER_API, `equipment_code eq '${equipmentCode}'`)),
    doGet(filterUrl(CHECKLIST_ITEM_API, `equipment_code eq '${equipmentCode}'`)),
  ]);

  const headerRows = extractRows(headerJson);
  const itemRows = extractRows(itemsJson);

  return {
    objects: itemRows,
    header: headerRows.length > 0,
  };
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

// ── Abnormalities module — every "Abnormal" result across ALL equipment ──
// Single query on `smresult eq 'Abnormal'` (no equipment loop needed), then
// joined client-side against the checklist item list to attach a readable
// title + limit value. This is real data — no new tables required.
export const fetchAbnormalResults = async () => {
  const [resultsJson, itemsJson] = await Promise.all([
    doGet(filterUrl(RESULT_API, "smresult eq 'Abnormal'")),
    doGet(CHECKLIST_ITEM_API), // fetched once, unfiltered, to map id -> title/limit
  ]);

  const itemMap = {};
  extractRows(itemsJson).forEach((it) => { itemMap[it.cdb_object_id] = it; });

  const rows = extractRows(resultsJson)
    .map((r) => ({
      ...r,
      result: r.smresult,
      item_title: itemMap[r.checklist_item_id]?.title || "Unknown check point",
      limit_value: itemMap[r.checklist_item_id]?.limit_value || "",
    }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return { objects: rows };
};

// ── Manually logged abnormalities (Log Abnormality form) ──
// Table: smartpm_checker_abnormality_log
// Columns: equipment_code, priority, observed_value, probable_cause, remarks,
//          photo1, photo2, photo3, logged_by, logged_at, log_status, created_at
export const fetchManualAbnormalities = async () => {
  const rows = extractRows(await doGet(ABNORMALITY_LOG_API)).sort(
    (a, b) => new Date(b.logged_at || b.created_at || 0) - new Date(a.logged_at || a.created_at || 0)
  );
  return { objects: rows };
};

// payload: { equipment_code, priority, observed_value, probable_cause, remarks,
//            photos: [name1, name2, name3], logged_by }
export const logAbnormality = (payload) => {
  const [photo1 = "", photo2 = "", photo3 = ""] = payload.photos || [];
  return doPost(ABNORMALITY_LOG_API, {
    equipment_code: payload.equipment_code,
    priority: payload.priority,
    observed_value: payload.observed_value || "",
    probable_cause: payload.probable_cause || "",
    remarks: payload.remarks || "",
    photo1,
    photo2,
    photo3,
    logged_by: payload.logged_by || "",
    logged_at: payload.logged_at || new Date().toISOString(),
    log_status: "Open",
  });
};

// ── Consolidated List — today's PM status across ALL equipment ──
// Single-shot queries only (no N+1 loop over equipment): headers + items are
// fetched unfiltered once, today's results are fetched with a date-only
// filter (no equipment_code), then everything is grouped client-side.
// Returns: [{ equipment_code, total, done, pending, submitted }, …]
// — only for equipment that actually has a checklist header built.
export const fetchTodayPmStatus = async (inspectionDate) => {
  const [headersJson, itemsJson, resultsJson] = await Promise.all([
    doGet(HEADER_API),
    doGet(CHECKLIST_ITEM_API),
    doGet(filterUrl(RESULT_API, `inspection_date eq '${inspectionDate}'`)),
  ]);

  const headerEquipCodes = new Set(extractRows(headersJson).map((h) => h.equipment_code));

  const totalByEquip = {};
  extractRows(itemsJson)
    .filter((it) => String(it.is_active ?? "1") === "1")
    .forEach((it) => {
      totalByEquip[it.equipment_code] = (totalByEquip[it.equipment_code] || 0) + 1;
    });

  const doneByEquip = {};
  const submittedByEquip = {};
  extractRows(resultsJson).forEach((r) => {
    if (!doneByEquip[r.equipment_code]) doneByEquip[r.equipment_code] = new Set();
    doneByEquip[r.equipment_code].add(r.checklist_item_id);
    if (r.submitted_at) submittedByEquip[r.equipment_code] = true;
  });

  return Object.keys(totalByEquip)
    .filter((code) => headerEquipCodes.has(code))
    .map((code) => {
      const total = totalByEquip[code] || 0;
      const done = doneByEquip[code]?.size || 0;
      return {
        equipment_code: code,
        total,
        done,
        pending: Math.max(total - done, 0),
        submitted: Boolean(submittedByEquip[code]),
      };
    });
};

// ── Frequency → "is this equipment's checklist due on this date?" ──────────
// ASSUMPTION (no start-date column exists on the header table to anchor
// weekly/monthly cycles to, so a fixed convention is used):
//   Daily     → every day
//   Weekly    → every Monday
//   Monthly   → the 1st of every month
//   Quarterly → the 1st of Jan / Apr / Jul / Oct
// Change this function if the real business rule differs.
function isDueOn(header, dateObj) {
  const freq = (header.frequency || "Daily").toLowerCase();
  const day = dateObj.getDay(); // 0 = Sunday, 1 = Monday
  const dom = dateObj.getDate();
  const month = dateObj.getMonth(); // 0-indexed
  if (freq === "daily") return true;
  if (freq === "weekly") return day === 1;
  if (freq === "monthly") return dom === 1;
  if (freq === "quarterly") return dom === 1 && [0, 3, 6, 9].includes(month);
  return false;
}

// ── Calendar data for one month ─────────────────────────────────────────────
// Returns a map: { "2026-07-21": [ { equipment_code, checklist_name, total, done, submitted }, … ] }
// Only dates that actually have a due checklist are included as keys.
export const fetchCalendarTasks = async (year, month /* 0-indexed */) => {
  const [headersJson, itemsJson, resultsJson] = await Promise.all([
    doGet(HEADER_API),
    doGet(CHECKLIST_ITEM_API),
    doGet(RESULT_API),
  ]);

  const headers = extractRows(headersJson);
  const items = extractRows(itemsJson).filter((it) => String(it.is_active ?? "1") === "1");
  const results = extractRows(resultsJson);

  // Ground truth for "which equipment has an active checklist" is the ITEM
  // table's equipment_code — not the header table's. The header's
  // equipment_code can drift (e.g. admin re-links a checklist to a
  // different equipment) while the items underneath keep their own
  // equipment_code, exactly like PM Inspection already reads items
  // directly without depending on the header link.
  const totalByEquip = {};
  items.forEach((it) => {
    totalByEquip[it.equipment_code] = (totalByEquip[it.equipment_code] || 0) + 1;
  });
  const equipCodes = Object.keys(totalByEquip);

  // Frequency + display name still come from the header table when a
  // matching one exists for that equipment_code; default to "Daily" if
  // no header is linked to this equipment at all.
  const freqByEquip = {};
  const nameByEquip = {};
  headers.forEach((h) => {
    if (!h.equipment_code) return;
    freqByEquip[h.equipment_code] = h.frequency || "Daily";
    nameByEquip[h.equipment_code] = h.checklist_name || h.equipment_code;
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dateMap = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const dueCodes = equipCodes.filter((code) =>
      isDueOn({ frequency: freqByEquip[code] || "Daily" }, dateObj)
    );
    if (dueCodes.length === 0) continue;

    dateMap[dateStr] = dueCodes.map((code) => {
      const total = totalByEquip[code] || 0;
      const dayResults = results.filter((r) => r.equipment_code === code && r.inspection_date === dateStr);
      const doneSet = new Set(dayResults.filter((r) => r.checklist_item_id).map((r) => r.checklist_item_id));
      const submitted = dayResults.some((r) => r.submitted_at);
      return {
        equipment_code: code,
        checklist_name: nameByEquip[code] || code,
        frequency: freqByEquip[code] || "Daily",
        total,
        done: doneSet.size,
        submitted,
      };
    });
  }

  return dateMap;
};