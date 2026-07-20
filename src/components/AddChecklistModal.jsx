// components/AddChecklistModal.jsx
// Opened from the "+ New Checklist" button — pick the equipment via a
// cascading Plant → Line → Machine → Equipment filter (same pattern as
// Equipment Register), then choose a Frequency to create a new checklist
// header. Check points are added afterward with "+ Add Check Point".

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addChecklistHeader } from "../actions/checklistActions";

const inputClass =
  "w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]";

const AddChecklistModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { items: equipmentItems, status: equipmentStatus } = useSelector((s) => s.equipment);
  const { items: plantItems, status: plantsStatus } = useSelector((s) => s.plants);
  const { items: lineItems, status: linesStatus } = useSelector((s) => s.lines);
  const { items: machineItems, status: machinesStatus } = useSelector((s) => s.machines);

  const [plantCode, setPlantCode] = useState("");
  const [lineName, setLineName] = useState("");
  const [machineName, setMachineName] = useState("");
  const [equipmentCode, setEquipmentCode] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset all filters on open — auto-select the first available plant
  useEffect(() => {
    if (isOpen) {
      setPlantCode(String(plantItems[0]?.plant_code ?? ""));
      setLineName("");
      setMachineName("");
      setEquipmentCode("");
      setFrequency("Daily");
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Line dropdown — scoped to the selected Plant, deduped by name
  const lineOptions = [
    ...new Map(
      lineItems
        .filter((l) => !plantCode || String(l.plant_code) === String(plantCode))
        .map((l) => [l.line_name, l]),
    ).values(),
  ];

  // Machine dropdown — scoped to the selected Plant + Line
  const machineOptions = [
    ...new Map(
      machineItems
        .filter(
          (m) =>
            (!plantCode || String(m.plant_code) === String(plantCode)) &&
            (!lineName || String(m.line_name) === String(lineName)),
        )
        .map((m) => [m.machine_name, m]),
    ).values(),
  ];

  // Equipment dropdown — scoped to Plant + Line + Machine
  const equipmentOptions = equipmentItems.filter(
    (eq) =>
      (!plantCode || String(eq.plant_code) === String(plantCode)) &&
      (!lineName || String(eq.line || "") === String(lineName)) &&
      (!machineName || String(eq.machine || "") === String(machineName)),
  );

  // Changing Plant resets Line + Machine + Equipment
  const handlePlantChange = (e) => {
    setPlantCode(e.target.value);
    setLineName("");
    setMachineName("");
    setEquipmentCode("");
  };

  // Changing Line resets Machine + Equipment
  const handleLineChange = (e) => {
    setLineName(e.target.value);
    setMachineName("");
    setEquipmentCode("");
  };

  // Changing Machine resets Equipment
  const handleMachineChange = (e) => {
    setMachineName(e.target.value);
    setEquipmentCode("");
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!equipmentCode) {
      setError("Select an equipment (narrow down by Plant/Line/Machine)");
      return;
    }
    setSaving(true);
    setError("");

    const eq = equipmentItems.find((e) => e.equipment_code === equipmentCode);
    const checklistName = `${equipmentCode} — ${eq?.equipment_name || "Equipment"} ${frequency} Checklist`;

    const result = await dispatch(
      addChecklistHeader({
        equipment_code: equipmentCode,
        frequency,
        // Backend column is `checklist_name` (Char(15)) — NOT `checklist_title`.
        // Sending `checklist_title` was silently dropped by CDB since no such
        // attribute exists on smartpm_admin_checklist_header.
        checklist_name: checklistName,
        is_active: "1",
      }),
    );

    setSaving(false);
    if (!result.ok) {
      setError(result.message || "Save failed, please try again");
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center p-5">
      <div className="bg-white rounded-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04)]">
        <div className="py-5 px-6 pb-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="text-base font-bold text-[#0B1F3A]">New Checklist</div>
          <button
            className="w-8 h-8 rounded-md border-none bg-[#F1F5F9] cursor-pointer text-base flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="py-5 px-6">
          {error && (
            <div className="mb-3 text-xs text-[#991B1B] bg-[#FEF2F2] py-2 px-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] mb-2">
            Which equipment is this for — narrow down by Plant
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">Plant</label>
              <select className={inputClass} value={plantCode} onChange={handlePlantChange}>
                {plantsStatus === "loading" && <option value="">Loading plants…</option>}
                <option value="">All Plants</option>
                {plantItems.map((p) => (
                  <option key={p.plant_code} value={p.plant_code}>
                    {p.plant_name} ({p.plant_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">Line</label>
              <select className={inputClass} value={lineName} onChange={handleLineChange}>
                <option value="">All Lines</option>
                {linesStatus === "loading" && <option disabled>Loading lines…</option>}
                {lineOptions.map((l) => (
                  <option key={`${l.plant_code}-${l.line_name}`} value={l.line_name}>
                    {l.line_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">Machine</label>
            <select className={inputClass} value={machineName} onChange={handleMachineChange}>
              <option value="">All Machines</option>
              {machinesStatus === "loading" && <option disabled>Loading machines…</option>}
              {machineOptions.map((m) => (
                <option key={`${m.plant_code}-${m.line_name}-${m.machine_name}`} value={m.machine_name}>
                  {m.machine_name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-px bg-[#E2E8F0] my-4" />

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">Equipment</label>
            <select
              className={inputClass}
              value={equipmentCode}
              onChange={(e) => setEquipmentCode(e.target.value)}
            >
              <option value="">— Select equipment —</option>
              {equipmentStatus === "loading" && <option disabled>Loading equipment…</option>}
              {equipmentOptions.map((eq) => (
                <option key={eq.equipment_code} value={eq.equipment_code}>
                  {eq.equipment_code} — {eq.equipment_name}
                </option>
              ))}
            </select>
            {equipmentOptions.length === 0 && equipmentStatus === "succeeded" && (
              <div className="text-[11px] text-[#94A3B8] mt-1">
                No equipment found for this Plant/Line/Machine — widen the filter.
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">Frequency</label>
            <select className={inputClass} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
          </div>
        </div>

        <div className="py-4 px-6 border-t border-[#E2E8F0] flex justify-end gap-2.5">
          <button
            className="py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none bg-[#2563EB] text-white hover:bg-[#1E5291] disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Create Checklist"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddChecklistModal;