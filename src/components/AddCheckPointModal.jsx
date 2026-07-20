// components/AddCheckPointModal.jsx
// Local form state only (useState). Submitting dispatches addCheckPoint or
// editCheckPoint. Same pattern as AddEquipmentModal.jsx.
//
// NOTE on field names: the smartpm_admin_checklist_item table's real columns
// are `title` (not check_point_title), `limit_value` (not limit_text), and
// it has its own `equipment_code` column. It does NOT have a
// `checklist_header_id` column — the only header-link-looking column is
// `checklist_id`, which is typed Integer while the header's id is a UUID
// string, so we deliberately do NOT send it (would likely 500 on a type
// mismatch). Linking is done purely via equipment_code instead.

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCheckPoint, editCheckPoint } from "../actions/checklistActions";

const inputClass =
  "w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]";

const EMPTY_FORM = {
  title: "",
  sop_ref: "",
  limit_value: "",
  instrument: "",
  is_active: "1",
};

const AddCheckPointModal = ({ isOpen, onClose, equipmentCode, nextSeqNo, checkPoint }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(checkPoint);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // On open — prefill from the existing check point when editing, else start blank
  useEffect(() => {
    if (isOpen) {
      setForm(
        checkPoint
          ? {
              title: checkPoint.title || "",
              sop_ref: checkPoint.sop_ref || "",
              limit_value: checkPoint.limit_value || "",
              instrument: checkPoint.instrument || "",
              is_active: String(checkPoint.is_active ?? "1"),
            }
          : EMPTY_FORM,
      );
      setError("");
    }
  }, [isOpen, checkPoint]);

  if (!isOpen) return null;

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.title) {
      setError("Check point title is required");
      return;
    }
    if (!isEdit && !equipmentCode) {
      setError("No equipment selected for this checklist — pick a checklist first");
      return;
    }
    setSaving(true);
    setError("");

    const payload = { ...form };
    const result = isEdit
      ? await dispatch(editCheckPoint(checkPoint.cdb_object_id, payload))
      : await dispatch(
          addCheckPoint({
            ...payload,
            equipment_code: equipmentCode,
            seq_no: String(nextSeqNo), // column is Char(10) — must be a string, not a number
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
          <div className="text-base font-bold text-[#0B1F3A]">
            {isEdit ? "Edit Check Point" : "Add Check Point"}
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

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
              Check Point Title
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Bearing Temperature Check"
              value={form.title}
              onChange={handleChange("title")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                SOP Reference
              </label>
              <input
                className={inputClass}
                placeholder="e.g. SOP-PM-001"
                value={form.sop_ref}
                onChange={handleChange("sop_ref")}
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                Instrument
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Temp Gun"
                value={form.instrument}
                onChange={handleChange("instrument")}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
              Limit / Standard
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Limit: <80°C"
              value={form.limit_value}
              onChange={handleChange("limit_value")}
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
              Status
            </label>
            <select
              className={inputClass}
              value={form.is_active}
              onChange={handleChange("is_active")}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
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
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Check Point"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCheckPointModal;