import { useEffect, useMemo, useState } from "react";
import { fetchAbnormalResults, fetchManualAbnormalities, logAbnormality } from "../services/checkerApi";

const F = `SourceSansPro,"Helvetica Neue",Helvetica,Arial,sans-serif`;

const PRIORITIES = [
  { value: "Critical", color: "#dc2626" },
  { value: "High", color: "#ea580c" },
  { value: "Medium", color: "#d97706" },
  { value: "Low", color: "#64748b" },
];

const priorityColor = (p) => PRIORITIES.find((x) => x.value === p)?.color || "#64748b";

// ══════════════════════════════════════════════════════════════════════════
// "Log Abnormality" modal — matches the demo form exactly.
// NOTE: manual entries are UI-only (kept in React state) because no backend
// table exists yet for priority / probable_cause / photos. Once such a table
// is added, swap handleSubmit's setManualEntries(...) for a real API call —
// nothing else in this component needs to change.
// ══════════════════════════════════════════════════════════════════════════
function LogAbnormalityModal({ open, onClose, equipmentList, checkedBy, onSubmit, saving }) {
  const blank = {
    equipment_code: equipmentList[0]?.equipment_code || equipmentList[0]?.code || "",
    priority: "Critical",
    observed_value: "",
    probable_cause: "",
    remarks: "",
    photos: [null, null, null],
  };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) setForm(blank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setPhoto = (idx) => (e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => {
      const photos = [...f.photos];
      photos[idx] = file;
      return { ...f, photos };
    });
  };

  const submit = async () => {
    if (!form.observed_value.trim() && !form.remarks.trim()) {
      alert("Please fill in Observed Value or Remarks before logging.");
      return;
    }
    await onSubmit({
      ...form,
      logged_by: checkedBy,
      logged_at: new Date().toISOString(),
      photos: form.photos.filter(Boolean).map((f) => f.name),
    });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 620, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.25)", fontFamily: F }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, background: "#fff" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>⚠️ Log Abnormality</div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", width: 30, height: 30, borderRadius: 8, fontSize: 14, color: "#64748b", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", fontSize: 13, borderRadius: 8, padding: "10px 14px", marginBottom: 18 }}>
            Check Point: <strong>Quick Log (no checklist)</strong>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Equipment / Machine</label>
              <select value={form.equipment_code} onChange={set("equipment_code")} style={inputStyle}>
                {equipmentList.map((eq) => {
                  const code = eq.equipment_code || eq.code;
                  return <option key={code} value={code}>{code} — {eq.equipment_name || eq.name || ""}</option>;
                })}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Priority</label>
              <select value={form.priority} onChange={set("priority")} style={{ ...inputStyle, fontWeight: 700 }}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.value}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Observed Value / Condition</label>
            <input value={form.observed_value} onChange={set("observed_value")} placeholder="e.g. 8.2 mm/s (limit 4.5 mm/s)" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Probable Cause</label>
            <input value={form.probable_cause} onChange={set("probable_cause")} placeholder="e.g. Bearing wear / misalignment" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Remarks / Description</label>
            <textarea value={form.remarks} onChange={set("remarks")} placeholder="Describe in detail what you observed, when, and conditions…" style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: F }} />
          </div>

          <div style={{ marginBottom: 4 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Photo Evidence</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[0, 1, 2].map((idx) => (
                <label
                  key={idx}
                  style={{
                    border: "1.5px dashed #cbd5e1", borderRadius: 10, padding: "18px 8px", textAlign: "center",
                    fontSize: 12, fontWeight: 600, color: form.photos[idx] ? "#0f172a" : "#64748b",
                    cursor: "pointer", background: form.photos[idx] ? "#f0fdf4" : "#f8fafc",
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 4 }}>📷</div>
                  {form.photos[idx] ? form.photos[idx].name.slice(0, 14) : `photo${idx + 1}`}
                  <input type="file" accept="image/*" onChange={setPhoto(idx)} style={{ display: "none" }} />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10, position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #cbd5e1", background: "#fff", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: saving ? "#f87171" : "#dc2626", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Logging…" : "⚠️ Log Abnormality"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", fontSize: 13, border: "1.5px solid #e2e8f0",
  borderRadius: 8, background: "#fff", color: "#334155", outline: "none", fontFamily: F, boxSizing: "border-box",
};

// ══════════════════════════════════════════════════════════════════════════
// One row in the logged abnormalities list
// ══════════════════════════════════════════════════════════════════════════
function AbnormalityRow({ row }) {
  const isAuto = row.source !== "manual";
  return (
    <div style={{ border: "1.5px solid #fecaca", background: "#fef2f2", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
              {row.equipment_code} — {row.item_title || "Manually logged"}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#fff", padding: "2px 8px", borderRadius: 100,
              background: isAuto ? "#2563eb" : priorityColor(row.priority),
            }}>
              {isAuto ? "AUTO-FLAGGED" : (row.priority || "MANUAL").toUpperCase()}
            </span>
          </div>
          {isAuto ? (
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Current: <strong style={{ color: "#dc2626" }}>{row.current_value || "—"}</strong>
              {row.limit_value && <> · Limit: {row.limit_value}</>}
              {row.remarks && <> · {row.remarks}</>}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {row.observed_value && <>Observed: <strong>{row.observed_value}</strong> · </>}
              {row.probable_cause && <>Cause: {row.probable_cause} · </>}
              {row.remarks}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            {isAuto ? row.inspection_date : new Date(row.logged_at).toLocaleString()}
            {row.checked_by || row.logged_by ? ` · Logged by ${row.checked_by || row.logged_by}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main panel
// ══════════════════════════════════════════════════════════════════════════
export default function AbnormalitiesPanel({ equipmentList, checkedBy }) {
  const [autoRows, setAutoRows] = useState([]);
  const [manualRows, setManualRows] = useState([]); // now persisted via smartpm_checker_abnormality_log
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [logging, setLogging] = useState(false);

  const loadAll = () => {
    setLoading(true);
    setError("");
    Promise.all([fetchAbnormalResults(), fetchManualAbnormalities()])
      .then(([autoJ, manualJ]) => {
        setAutoRows(autoJ.objects || []);
        setManualRows((manualJ.objects || []).map((r) => ({ ...r, source: "manual" })));
      })
      .catch((e) => setError(e?.message || "Failed to load abnormalities"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const allRows = useMemo(
    () => [...manualRows, ...autoRows.map((r) => ({ ...r, source: "auto" }))],
    [manualRows, autoRows],
  );

  const handleLog = async (entry) => {
    setLogging(true);
    setError("");
    try {
      await logAbnormality(entry);
      loadAll(); // refetch so the new row has its real cdb_object_id
    } catch (e) {
      setError(e?.message || "Failed to save abnormality");
    } finally {
      setLogging(false);
    }
  };

  return (
    <div>
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e2e8f0", padding: "16px 20px" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
          Checker <span style={{ margin: "0 4px" }}>›</span> Logged Abnormalities
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Logged Abnormalities</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Auto-forwarded from PM Inspection · plus manually logged issues
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
          >
            + Log Abnormality
          </button>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "8px 14px", marginBottom: 14 }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading abnormalities…</div>
        ) : allRows.length === 0 ? (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", fontSize: 13, borderRadius: 8, padding: "12px 16px" }}>
            ℹ️ No abnormalities logged yet — nice and clean.
          </div>
        ) : (
          allRows.map((row, i) => <AbnormalityRow key={row.cdb_object_id || `manual-${i}`} row={row} />)
        )}
      </div>

      <LogAbnormalityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        equipmentList={equipmentList}
        checkedBy={checkedBy}
        saving={logging}
        onSubmit={handleLog}
      />
    </div>
  );
}