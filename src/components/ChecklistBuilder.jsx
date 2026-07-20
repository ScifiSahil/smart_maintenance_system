// components/ChecklistBuilder.jsx
// PM Checklist Builder — breadcrumb, title, "+ New Checklist" button, a flat
// filter bar (Plant/Line/Machine) styled like Equipment Register's "Filter:"
// bar, a checklist selector, the checklist card (title + Edit + Plant/Line/
// Machine breadcrumb), Linked Equipment/Frequency dropdowns, numbered check
// point rows, and a "+ Add Check Point" button. Data comes from Redux, API
// calls go through action creators.

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadChecklistHeaders,
  loadChecklistItems,
  setSelectedChecklistHeader,
  editChecklistHeader,
  removeCheckPoint,
} from "../actions/checklistActions";
import { loadEquipment } from "../actions/equipmentActions";
import { loadPlants } from "../actions/plantActions";
import { loadLines } from "../actions/lineActions";
import { loadMachines } from "../actions/machineActions";
import AddChecklistModal from "./AddChecklistModal";
import AddCheckPointModal from "./AddCheckPointModal";

const ChecklistBuilder = () => {
  const dispatch = useDispatch();
  const checklistState = useSelector((s) => s.checklist);
  const { items: equipmentItems } = useSelector((s) => s.equipment);
  const { items: plantItems } = useSelector((s) => s.plants);
  const { items: lineItems } = useSelector((s) => s.lines);
  const { items: machineItems } = useSelector((s) => s.machines);

  const [newChecklistOpen, setNewChecklistOpen] = useState(false);
  const [checkPointModalOpen, setCheckPointModalOpen] = useState(false);
  const [editingCheckPoint, setEditingCheckPoint] = useState(null);

  // Plant/Line/Machine filter used to scope the checklist list
  const [filterPlant, setFilterPlant] = useState("all");
  const [filterLine, setFilterLine] = useState("all");
  const [filterMachine, setFilterMachine] = useState("all");

  useEffect(() => {
    dispatch(loadChecklistHeaders());
    dispatch(loadChecklistItems());
    dispatch(loadEquipment());
    dispatch(loadPlants());
    dispatch(loadLines());
    dispatch(loadMachines());
  }, [dispatch]);

  // If the "checklist" reducer isn't registered in store.js, s.checklist will
  // be undefined — show a clear setup message instead of crashing the page.
  if (!checklistState) {
    return (
      <div className="p-5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#991B1B]">
        <strong>Setup incomplete:</strong> the "checklist" reducer is not
        registered in store.js. Add{" "}
        <code>import checklist from './reducers/checklistReducer';</code>{" "}
        and include <code>checklist</code> in{" "}
        <code>combineReducers({"{"} ...existing, checklist {"}"})</code>,
        then rebuild.
      </div>
    );
  }

  const { headers, items, selectedHeaderId } = checklistState;

  // Lookup to resolve a checklist header's equipment_code into the full
  // equipment record (plant/line/machine) — the header only stores the code.
  const equipmentByCode = Object.fromEntries(
    equipmentItems.map((eq) => [eq.equipment_code, eq]),
  );
  const plantNameByCode = Object.fromEntries(
    plantItems.map((p) => [String(p.plant_code), p.plant_name]),
  );

  // Line dropdown — scoped to filterPlant, deduped by name
  const lineOptions = [
    ...new Map(
      lineItems
        .filter((l) => filterPlant === "all" || String(l.plant_code) === String(filterPlant))
        .map((l) => [l.line_name, l]),
    ).values(),
  ];

  // Machine dropdown — scoped to filterPlant + filterLine
  const machineOptions = [
    ...new Map(
      machineItems
        .filter(
          (m) =>
            (filterPlant === "all" || String(m.plant_code) === String(filterPlant)) &&
            (filterLine === "all" || String(m.line_name) === String(filterLine)),
        )
        .map((m) => [m.machine_name, m]),
    ).values(),
  ];

  // Scope the checklists by Plant/Line/Machine — resolve each header's
  // equipment_code to its equipment record and match plant/line/machine.
  const filteredHeaders = headers.items.filter((h) => {
    const eq = equipmentByCode[h.equipment_code];
    if (!eq) return true; // keep checklists visible even if their equipment was removed
    if (filterPlant !== "all" && String(eq.plant_code) !== String(filterPlant)) return false;
    if (filterLine !== "all" && String(eq.line || "") !== String(filterLine)) return false;
    if (filterMachine !== "all" && String(eq.machine || "") !== String(filterMachine)) return false;
    return true;
  });

  // If the current selection falls outside the filter, auto-select the
  // first item in the filtered list.
  const effectiveSelectedId =
    filteredHeaders.find((h) => h.cdb_object_id === selectedHeaderId)?.cdb_object_id ??
    filteredHeaders[0]?.cdb_object_id ??
    null;

  const selectedHeader = headers.items.find((h) => h.cdb_object_id === effectiveSelectedId);
  const selectedEquipment = selectedHeader ? equipmentByCode[selectedHeader.equipment_code] : null;

  const checkPoints = items.items
    .filter((it) => it.equipment_code === selectedHeader?.equipment_code)
    .sort((a, b) => Number(a.seq_no || 0) - Number(b.seq_no || 0));

  const nextSeqNo = checkPoints.length
    ? Math.max(...checkPoints.map((c) => Number(c.seq_no || 0))) + 1
    : 1;

  const handlePlantFilterChange = (e) => {
    setFilterPlant(e.target.value);
    setFilterLine("all");
    setFilterMachine("all");
  };

  const handleLineFilterChange = (e) => {
    setFilterLine(e.target.value);
    setFilterMachine("all");
  };

  const handleEquipmentChange = (e) => {
    if (!selectedHeader) return;
    dispatch(editChecklistHeader(selectedHeader.cdb_object_id, { equipment_code: e.target.value }));
  };

  const handleFrequencyChange = (e) => {
    if (!selectedHeader) return;
    dispatch(editChecklistHeader(selectedHeader.cdb_object_id, { frequency: e.target.value }));
  };

  const handleDeleteCheckPoint = (cp) => {
    const ok = window.confirm(`Delete "${cp.title}"?`);
    if (ok) dispatch(removeCheckPoint(cp.cdb_object_id));
  };

  return (
    <div>
      {/* Breadcrumb + Title + New Checklist button */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-2 flex-wrap">
          Admin<span className="text-[10px] text-[#CBD5E1]">›</span>PM Checklists
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">
              PM Checklist Builder
            </div>
            <div className="text-[13px] text-[#64748B] mt-[3px]">
              Define inspection points for each equipment
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291]"
            onClick={() => setNewChecklistOpen(true)}
          >
            + New Checklist
          </button>
        </div>
      </div>

      {/* Filter + Select Checklist — everything on one row, styled to match
          Equipment Register's "Filter:" bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl py-3 px-4 mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold text-[#64748B] uppercase tracking-[0.5px]">Filter:</span>
        <select
          className="w-[160px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
          value={filterPlant}
          onChange={handlePlantFilterChange}
        >
          <option value="all">All Plants</option>
          {plantItems.map((p) => (
            <option key={p.plant_code} value={p.plant_code}>
              {p.plant_name} ({p.plant_code})
            </option>
          ))}
        </select>
        <select
          className="w-[150px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
          value={filterLine}
          onChange={handleLineFilterChange}
        >
          <option value="all">All Lines</option>
          {lineOptions.map((l) => (
            <option key={`${l.plant_code}-${l.line_name}`} value={l.line_name}>
              {l.line_name}
            </option>
          ))}
        </select>
        <select
          className="w-[160px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
          value={filterMachine}
          onChange={(e) => setFilterMachine(e.target.value)}
        >
          <option value="all">All Machines</option>
          {machineOptions.map((m) => (
            <option key={`${m.plant_code}-${m.line_name}-${m.machine_name}`} value={m.machine_name}>
              {m.machine_name}
            </option>
          ))}
        </select>

        <div className="w-px h-6 bg-[#E2E8F0]" />

        <span className="text-sm font-bold text-[#64748B] uppercase tracking-[0.5px]">Checklist:</span>
        <select
          className="w-[300px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg font-semibold text-[#0B1F3A] bg-white outline-none focus:border-[#3B82F6] disabled:text-[#94A3B8] disabled:font-normal"
          value={effectiveSelectedId || ""}
          onChange={(e) => dispatch(setSelectedChecklistHeader(e.target.value))}
          disabled={filteredHeaders.length === 0}
        >
          {filteredHeaders.length === 0 && <option>No checklist in this scope</option>}
          {filteredHeaders.map((h) => (
            <option key={h.cdb_object_id} value={h.cdb_object_id}>
              {/* Backend column is `checklist_name`, not `checklist_title` */}
              {h.checklist_name || `${h.equipment_code || "Unknown Equipment"} — ${h.frequency}`}
            </option>
          ))}
        </select>
        <span className="text-xs text-[#94A3B8] whitespace-nowrap">
          {filteredHeaders.length}/{headers.items.length}
        </span>

        {(filterPlant !== "all" || filterLine !== "all" || filterMachine !== "all") && (
          <button
            className="text-sm font-semibold text-[#2563EB] hover:text-[#1E5291] cursor-pointer bg-transparent border-none py-[5px]"
            onClick={() => {
              setFilterPlant("all");
              setFilterLine("all");
              setFilterMachine("all");
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {headers.status === "loading" && (
        <p className="text-sm text-[#64748B] py-2 -mt-2 mb-2">Loading checklists…</p>
      )}
      {headers.status === "failed" && (
        <p className="text-sm text-[#DC2626] py-2 -mt-2 mb-2">Load failed: {headers.error}</p>
      )}
      {headers.status === "succeeded" && headers.items.length === 0 && (
        <p className="text-sm text-[#64748B] py-2 -mt-2 mb-2">
          No checklists yet — create one with "+ New Checklist".
        </p>
      )}
      {headers.status === "succeeded" && headers.items.length > 0 && filteredHeaders.length === 0 && (
        <p className="text-sm text-[#64748B] py-2 -mt-2 mb-2">
          No checklist found in this scope — widen the filter or click "Clear".
        </p>
      )}

      {selectedHeader && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
          {/* Card header — checklist title + Plant/Line/Machine breadcrumb + Edit */}
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div className="text-sm font-bold text-[#0B1F3A]">
              {selectedHeader.checklist_name}
            </div>
            <button
              className="py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]"
              onClick={() =>
                alert("Wire this button up to an inline edit field for the checklist title")
              }
            >
              Edit
            </button>
          </div>

          {/* Which Plant › Line › Machine this checklist belongs to — clear context */}
          {selectedEquipment && (
            <div className="text-xs text-[#94A3B8] mb-4 flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-[#64748B]">
                {plantNameByCode[String(selectedEquipment.plant_code)] || selectedEquipment.plant_code}
              </span>
              {selectedEquipment.line && (
                <>
                  <span className="text-[10px] text-[#CBD5E1]">›</span>
                  <span>{selectedEquipment.line}</span>
                </>
              )}
              {selectedEquipment.machine && (
                <>
                  <span className="text-[10px] text-[#CBD5E1]">›</span>
                  <span>{selectedEquipment.machine}</span>
                </>
              )}
              <span className="text-[10px] text-[#CBD5E1]">›</span>
              <span className="font-semibold text-[#2563EB]">
                {selectedHeader.equipment_code}
              </span>
            </div>
          )}

          {/* Equipment + Frequency linked to this checklist (changing these updates the header) */}
          <div className="flex items-end gap-2.5 mb-5 flex-wrap">
            <div>
              <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.4px] mb-1">
                Linked Equipment
              </div>
              <select
                className="w-[220px] text-xs py-[7px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                value={selectedHeader.equipment_code || ""}
                onChange={handleEquipmentChange}
              >
                {equipmentItems.map((eq) => (
                  <option key={eq.equipment_code} value={eq.equipment_code}>
                    {eq.equipment_code} — {eq.equipment_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.4px] mb-1">
                Frequency
              </div>
              <select
                className="w-[140px] text-xs py-[7px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                value={selectedHeader.frequency || "Daily"}
                onChange={handleFrequencyChange}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          {/* Check point rows */}
          {items.status === "loading" && (
            <p className="text-sm text-[#64748B] py-3">Loading check points…</p>
          )}
          {items.status === "succeeded" && checkPoints.length === 0 && (
            <p className="text-sm text-[#64748B] py-3">
              No check points yet — add one with "+ Add Check Point".
            </p>
          )}

          {checkPoints.map((cp, idx) => (
            <div
              key={cp.cdb_object_id}
              className="flex items-center gap-4 py-3.5 border-b border-[#F1F5F9] last:border-b-0 group"
            >
              <div className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#0B1F3A]">
                  {cp.title}
                </div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  {[cp.sop_ref, cp.limit_value, cp.instrument && `Instrument: ${cp.instrument}`]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    String(cp.is_active) === "1" ? "text-[#059669]" : "text-[#94A3B8]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      String(cp.is_active) === "1" ? "bg-[#059669]" : "bg-[#94A3B8]"
                    }`}
                  />
                  {String(cp.is_active) === "1" ? "Active" : "Inactive"}
                </span>
                <button
                  className="text-xs font-semibold text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setEditingCheckPoint(cp);
                    setCheckPointModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-xs font-semibold text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteCheckPoint(cp)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <button
            className="mt-4 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]"
            onClick={() => {
              setEditingCheckPoint(null);
              setCheckPointModalOpen(true);
            }}
          >
            + Add Check Point
          </button>
        </div>
      )}

      <AddChecklistModal isOpen={newChecklistOpen} onClose={() => setNewChecklistOpen(false)} />
      <AddCheckPointModal
        isOpen={checkPointModalOpen}
        onClose={() => {
          setCheckPointModalOpen(false);
          setEditingCheckPoint(null);
        }}
        checklistHeaderId={effectiveSelectedId}
        equipmentCode={selectedHeader?.equipment_code}
        nextSeqNo={nextSeqNo}
        checkPoint={editingCheckPoint}
      />
    </div>
  );
};

export default ChecklistBuilder;