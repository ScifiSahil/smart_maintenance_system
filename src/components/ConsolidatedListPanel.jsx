import { useEffect, useState } from "react";
import { fetchTodayPmStatus, fetchAbnormalResults, fetchManualAbnormalities } from "../services/checkerApi";

const F = `SourceSansPro,"Helvetica Neue",Helvetica,Arial,sans-serif`;

// ── Small section wrapper — icon + title + count badge ──────────────────────
function Section({ icon, title, count, color, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{title}</span>
        <span
          style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#fff",
            background: count > 0 ? color : "#94a3b8", padding: "2px 9px", borderRadius: 100,
          }}
        >
          {count}
        </span>
      </div>
      <div style={{ padding: count > 0 ? "8px 16px 14px" : "14px 16px" }}>{children}</div>
    </div>
  );
}

function EmptyRow({ text }) {
  return <div style={{ fontSize: 13, color: "#94a3b8", padding: "6px 0" }}>{text}</div>;
}

// ── One "pending PM inspection" row ──────────────────────────────────────────
function PendingPmRow({ status, equipment, onOpen }) {
  const pct = status.total > 0 ? Math.round((status.done / status.total) * 100) : 0;
  return (
    <div
      onClick={() => onOpen(status.equipment_code)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8,
        border: "1.5px solid #fde68a", background: "#fffbeb", marginBottom: 8, cursor: "pointer",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
          {status.equipment_code} {equipment ? `— ${equipment.equipment_name || equipment.name || ""}` : ""}
        </div>
        <div style={{ fontSize: 11, color: "#92400e", marginTop: 2 }}>
          {status.done}/{status.total} check points done · {status.pending} pending
        </div>
      </div>
      <div style={{ width: 60, height: 6, background: "#fde68a", borderRadius: 4, overflow: "hidden", flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#d97706" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>Open →</span>
    </div>
  );
}

// ── One "open abnormality" row ────────────────────────────────────────────────
function AbnormalityRow({ row }) {
  const isAuto = row.source !== "manual";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", marginBottom: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
          {row.equipment_code} — {isAuto ? (row.item_title || "Checklist flag") : "Manually logged"}
        </div>
        <div style={{ fontSize: 11, color: "#991b1b", marginTop: 2 }}>
          {isAuto ? `Current: ${row.current_value || "—"}${row.limit_value ? ` · Limit: ${row.limit_value}` : ""}` : (row.observed_value || row.probable_cause || row.remarks || "—")}
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: isAuto ? "#2563eb" : "#dc2626", padding: "2px 8px", borderRadius: 100, flexShrink: 0 }}>
        {isAuto ? "AUTO" : (row.priority || "MANUAL").toUpperCase()}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main panel
// ══════════════════════════════════════════════════════════════════════════
export default function ConsolidatedListPanel({ equipmentList, checkedBy, today, onOpenInspection, onOpenAbnormalities }) {
  const [pmStatus, setPmStatus] = useState([]);
  const [abnormalRows, setAbnormalRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchTodayPmStatus(today), fetchAbnormalResults(), fetchManualAbnormalities()])
      .then(([pmJ, autoJ, manualJ]) => {
        setPmStatus(pmJ || []);
        const auto = (autoJ.objects || []).map((r) => ({ ...r, source: "auto" }));
        const manual = (manualJ.objects || [])
          .filter((r) => (r.log_status || "Open") !== "Resolved")
          .map((r) => ({ ...r, source: "manual" }));
        setAbnormalRows([...manual, ...auto]);
      })
      .catch((e) => setError(e?.message || "Failed to load consolidated list"))
      .finally(() => setLoading(false));
  }, [today]);

  const equipmentByCode = {};
  equipmentList.forEach((eq) => { equipmentByCode[eq.equipment_code || eq.code] = eq; });

  const pendingPm = pmStatus.filter((s) => !s.submitted && s.pending > 0);
  const totalOpen = pendingPm.length + abnormalRows.length;

  return (
    <div>
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e2e8f0", padding: "16px 20px" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
          Checker <span style={{ margin: "0 4px" }}>›</span> Consolidated List
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Consolidated List</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          {checkedBy} · Everything that needs your attention today ({totalOpen} open items)
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "8px 14px", marginBottom: 14 }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading consolidated list…</div>
        ) : (
          <>
            <Section icon="🔍" title="Pending PM Inspections" count={pendingPm.length} color="#d97706">
              {pendingPm.length === 0 ? (
                <EmptyRow text="All built checklists are complete for today. ✅" />
              ) : (
                pendingPm.map((s) => (
                  <PendingPmRow key={s.equipment_code} status={s} equipment={equipmentByCode[s.equipment_code]} onOpen={onOpenInspection} />
                ))
              )}
            </Section>

            <Section icon="⚠️" title="Open Abnormalities" count={abnormalRows.length} color="#dc2626">
              {abnormalRows.length === 0 ? (
                <EmptyRow text="No abnormalities open right now." />
              ) : (
                <>
                  {abnormalRows.slice(0, 8).map((row, i) => <AbnormalityRow key={row.cdb_object_id || i} row={row} />)}
                  {abnormalRows.length > 8 && (
                    <button
                      onClick={onOpenAbnormalities}
                      style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0" }}
                    >
                      View all {abnormalRows.length} in Abnormalities →
                    </button>
                  )}
                </>
              )}
            </Section>

            <Section icon="📡" title="IIoT Alerts" count={0} color="#2563eb">
              <EmptyRow text="No live IIoT sensor feed connected yet." />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
