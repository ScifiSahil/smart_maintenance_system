// components/AddEquipmentModal.jsx
// Form state only (useState). Submit dispatches addEquipment — API call yahan nahi hota.

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment, editEquipment } from "../actions/equipmentActions";

const inputClass =
  "w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[14px] text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]";

const EMPTY_FORM = {
  equipment_code: "",
  equipment_name: "",
  plant_code: "",
  location: "",
  line: "",
  machine: "",
  assembly: "",
  sub_assembly: "",
  component: "",
  pm_frequency: "daily",
  category: "rotating",
  iiot_status: "no_iiot",
};

const AddEquipmentModal = ({ isOpen, onClose, equipment }) => {
  const dispatch = useDispatch();
  const { items: plantItems, status: plantsStatus } = useSelector(
    (s) => s.plants,
  );

  const isEdit = Boolean(equipment);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal khulte waqt — edit mode mein existing data se prefill, add mode mein khali
  useEffect(() => {
    if (isOpen) {
      setForm(
        equipment
          ? {
              equipment_code: equipment.equipment_code || "",
              equipment_name: equipment.equipment_name || "",
              plant_code: String(
                equipment.plant_code ?? plantItems[0]?.plant_code ?? "",
              ),
              location: equipment.location || "",
              line: equipment.line || "",
              machine: equipment.machine || "",
              assembly: equipment.assembly || "",
              sub_assembly: equipment.sub_assembly || "",
              component: equipment.component || "",
              pm_frequency: equipment.pm_frequency || "daily",
              category: equipment.category || "rotating",
              iiot_status: equipment.iiot_status || "no_iiot",
            }
          : {
              ...EMPTY_FORM,
              plant_code: String(plantItems[0]?.plant_code ?? ""),
            },
      );
      setError("");
    }
  }, [isOpen, equipment, plantItems]);

  if (!isOpen) return null;

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.equipment_code || !form.equipment_name) {
      setError("Equipment ID aur Name required hai");
      return;
    }
    setSaving(true);
    setError("");

    const payload = { ...form, plant_code: Number(form.plant_code) };
    const result = isEdit
      ? await dispatch(editEquipment(equipment.cdb_object_id, payload))
      : await dispatch(addEquipment({ ...payload, pm_status: "active" }));

    setSaving(false);
    if (!result.ok) {
      setError(result.message || "Save nahi hua, dobara try karo");
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center p-5">
      <div className="bg-white rounded-xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04)]">
        <div className="py-5 px-6 pb-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="text-base font-bold text-[#0B1F3A]">
            {isEdit ? "Edit Equipment" : "Add New Equipment"}
          </div>
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
          <div className="grid grid-cols-2 gap-3.5">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                Equipment ID
              </label>
              <input
                className={inputClass}
                placeholder="e.g. CP-201"
                value={form.equipment_code}
                onChange={handleChange("equipment_code")}
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                Equipment Name
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Centrifugal Pump"
                value={form.equipment_name}
                onChange={handleChange("equipment_name")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                Plant
              </label>
              <select
                className={inputClass}
                value={form.plant_code}
                onChange={handleChange("plant_code")}
              >
                {plantsStatus === "loading" && (
                  <option value="">Loading plants…</option>
                )}
                {plantsStatus === "failed" && (
                  <option value="">Plants load nahi hue</option>
                )}
                {plantItems.map((p) => (
                  <option key={p.plant_code} value={p.plant_code}>
                    {p.plant_name} ({p.plant_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                PM Frequency
              </label>
              <select
                className={inputClass}
                value={form.pm_frequency}
                onChange={handleChange("pm_frequency")}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                Line
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Line-1"
                value={form.line}
                onChange={handleChange("line")}
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                Machine
              </label>
              <input
                className={inputClass}
                placeholder="e.g. CNC-04"
                value={form.machine}
                onChange={handleChange("machine")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                Assembly
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Drive Assembly"
                value={form.assembly}
                onChange={handleChange("assembly")}
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                Sub-Assembly
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Coupling Unit"
                value={form.sub_assembly}
                onChange={handleChange("sub_assembly")}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
              Component
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Bearing"
              value={form.component}
              onChange={handleChange("component")}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
              Location
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Utility Block"
              value={form.location}
              onChange={handleChange("location")}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
              Equipment Category
            </label>
            <select
              className={inputClass}
              value={form.category}
              onChange={handleChange("category")}
            >
              <option value="rotating">Rotating Equipment</option>
              <option value="static">Static Equipment</option>
              <option value="electrical">Electrical</option>
              <option value="instrumentation">Instrumentation</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
              IIoT Status
            </label>
            <select
              className={inputClass}
              value={form.iiot_status}
              onChange={handleChange("iiot_status")}
            >
              <option value="no_iiot">No IIoT</option>
              <option value="connected">Connected</option>
            </select>
          </div>
        </div>

        <div className="py-4 px-6 border-t border-[#E2E8F0] flex justify-end gap-2.5">
          <button
            className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[14px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291] disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : isEdit
                ? "Update Equipment"
                : "Save Equipment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEquipmentModal;