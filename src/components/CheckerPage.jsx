import { useState, useEffect, useCallback, useMemo } from "react";
import MyCalendarPanel from "./MyCalendarPanel";

import {
  fetchInspectionResults,
  saveCheckpoint,
  submitInspection,
  fetchDashboardSummary,
  fetchChecklistItems,
} from "../services/checkerApi";
import { fetchEquipment } from "../services/equipmentApi";
import { fetchPlants } from "../services/plantApi";
import { fetchLines } from "../services/lineApi";
import { fetchMachines } from "../services/machineApi";
import AbnormalitiesPanel from "./AbnormalitiesPanel";
import ConsolidatedListPanel from "./ConsolidatedListPanel";

const F = `SourceSansPro,"Helvetica Neue",Helvetica,Arial,sans-serif`;
const AC = "#16a34a";

const todayStr = () => new Date().toISOString().slice(0, 10);
const rowsOf = (j) => j?.objects ?? j?.data ?? j?.results ?? [];

const fmtDate = (d) =>
  d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

// ══════════════════════════════════════════════════════════════════════════
// Status pill for each checkpoint row
// ══════════════════════════════════════════════════════════════════════════
function ResultButtons({ value, onChange, disabled }) {
  const btn = (label, val, color) => (
    <button
      onClick={() => !disabled && onChange(val)}
      disabled={disabled}
      style={{
        padding: "6px 16px",
        borderRadius: 7,
        border: `1.5px solid ${value === val ? color : "#e2e8f0"}`,
        background: value === val ? color : "#fff",
        color: value === val ? "#fff" : "#64748b",
        fontWeight: 700,
        fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {btn("OK", "OK", "#16a34a")}
      {btn("Abnormal", "Abnormal", "#dc2626")}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// One checklist item row
// ══════════════════════════════════════════════════════════════════════════
function CheckpointRow({ item, existing, submitted, onSaved }) {
  const [result, setResult] = useState(existing?.result || "");
  const [currentValue, setCurrentValue] = useState(
    existing?.current_value || "",
  );
  const [remarks, setRemarks] = useState(existing?.remarks || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async (newResult) => {
    setResult(newResult);
    setSaving(true);
    setErr("");
    try {
      await saveCheckpoint({
        equipment_code: item.equipment_code,
        checklist_item_id: item.cdb_object_id,
        inspection_date: todayStr(),
        result: newResult,
        current_value: currentValue,
        remarks,
        checked_by: item.checked_by || "",
      });
      onSaved();
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const isAbnormal = result === "Abnormal";

  return (
    <div
      style={{
        border: `1.5px solid ${isAbnormal ? "#fecaca" : "#e2e8f0"}`,
        background: isAbnormal ? "#fef2f2" : "#fff",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
            {item.title || item.check_point_title}
          </div>
          {(item.sop_ref || item.limit_value || item.instrument) && (
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {[
                item.sop_ref,
                item.limit_value && `Limit: ${item.limit_value}`,
                item.instrument && `Instrument: ${item.instrument}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
        <ResultButtons
          value={result}
          onChange={save}
          disabled={submitted || saving}
        />
      </div>

      {isAbnormal && (
        <div
          style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}
        >
          <input
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={() => result && save(result)}
            placeholder="Current value…"
            disabled={submitted}
            style={{
              flex: 1,
              minWidth: 120,
              padding: "6px 10px",
              borderRadius: 7,
              border: "1.5px solid #fecaca",
              fontSize: 12,
              fontFamily: F,
              outline: "none",
            }}
          />
          <input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            onBlur={() => result && save(result)}
            placeholder="Remarks…"
            disabled={submitted}
            style={{
              flex: 2,
              minWidth: 160,
              padding: "6px 10px",
              borderRadius: 7,
              border: "1.5px solid #fecaca",
              fontSize: 12,
              fontFamily: F,
              outline: "none",
            }}
          />
        </div>
      )}

      {saving && (
        <div style={{ fontSize: 10, color: "#d97706", marginTop: 6 }}>
          Saving…
        </div>
      )}
      {err && (
        <div style={{ fontSize: 10, color: "#dc2626", marginTop: 6 }}>
          ✕ {err}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Top nav — SmartPM / Checker Portal branding + role + clock + Home
// ══════════════════════════════════════════════════════════════════════════
function TopNav({ checkedBy, onNavigate }) {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(
        n.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
          " " +
          n.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      );
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      style={{
        background: "#0B1F3A",
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "linear-gradient(135deg,#3b82f6,#22c55e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
          }}
        >
          🔍
        </div>
        <div>
          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              fontFamily: F,
            }}
          >
            SmartPM
          </div>
          <div
            style={{
              color: "rgba(255,255,255,.5)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".5px",
              fontFamily: F,
            }}
          >
            Checker Portal
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,.08)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 100,
          padding: "5px 12px 5px 8px",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
          }}
        />
        <span
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: F,
          }}
        >
          {checkedBy} · Checker
        </span>
      </div>
      <button
        onClick={() => onNavigate && onNavigate("admin")}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,.75)",
          background: "transparent",
          border: "none",
          padding: "5px 10px",
          borderRadius: 6,
          cursor: "pointer",
          fontFamily: F,
        }}
      >
        ← Admin Panel
      </button>
      <button
        onClick={() => onNavigate && onNavigate("home")}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,.75)",
          background: "transparent",
          border: "none",
          padding: "5px 10px",
          borderRadius: 6,
          cursor: "pointer",
          fontFamily: F,
        }}
      >
        ← Home
      </button>
      <div
        style={{ color: "rgba(255,255,255,.5)", fontSize: 13, fontFamily: F }}
      >
        {clock}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Sidebar — MY TASKS / AUDIT & SCHEDULE / NAVIGATE / QUICK ACTIONS
// ══════════════════════════════════════════════════════════════════════════
function SidebarLink({ icon, label, badge, active, onClick }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 20px",
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        fontFamily: F,
        borderLeft: `3px solid ${active ? "#2563eb" : "transparent"}`,
        background: active ? "#eff6ff" : "transparent",
        color: active ? "#2563eb" : "#475569",
      }}
    >
      <span
        style={{ width: 18, textAlign: "center", fontSize: 15, flexShrink: 0 }}
      >
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span
          style={{
            background: active ? "#2563eb" : "#f59e0b",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            minWidth: 20,
            height: 20,
            borderRadius: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 5px",
          }}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

function SidebarLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".6px",
        textTransform: "uppercase",
        color: "#94a3b8",
        padding: "14px 20px 6px",
        fontFamily: F,
      }}
    >
      {children}
    </div>
  );
}

function QuickActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        borderRadius: 8,
        marginBottom: 6,
        cursor: "pointer",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1e40af",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: F,
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

const MY_TASKS = [
  { id: "pm-inspection", icon: "🔍", label: "PM Inspection" },
  { id: "abnormalities", icon: "⚠️", label: "Abnormalities" },
  { id: "iiot-alerts", icon: "📡", label: "IIoT Alerts" },
  { id: "consolidated", icon: "📋", label: "Consolidated List" },
];

const AUDIT_SCHEDULE = [
  { id: "audit-queue", icon: "✅", label: "Audit Queue" },
  { id: "my-calendar", icon: "📅", label: "My Calendar" },
  { id: "history-status", icon: "🧾", label: "History & Status" },
];

function CheckerSidebar({
  activeTab,
  setActiveTab,
  badges,
  onNavigate,
  onQuickAction,
}) {
  return (
    <aside
      style={{
        width: 240,
        background: "#fff",
        borderRight: "1px solid #e2e8f0",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <SidebarLabel>My Tasks</SidebarLabel>
      {MY_TASKS.map((t) => (
        <SidebarLink
          key={t.id}
          icon={t.icon}
          label={t.label}
          badge={badges[t.id]}
          active={activeTab === t.id}
          onClick={() => setActiveTab(t.id)}
        />
      ))}

      <div style={{ height: 1, background: "#e2e8f0", margin: "10px 20px" }} />
      <SidebarLabel>Audit &amp; Schedule</SidebarLabel>
      {AUDIT_SCHEDULE.map((t) => (
        <SidebarLink
          key={t.id}
          icon={t.icon}
          label={t.label}
          badge={badges[t.id]}
          active={activeTab === t.id}
          onClick={() => setActiveTab(t.id)}
        />
      ))}

      <div style={{ height: 1, background: "#e2e8f0", margin: "10px 20px" }} />
      <SidebarLabel>Navigate</SidebarLabel>
      <SidebarLink
        icon="📋"
        label="Planner View"
        onClick={() => onNavigate && onNavigate("planner")}
      />
      <SidebarLink
        icon="🔧"
        label="Executor View"
        onClick={() => onNavigate && onNavigate("executor")}
      />
      <SidebarLink
        icon="📊"
        label="Mentor Dashboard"
        onClick={() => onNavigate && onNavigate("dashboard")}
      />

      <div style={{ height: 1, background: "#e2e8f0", margin: "10px 20px" }} />
      <SidebarLabel>Quick Actions</SidebarLabel>
      <div style={{ padding: "4px 12px 16px" }}>
        <QuickActionButton
          icon="⚠️"
          label="Log Abnormality"
          onClick={() => onQuickAction("log-abnormality")}
        />
        <QuickActionButton
          icon="✅"
          label="Pending Audits"
          onClick={() => onQuickAction("pending-audits")}
        />
        <QuickActionButton
          icon="🧾"
          label="View History"
          onClick={() => onQuickAction("view-history")}
        />
      </div>
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Simple "not built yet" placeholder — same convention as AdminPage
// ══════════════════════════════════════════════════════════════════════════
function ComingSoon({ title, subtitle }) {
  return (
    <div style={{ padding: "28px 28px" }}>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 4,
          fontFamily: F,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#64748b",
          marginBottom: 20,
          fontFamily: F,
        }}
      >
        {subtitle}
      </div>
      <div style={{ fontSize: 14, color: "#94a3b8", fontFamily: F }}>
        This module hasn't been built yet.
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main Checker Page
// ══════════════════════════════════════════════════════════════════════════
// No Redux here on purpose — this page can mount outside the app's <Provider>
// tree (see HelloWorld.jsx), so it talks to the same collections Admin uses
// via plain service calls (equipmentApi/plantApi/lineApi/machineApi) instead.
export default function CheckerPage({ checkedBy = "Checker", onNavigate }) {
  const [activeTab, setActiveTab] = useState("pm-inspection");

  const [equipmentList, setEquipmentList] = useState([]);
  const [plantList, setPlantList] = useState([]);
  const [lineList, setLineList] = useState([]);
  const [machineList, setMachineList] = useState([]);

  const [selectedEquipment, setSelectedEquipment] = useState("");

  // Plant/Line/Machine filter — same behaviour as ChecklistBuilder's filter bar
  const [filterPlant, setFilterPlant] = useState("all");
  const [filterLine, setFilterLine] = useState("all");
  const [filterMachine, setFilterMachine] = useState("all");

  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistHeaderFound, setChecklistHeaderFound] = useState(true); // true until we know otherwise
  const [resultsMap, setResultsMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    pm_inspection_pending: 0,
    abnormalities: 0,
    iiot_alerts: 0,
  });

  const today = todayStr();

  // ── Load master/filter data on mount — same services ChecklistBuilder uses ──
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchEquipment(),
      fetchPlants(),
      fetchLines(),
      fetchMachines(),
    ])
      .then(([eqJ, plantJ, lineJ, machineJ]) => {
        const eqRows = rowsOf(eqJ).filter(
          (e) => String(e.is_active ?? "1") === "1",
        );
        setEquipmentList(eqRows);
        setPlantList(rowsOf(plantJ));
        setLineList(rowsOf(lineJ));
        setMachineList(rowsOf(machineJ));
        if (eqRows.length > 0) {
          setSelectedEquipment(eqRows[0].equipment_code || eqRows[0].code);
        }
      })
      .catch((e) => setError(e?.message || "Failed to load equipment/filters"))
      .finally(() => setLoading(false));

    fetchDashboardSummary(checkedBy)
      .then((s) => setSummary(s))
      .catch(() => {});
  }, [checkedBy]);

  // Line dropdown — scoped to filterPlant, deduped by name (same as Builder)
  const lineOptions = [
    ...new Map(
      lineList
        .filter(
          (l) =>
            filterPlant === "all" ||
            String(l.plant_code) === String(filterPlant),
        )
        .map((l) => [l.line_name, l]),
    ).values(),
  ];

  // Machine dropdown — scoped to filterPlant + filterLine (same as Builder)
  const machineOptions = [
    ...new Map(
      machineList
        .filter(
          (m) =>
            (filterPlant === "all" ||
              String(m.plant_code) === String(filterPlant)) &&
            (filterLine === "all" ||
              String(m.line_name) === String(filterLine)),
        )
        .map((m) => [m.machine_name, m]),
    ).values(),
  ];

  // ── Scope equipment pills by Plant/Line/Machine ──
  const filteredEquipment = equipmentList.filter((eq) => {
    if (filterPlant !== "all" && String(eq.plant_code) !== String(filterPlant))
      return false;
    if (filterLine !== "all" && String(eq.line || "") !== String(filterLine))
      return false;
    if (
      filterMachine !== "all" &&
      String(eq.machine || "") !== String(filterMachine)
    )
      return false;
    return true;
  });

  // If current selection falls outside the filter, fall back to the first
  // equipment in the filtered list.
  const effectiveSelectedEquipment = filteredEquipment.find(
    (eq) => (eq.equipment_code || eq.code) === selectedEquipment,
  )
    ? selectedEquipment
    : filteredEquipment[0]?.equipment_code || filteredEquipment[0]?.code || "";

  // ── Load checklist items + today's results whenever equipment changes ──
  const loadEquipmentData = useCallback(() => {
    if (!effectiveSelectedEquipment) return;
    setLoadingItems(true);
    setError("");
    Promise.all([
      fetchChecklistItems(effectiveSelectedEquipment),
      fetchInspectionResults(effectiveSelectedEquipment, today),
    ])
      .then(([itemsJ, resultsJ]) => {
        setChecklistItems(rowsOf(itemsJ));
        setChecklistHeaderFound(rowsOf(itemsJ).length > 0);
        const results = rowsOf(resultsJ);
        const map = {};
        results.forEach((r) => {
          map[r.checklist_item_id] = r;
        });
        setResultsMap(map);
      })
      .catch((e) => setError(e?.message || "Failed to load checklist"))
      .finally(() => setLoadingItems(false));
  }, [effectiveSelectedEquipment, today]);

  useEffect(() => {
    loadEquipmentData();
  }, [loadEquipmentData]);

  const progress = useMemo(() => {
    const total = checklistItems.length;
    const done = checklistItems.filter(
      (i) => resultsMap[i.cdb_object_id],
    ).length;
    return { done, total };
  }, [checklistItems, resultsMap]);

  const isSubmitted = useMemo(
    () => Object.values(resultsMap).some((r) => r.submitted_at),
    [resultsMap],
  );

  const canSubmit =
    progress.total > 0 && progress.done === progress.total && !isSubmitted;

  // ── Sidebar badge counts (derived from what we already have client-side) ──
  const pendingForCurrentEquipment = isSubmitted
    ? 0
    : Math.max(progress.total - progress.done, 0);
  const abnormalCount = Object.values(resultsMap).filter(
    (r) => r.result === "Abnormal",
  ).length;
  const badges = {
    "pm-inspection": pendingForCurrentEquipment,
    abnormalities: abnormalCount,
    "iiot-alerts": summary.iiot_alerts,
    "audit-queue": 0,
  };

  const handlePlantFilterChange = (e) => {
    setFilterPlant(e.target.value);
    setFilterLine("all");
    setFilterMachine("all");
  };

  const handleLineFilterChange = (e) => {
    setFilterLine(e.target.value);
    setFilterMachine("all");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await submitInspection(effectiveSelectedEquipment, today);
      loadEquipmentData();
    } catch (e) {
      setError(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEquipmentRow = filteredEquipment.find(
    (eq) => (eq.equipment_code || eq.code) === effectiveSelectedEquipment,
  );

  const handleQuickAction = (action) => {
    if (action === "log-abnormality") setActiveTab("abnormalities");
    else if (action === "pending-audits") setActiveTab("audit-queue");
    else if (action === "view-history") setActiveTab("history-status");
  };

  // Jump from Consolidated List straight to a specific equipment's checklist.
  const openInspectionFor = (equipmentCode) => {
    setSelectedEquipment(equipmentCode);
    setActiveTab("pm-inspection");
  };
  const openAbnormalitiesTab = () => setActiveTab("abnormalities");

  const TAB_META = {
    "pm-inspection": {
      label: "PM Inspection",
      subtitle: `${checkedBy} · Checker`,
    },
    abnormalities: {
      label: "Abnormalities",
      subtitle: "Flagged out-of-limit readings",
    },
    "iiot-alerts": {
      label: "IIoT Alerts",
      subtitle: "Sensor-triggered notifications",
    },
    consolidated: {
      label: "Consolidated List",
      subtitle: "All tasks across equipment",
    },
    "audit-queue": {
      label: "Audit Queue",
      subtitle: "Inspections awaiting audit",
    },
    "my-calendar": { label: "My Calendar", subtitle: "Scheduled inspections" },
    "history-status": {
      label: "History & Status",
      subtitle: "Past submissions",
    },
  };

  return (
    <div
      style={{
        fontFamily: F,
        background: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNav checkedBy={checkedBy} onNavigate={onNavigate} />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <CheckerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          badges={badges}
          onNavigate={onNavigate}
          onQuickAction={handleQuickAction}
        />

        <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          {/* ── PM INSPECTION — the only fully built tab ── */}
          {activeTab === "pm-inspection" && (
            <div>
              {/* breadcrumb + header row */}
              <div
                style={{
                  background: "#fff",
                  borderBottom: "1.5px solid #e2e8f0",
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}
                >
                  <span
                    onClick={() => onNavigate && onNavigate("home")}
                    style={{ cursor: "pointer", fontWeight: 600 }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#2563eb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#94a3b8")
                    }
                  >
                    Checker
                  </span>
                  <span style={{ margin: "0 4px" }}>›</span>{" "}
                  {TAB_META[activeTab].label}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      PM Inspection — {fmtDate(new Date())}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}
                    >
                      {checkedBy} · Checker
                      {selectedEquipmentRow &&
                        ` · ${selectedEquipmentRow.plant_code || ""}`}
                    </div>
                  </div>
                  {effectiveSelectedEquipment &&
                    checklistItems.length > 0 &&
                    !isSubmitted && (
                      <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || submitting}
                        style={{
                          padding: "10px 22px",
                          borderRadius: 8,
                          border: "none",
                          background: canSubmit && !submitting ? AC : "#cbd5e1",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 13,
                          cursor:
                            canSubmit && !submitting
                              ? "pointer"
                              : "not-allowed",
                        }}
                      >
                        ✓ {submitting ? "Submitting…" : "Submit Inspection"}
                      </button>
                    )}
                  {isSubmitted && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: AC }}>
                      ✓ Inspection Submitted
                    </span>
                  )}
                </div>
              </div>

              {/* ── Pending/Abnormal/IIoT summary strip ── */}
              <div
                style={{
                  background: "#fff",
                  borderBottom: "1.5px solid #e2e8f0",
                  padding: "12px 20px",
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {[
                  {
                    label: "Pending",
                    value: pendingForCurrentEquipment,
                    color: "#d97706",
                  },
                  {
                    label: "Abnormalities",
                    value: abnormalCount,
                    color: "#dc2626",
                  },
                  {
                    label: "IIoT Alerts",
                    value: summary.iiot_alerts,
                    color: "#2563eb",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{
                      background: `${color}12`,
                      border: `1.5px solid ${color}33`,
                      borderRadius: 10,
                      padding: "6px 14px",
                      textAlign: "center",
                      minWidth: 80,
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 800, color }}>
                      {value}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#64748b",
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Plant / Line / Machine + Equipment filter bar ── */}
              <div
                style={{
                  background: "#fff",
                  borderBottom: "1px solid #e2e8f0",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Filter:
                </span>
                <select
                  value={filterPlant}
                  onChange={handlePlantFilterChange}
                  style={{
                    width: 160,
                    fontSize: 13,
                    padding: "5px 8px",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: 8,
                    color: "#334155",
                    background: "#fff",
                    outline: "none",
                  }}
                >
                  <option value="all">All Plants</option>
                  {plantList.map((p) => (
                    <option key={p.plant_code} value={p.plant_code}>
                      {p.plant_name} ({p.plant_code})
                    </option>
                  ))}
                </select>
                <select
                  value={filterLine}
                  onChange={handleLineFilterChange}
                  style={{
                    width: 150,
                    fontSize: 13,
                    padding: "5px 8px",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: 8,
                    color: "#334155",
                    background: "#fff",
                    outline: "none",
                  }}
                >
                  <option value="all">All Lines</option>
                  {lineOptions.map((l) => (
                    <option
                      key={`${l.plant_code}-${l.line_name}`}
                      value={l.line_name}
                    >
                      {l.line_name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterMachine}
                  onChange={(e) => setFilterMachine(e.target.value)}
                  style={{
                    width: 160,
                    fontSize: 13,
                    padding: "5px 8px",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: 8,
                    color: "#334155",
                    background: "#fff",
                    outline: "none",
                  }}
                >
                  <option value="all">All Machines</option>
                  {machineOptions.map((m) => (
                    <option
                      key={`${m.plant_code}-${m.line_name}-${m.machine_name}`}
                      value={m.machine_name}
                    >
                      {m.machine_name}
                    </option>
                  ))}
                </select>

                <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Equipment:
                </span>
                <select
                  value={effectiveSelectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  disabled={loading || filteredEquipment.length === 0}
                  style={{
                    width: 260,
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "5px 8px",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: 8,
                    color: "#0f172a",
                    background: "#fff",
                    outline: "none",
                  }}
                >
                  {loading && <option value="">Loading equipment…</option>}
                  {!loading && filteredEquipment.length === 0 && (
                    <option value="">No equipment in this scope</option>
                  )}
                  {filteredEquipment.map((eq) => {
                    const code = eq.equipment_code || eq.code;
                    return (
                      <option key={code} value={code}>
                        {code} — {eq.equipment_name || eq.name || ""}
                      </option>
                    );
                  })}
                </select>
                <span
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    whiteSpace: "nowrap",
                  }}
                >
                  {filteredEquipment.length}/{equipmentList.length}
                </span>

                {(filterPlant !== "all" ||
                  filterLine !== "all" ||
                  filterMachine !== "all") && (
                  <button
                    onClick={() => {
                      setFilterPlant("all");
                      setFilterLine("all");
                      setFilterMachine("all");
                    }}
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#2563eb",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "5px 0",
                    }}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    borderBottom: "1px solid #fecaca",
                    padding: "8px 20px",
                    fontSize: 12,
                    color: "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              {/* ── Progress bar ── */}
              {effectiveSelectedEquipment && (
                <div style={{ padding: "14px 20px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#475569",
                      }}
                    >
                      Progress
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: AC }}>
                      {progress.done}/{progress.total}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "#e2e8f0",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
                        height: "100%",
                        background: AC,
                        borderRadius: 4,
                        transition: "width .3s",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── Checklist items ── */}
              <div style={{ padding: "16px 20px" }}>
                {loadingItems ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#94a3b8",
                    }}
                  >
                    Loading checklist…
                  </div>
                ) : !checklistHeaderFound ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#94a3b8",
                    }}
                  >
                    No checklist has been built for this equipment yet — create
                    one in PM Checklist Builder.
                  </div>
                ) : checklistItems.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#94a3b8",
                    }}
                  >
                    No active check points found for this equipment
                  </div>
                ) : (
                  checklistItems.map((item) => (
                    <CheckpointRow
                      key={item.cdb_object_id}
                      item={{
                        ...item,
                        equipment_code: effectiveSelectedEquipment,
                        checked_by: checkedBy,
                      }}
                      existing={resultsMap[item.cdb_object_id]}
                      submitted={isSubmitted}
                      onSaved={loadEquipmentData}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Placeholder tabs — not built yet ── */}
          {activeTab === "abnormalities" && (
            <AbnormalitiesPanel
              equipmentList={equipmentList}
              checkedBy={checkedBy}
            />
          )}
          {activeTab === "iiot-alerts" && (
            <ComingSoon
              title="IIoT Alerts"
              subtitle="Sensor-triggered notifications requiring attention"
            />
          )}
          {activeTab === "consolidated" && (
            <ConsolidatedListPanel
              equipmentList={equipmentList}
              checkedBy={checkedBy}
              today={today}
              onOpenInspection={openInspectionFor}
              onOpenAbnormalities={openAbnormalitiesTab}
            />
          )}
          {activeTab === "audit-queue" && (
            <ComingSoon
              title="Audit Queue"
              subtitle="Submitted inspections awaiting audit sign-off"
            />
          )}
          {activeTab === "my-calendar" && (
  <MyCalendarPanel onOpenInspection={(code) => { setSelectedEquipment(code); setActiveTab("pm-inspection"); }} />
)}
          {activeTab === "history-status" && (
            <ComingSoon
              title="History & Status"
              subtitle="Past submissions and their outcomes"
            />
          )}
        </div>
      </div>
    </div>
  );
}
