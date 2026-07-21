// components/MyCalendarPanel.jsx
// My Calendar — month view highlighting dates that have PM checklist tasks
// due (computed from checklist frequency), with a day drill-down panel
// listing the equipment + checklist items for the selected date.

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchCalendarTasks, fetchChecklistItems, fetchInspectionResults } from "../services/checkerApi";

const F = `SourceSansPro,"Helvetica Neue",Helvetica,Arial,sans-serif`;
const AC = "#16a34a";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad2 = (n) => String(n).padStart(2, "0");
const dateKey = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const todayKey = () => {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
};

// ── One equipment row inside the day drill-down ─────────────────────────────
function DayTaskRow({ task, dateStr }) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [loading, setLoading] = useState(false);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && items.length === 0) {
      setLoading(true);
      Promise.all([
        fetchChecklistItems(task.equipment_code),
        fetchInspectionResults(task.equipment_code, dateStr),
      ])
        .then(([itemsJ, resultsJ]) => {
          const rows = itemsJ?.objects ?? itemsJ?.data ?? itemsJ?.results ?? [];
          setItems(rows);
          const map = {};
          (resultsJ?.objects || []).forEach((r) => { map[r.checklist_item_id] = r; });
          setResultsMap(map);
        })
        .finally(() => setLoading(false));
    }
  };

  const statusColor = task.submitted ? AC : task.done > 0 ? "#d97706" : "#94a3b8";
  const statusLabel = task.submitted ? "Submitted" : task.done > 0 ? "In progress" : "Not started";

  return (
    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, marginBottom: 8, background: "#fff" }}>
      <div
        onClick={toggle}
        style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 10, flexWrap: "wrap" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#94a3b8", transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▸</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{task.equipment_code}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{task.checklist_name} · {task.frequency}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>{task.done}/{task.total}</span>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 14px", background: "#f8fafc" }}>
          {loading ? (
            <div style={{ fontSize: 12, color: "#94a3b8", padding: "6px 0" }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ fontSize: 12, color: "#94a3b8", padding: "6px 0" }}>No active check points for this equipment.</div>
          ) : (
            items.map((it) => {
              const r = resultsMap[it.cdb_object_id];
              return (
                <div key={it.cdb_object_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{it.title}</div>
                  {r ? (
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                      background: r.result === "Abnormal" ? "#fee2e2" : "#dcfce7",
                      color: r.result === "Abnormal" ? "#991b1b" : "#166534",
                    }}>
                      {r.result}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Pending</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function MyCalendarPanel({ onOpenInspection }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [taskMap, setTaskMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchCalendarTasks(viewYear, viewMonth)
      .then(setTaskMap)
      .catch((e) => setError(e?.message || "Failed to load calendar"))
      .finally(() => setLoading(false));
  }, [viewYear, viewMonth]);

  useEffect(() => { load(); }, [load]);

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };
  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(todayKey());
  };

  // Build the 6x7 grid, Monday-first
  const grid = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0=Mon..6=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const tk = todayKey();
  const selectedTasks = taskMap[selectedDate] || [];

  return (
    <div style={{ padding: "16px 20px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>My Calendar</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Scheduled inspection dates by equipment</div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* ── Calendar grid ── */}
        <div style={{ flex: "1 1 380px", minWidth: 320, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <button onClick={goPrevMonth} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 16, color: "#64748b" }}>‹</button>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
            <button onClick={goNextMonth} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 16, color: "#64748b" }}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{w}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {grid.map((d, i) => {
              if (d === null) return <div key={i} />;
              const key = dateKey(viewYear, viewMonth, d);
              const tasks = taskMap[key] || [];
              const hasTasks = tasks.length > 0;
              const allSubmitted = hasTasks && tasks.every((t) => t.submitted);
              const isToday = key === tk;
              const isSelected = key === selectedDate;

              const bg = isSelected ? "#2563eb" : isToday ? "#eff6ff" : "#fff";
              const fg = isSelected ? "#fff" : "#0f172a";
              const dotColor = allSubmitted ? AC : hasTasks ? "#d97706" : "transparent";

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  style={{
                    aspectRatio: "1", borderRadius: 8, border: isToday && !isSelected ? "1.5px solid #93c5fd" : "1.5px solid transparent",
                    background: bg, color: fg, cursor: "pointer", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 2, fontFamily: F, position: "relative",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: isToday || isSelected ? 800 : 600 }}>{d}</span>
                  {hasTasks && (
                    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "#fff" : dotColor }} />
                      <span style={{ fontSize: 8, fontWeight: 700, color: isSelected ? "#fff" : "#64748b" }}>{tasks.length}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, color: "#64748b", flexWrap: "wrap" }}>
            <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: AC, marginRight: 4 }} />All submitted</span>
            <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#d97706", marginRight: 4 }} />Pending tasks</span>
            <button onClick={goToday} style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#2563eb", background: "transparent", border: "none", cursor: "pointer" }}>Today</button>
          </div>
        </div>

        {/* ── Selected day drill-down ── */}
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
            Tasks for {selectedDate}
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#dc2626", fontWeight: 600, marginBottom: 12 }}>
              ⚠ {error}
            </div>
          )}

          {loading ? (
            <div style={{ fontSize: 12, color: "#94a3b8", padding: "20px 0", textAlign: "center" }}>Loading…</div>
          ) : selectedTasks.length === 0 ? (
            <div style={{ fontSize: 12, color: "#94a3b8", padding: "20px 0", textAlign: "center" }}>
              No checklist tasks due on this date.
            </div>
          ) : (
            <>
              {selectedTasks.map((t) => (
                <DayTaskRow key={t.equipment_code} task={t} dateStr={selectedDate} />
              ))}
              {selectedDate === tk && onOpenInspection && (
                <button
                  onClick={() => onOpenInspection(selectedTasks[0]?.equipment_code)}
                  style={{ marginTop: 6, width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: AC, color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                >
                  Go to Today's Inspection →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
