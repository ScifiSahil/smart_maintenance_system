// components/PMChecklistBuilder.jsx
// Renders the PM Checklist Builder — equipment/frequency selectors, numbered
// check points with SOP + limit/instrument detail, active toggle, and inline
// "add check point" form. Check points are local state for now — no dedicated
// checklist REST endpoint exists yet, so this seeds with sample data and edits
// happen client-side (same pattern as other not-yet-wired admin tabs).

import React, { useState } from 'react';

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];

const SEED_CHECKLIST = {
  title: 'Centrifugal Pump Daily Checklist',
  points: [
    { id: 1, name: 'Bearing Temperature Check', sop: 'SOP-PM-001', detail: 'Limit: <80°C · Instrument: Temp Gun', active: true },
    { id: 2, name: 'Vibration Level — Drive End', sop: 'SOP-PM-001', detail: 'Limit: <4.5 mm/s RMS · Instrument: Vibration Meter', active: true },
    { id: 3, name: 'Oil Level & Condition', sop: 'SOP-PM-002', detail: 'Visual Check · Min Level Mark', active: true },
    { id: 4, name: 'Seal Leakage Inspection', sop: 'SOP-PM-003', detail: 'Max 10 drops/min permissible', active: true },
    { id: 5, name: 'Coupling Guard Condition', sop: 'SOP-PM-001', detail: 'Visual check — no cracks/missing bolts', active: true },
  ],
};

function PMChecklistBuilder({ equipmentItems = [] }) {
  const [selectedEquip, setSelectedEquip] = useState(equipmentItems[0]?.equipment_code || 'CP-101');
  const [frequency, setFrequency] = useState('Daily');
  const [editMode, setEditMode] = useState(false);
  const [checklist, setChecklist] = useState(SEED_CHECKLIST);
  const [addingPoint, setAddingPoint] = useState(false);
  const [newPoint, setNewPoint] = useState({ name: '', sop: '', detail: '' });

  const matchedEquip = equipmentItems.find((e) => e.equipment_code === selectedEquip);
  const equipmentLabel = matchedEquip
    ? `${matchedEquip.equipment_code} — ${matchedEquip.equipment_name}`
    : `${selectedEquip} — Centrifugal Pump`;

  // Active/Inactive toggle — sirf edit mode mein clickable
  const toggleActive = (id) => {
    setChecklist((c) => ({
      ...c,
      points: c.points.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    }));
  };

  const removePoint = (id) => {
    setChecklist((c) => ({ ...c, points: c.points.filter((p) => p.id !== id) }));
  };

  const handleAddPoint = () => {
    if (!newPoint.name.trim()) return;
    const nextId = checklist.points.length ? Math.max(...checklist.points.map((p) => p.id)) + 1 : 1;
    setChecklist((c) => ({
      ...c,
      points: [
        ...c.points,
        { id: nextId, name: newPoint.name.trim(), sop: newPoint.sop.trim(), detail: newPoint.detail.trim(), active: true },
      ],
    }));
    setNewPoint({ name: '', sop: '', detail: '' });
    setAddingPoint(false);
  };

  return (
    <div>
      {/* Breadcrumb + page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <div className="text-[11px] text-[#94A3B8] mb-1">Admin <span className="mx-1">›</span> PM Checklists</div>
          <div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">PM Checklist Builder</div>
          <div className="text-[13px] text-[#64748B] mt-[3px]">Define inspection points for each equipment</div>
        </div>
        <button
          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291]"
          onClick={() => alert('New checklist form')}
        >
          + New Checklist
        </button>
      </div>

      {/* Checklist card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="text-sm font-bold text-[#0B1F3A]">{equipmentLabel} — {checklist.title}</div>
          <button
            className="py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border border-[#CBD5E1] bg-white text-[#334155] transition-all duration-150 hover:bg-[#F8FAFC] hover:border-[#94A3B8]"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
        </div>

        {/* Equipment + frequency selectors */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <select
            className="text-xs py-[7px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
            value={selectedEquip}
            onChange={(e) => setSelectedEquip(e.target.value)}
          >
            {equipmentItems.length === 0 && <option value={selectedEquip}>CP-101 — Centrifugal Pump</option>}
            {equipmentItems.map((eq) => (
              <option key={eq.equipment_code} value={eq.equipment_code}>
                {eq.equipment_code} — {eq.equipment_name}
              </option>
            ))}
          </select>
          <select
            className="text-xs py-[7px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Check points list */}
        {checklist.points.map((p, idx) => (
          <div key={p.id} className="flex items-center justify-between py-3.5 border-t border-[#F1F5F9] first:border-t-0 gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#0B1F3A]">{p.name}</div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  {p.sop}{p.sop && p.detail ? ' · ' : ''}{p.detail}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${p.active ? 'text-[#16A34A]' : 'text-[#94A3B8]'} ${editMode ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => editMode && toggleActive(p.id)}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'}`} />
                {p.active ? 'Active' : 'Inactive'}
              </button>
              {editMode && (
                <button
                  className="text-[#94A3B8] text-sm leading-none hover:text-[#DC2626]"
                  onClick={() => removePoint(p.id)}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add check point — inline form */}
        {addingPoint ? (
          <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex flex-col gap-2">
            <div className="flex gap-2 flex-wrap">
              <input
                className="flex-1 min-w-[180px] text-xs py-[7px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg outline-none focus:border-[#3B82F6]"
                placeholder="Check point name"
                value={newPoint.name}
                onChange={(e) => setNewPoint((n) => ({ ...n, name: e.target.value }))}
              />
              <input
                className="w-[120px] text-xs py-[7px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg outline-none focus:border-[#3B82F6]"
                placeholder="SOP ref"
                value={newPoint.sop}
                onChange={(e) => setNewPoint((n) => ({ ...n, sop: e.target.value }))}
              />
              <input
                className="flex-1 min-w-[180px] text-xs py-[7px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg outline-none focus:border-[#3B82F6]"
                placeholder="Limit / Instrument"
                value={newPoint.detail}
                onChange={(e) => setNewPoint((n) => ({ ...n, detail: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <button
                className="py-[6px] px-3 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1E5291]"
                onClick={handleAddPoint}
              >
                Save
              </button>
              <button
                className="py-[6px] px-3 rounded-lg text-xs font-semibold bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC]"
                onClick={() => { setAddingPoint(false); setNewPoint({ name: '', sop: '', detail: '' }); }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="mt-4 py-[7px] px-3.5 rounded-full text-xs font-semibold border border-[#CBD5E1] bg-white text-[#334155] transition-all duration-150 hover:bg-[#F8FAFC] hover:border-[#94A3B8]"
            onClick={() => setAddingPoint(true)}
          >
            + Add Check Point
          </button>
        )}
      </div>
    </div>
  );
}

export default PMChecklistBuilder;
