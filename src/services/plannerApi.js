// js/src/services/plannerApi.js
// Planner Portal API — real REST collections, no localStorage.
//
// Sources merged into the Consolidated List:
//   smartpm_checker_abnormality_log   → manually logged abnormalities (Checker's "Log Abnormality" form)
//   smartpm_checker_insp_result       → checklist rows where smresult = 'Abnormal'
//   smartpm_admin_checklist_item      → joined in just to get a readable title for checklist-sourced items
//
// Work orders live in their own table so the abnormality source rows are
// never mutated — a work order just carries a source_type/source_id pointer
// back to whichever row triggered it.
//   smartpm_planner_work_order        → created here via generateWorkOrder()

import { BASE, AUTH } from "./apiConfig";
import csrfServiceImport from "./csrfService";

const BASIC_AUTH = AUTH;

const ABNORMALITY_LOG_API = `${BASE}/api/v1/collection/smartpm_checker_abnormality_log`;
const RESULT_API = `${BASE}/api/v1/collection/smartpm_checker_insp_result`;
const CHECKLIST_ITEM_API = `${BASE}/api/v1/collection/smartpm_admin_checklist_item`;
const WORK_ORDER_API = `${BASE}/api/v1/collection/smartpm_planner_work_order`;

async function getCsrfToken() {
  return await csrfServiceImport.getCsrfToken();
}

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

const extractRows = (j) => j?.objects ?? j?.data ?? j?.results ?? [];
const filterUrl = (base, clause) => `${base}?$filter=${encodeURIComponent(clause)}`;

function normalizePriority(p) {
  const v = (p || "medium").toLowerCase();
  return ["critical", "high", "medium", "low"].includes(v) ? v : "medium";
}

// Splits an ISO-ish date/datetime string into { date, time } for display.
function fmtDatePart(raw) {
  if (!raw) return { date: "", time: "" };
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return { date: raw, time: "" };
    return { date: d.toISOString().slice(0, 10), time: d.toTimeString().slice(0, 5) };
  } catch {
    return { date: raw, time: "" };
  }
}

// ── Consolidated List — merges both abnormality sources with any existing WO ─
// Each returned item carries `wo` (the matching work_order row, or null) so
// the caller can decide whether it's "awaiting WO" or already in progress.
export const fetchConsolidatedList = async () => {
  const [manualJson, resultJson, itemsJson, woJson] = await Promise.all([
    doGet(ABNORMALITY_LOG_API),
    doGet(filterUrl(RESULT_API, "smresult eq 'Abnormal'")),
    doGet(CHECKLIST_ITEM_API),
    doGet(WORK_ORDER_API),
  ]);

  const itemMap = {};
  extractRows(itemsJson).forEach((it) => { itemMap[it.cdb_object_id] = it; });

  const woBySource = {};
  extractRows(woJson).forEach((wo) => {
    woBySource[`${wo.source_type}:${wo.source_id}`] = wo;
  });

  const manualItems = extractRows(manualJson).map((r) => {
    const key = `manual:${r.cdb_object_id}`;
    const { date, time } = fmtDatePart(r.logged_at);
    return {
      id: key,
      sourceType: "manual",
      sourceId: r.cdb_object_id,
      checkPoint: "Manual Abnormality Log",
      machine: r.equipment_code,
      observed: r.observed_value,
      cause: r.probable_cause,
      remarks: r.remarks,
      priority: normalizePriority(r.priority),
      loggedBy: r.logged_by,
      loggedDate: date,
      loggedTime: time,
      wo: woBySource[key] || null,
    };
  });

  const checklistItems = extractRows(resultJson).map((r) => {
    const key = `checklist:${r.cdb_object_id}`;
    const item = itemMap[r.checklist_item_id] || {};
    const { date, time } = fmtDatePart(r.inspection_date);
    return {
      id: key,
      sourceType: "checklist",
      sourceId: r.cdb_object_id,
      checkPoint: item.title || "Checklist Check Point",
      machine: r.equipment_code,
      observed: r.current_value,
      cause: "",
      remarks: r.remarks,
      priority: "medium",
      loggedBy: "",
      loggedDate: date,
      loggedTime: time,
      wo: woBySource[key] || null,
    };
  });

  return [...manualItems, ...checklistItems];
};

// ── All raised work orders (used by Work Orders / Rework tabs later) ────────
export const fetchWorkOrders = async () => {
  const rows = extractRows(await doGet(WORK_ORDER_API));
  return rows.sort((a, b) => new Date(b.planned_at || 0) - new Date(a.planned_at || 0));
};

// ── Generate a Work Order + assign executor(s) for one abnormality item ─────
// item: a normalized item from fetchConsolidatedList (has sourceType/sourceId/…)
// plan: { executors: [{name, role}], scheduledDate, scheduledTime, hours, spares, notes, sopRef }
export const generateWorkOrder = async (item, plan) => {
  const existingWOs = await fetchWorkOrders();
  const woNum = `WO-${new Date().getFullYear()}-${String(2040 + existingWOs.length).padStart(4, "0")}`;
  const lead = plan.executors.find((e) => e.role === "Lead") || plan.executors[0];
  const allExecutors = plan.executors.map((e) => `${e.name} (${e.role})`).join(", ");

  const body = {
    source_type: item.sourceType,
    source_id: item.sourceId,
    equipment_code: item.machine,
    check_point: item.checkPoint,
    observed_value: item.observed || "",
    probable_cause: item.cause || "",
    remarks: item.remarks || "",
    priority: item.priority,
    logged_by: item.loggedBy || "",
    wo_ref: woNum,
    assigned_to: lead?.name || "",
    all_executors: allExecutors,
    scheduled_date: plan.scheduledDate,
    scheduled_time: plan.scheduledTime || "09:00",
    estimated_hours: plan.hours || "",
    spares_needed: plan.spares || "",
    planner_notes: plan.notes || "",
    sop_ref: plan.sopRef || "",
    status: "pending_executor",
    planned_at: new Date().toISOString(),
    rework_count: "0",
  };

  return doPost(WORK_ORDER_API, body);
};

// ── Update a work order's status (used by Rework/Audit flows later) ─────────
export const updateWorkOrderStatus = (woId, patch) =>
  doPatch(`${WORK_ORDER_API}/${woId}`, patch);