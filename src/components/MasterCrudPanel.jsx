// components/MasterCrudPanel.jsx
// Generic CRUD table+form — Plant/Line/Machine Master Configuration pages
// isi ek component se banate hain, sirf title/columns/fields alag pass hote hain.
// UI Equipment Register ke card/table pattern ke saath consistent rakha gaya hai.

import { useState, useEffect } from "react";

const inputClass =
  "w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-base text-[#334155] bg-white outline-none focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(79,70,229,0.10)]";

/**
 * Props:
 *  title        — "Plant Master" etc (button label + modal title mein use hota hai)
 *  description  — chhoti subtitle line
 *  columns      — [{ key, label }]  — table header/rows ke liye
 *  fields       — [{ key, label, placeholder, type: 'text'|'number', required }] — form ke liye
 *  items        — redux se aayi list (raw rows, cdb_object_id ke saath)
 *  status       — 'idle' | 'loading' | 'succeeded' | 'failed'
 *  error        — error message (agar status === 'failed')
 *  idKey        — default 'cdb_object_id'
 *  onAdd(data)      -> Promise<{ ok, message? }>
 *  onEdit(id, data) -> Promise<{ ok, message? }>
 *  onDelete(id)     -> Promise<{ ok, message? }>
 */
const MasterCrudPanel = ({
  title,
  description,
  columns,
  fields,
  items,
  status,
  error,
  idKey = "cdb_object_id",
  onAdd,
  onEdit,
  onDelete,
}) => {
  const emptyForm = () => fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Modal khulte waqt — edit mode mein existing row se prefill, add mode mein khali
  useEffect(() => {
    if (modalOpen) {
      setForm(
        editingRow
          ? fields.reduce((acc, f) => ({ ...acc, [f.key]: String(editingRow[f.key] ?? "") }), {})
          : emptyForm(),
      );
      setFormError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, editingRow]);

  const openAdd = () => {
    setEditingRow(null);
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingRow(null);
  };

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    const missing = fields.find((f) => f.required && !String(form[f.key] || "").trim());
    if (missing) {
      setFormError(`${missing.label} required hai`);
      return;
    }
    setSaving(true);
    setFormError("");

    // number type fields ko Number() se convert karte hain, submit se pehle
    const payload = { ...form };
    fields.forEach((f) => {
      if (f.type === "number" && payload[f.key] !== "") payload[f.key] = Number(payload[f.key]);
    });

    const result = editingRow ? await onEdit(editingRow[idKey], payload) : await onAdd(payload);

    setSaving(false);
    if (!result.ok) {
      setFormError(result.message || "Save nahi hua, dobara try karo");
      return;
    }
    closeModal();
  };

  // Confirm karke delete karta hai
  const handleDelete = async (row) => {
    const label = columns.map((c) => row[c.key]).filter(Boolean).join(" / ");
    const ok = window.confirm(`"${label}" delete karna hai?`);
    if (ok) await onDelete(row[idKey]);
  };

  const filteredItems = items.filter((row) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(term));
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-2xl font-bold text-[#0B1F3A] tracking-[-0.3px]">{title}</div>
          <div className="text-base text-[#64748B] mt-[3px]">{description}</div>
        </div>
        <button
          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-base font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#4F46E5] text-white hover:bg-[#4338CA]"
          onClick={openAdd}
        >
          + Add {title}
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl py-3 px-4 mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold text-[#64748B] uppercase tracking-[0.5px]">Search:</span>
        <input
          className="w-[240px] text-sm py-[5px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#6366F1]"
          placeholder={`🔍 Search ${title.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-sm text-[#94A3B8] ml-auto">
          {filteredItems.length} record{filteredItems.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
        {status === "loading" && <p className="text-base text-[#64748B] py-4 px-5">Loading…</p>}
        {status === "failed" && <p className="text-base text-[#DC2626] py-4 px-5">Load failed: {error}</p>}
        {status === "succeeded" && filteredItems.length === 0 && (
          <p className="text-base text-[#64748B] py-4 px-5">Koi record nahi mila.</p>
        )}

        {filteredItems.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="text-sm font-bold text-[#64748B] uppercase tracking-[0.5px] py-3 px-4"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="text-sm font-bold text-[#64748B] uppercase tracking-[0.5px] py-3 px-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((row, idx) => (
                <tr
                  key={row[idKey]}
                  className={`border-b border-[#F1F5F9] transition-colors duration-150 hover:bg-[#EEF2FF] ${idx % 2 === 1 ? "bg-[#FAFBFC]" : "bg-white"}`}
                >
                  {columns.map((c) =>
                    c.key === "plant_code" ? (
                      <td key={c.key} className="py-2.5 px-4">
                        <span className="inline-flex items-center py-0.5 px-2.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-sm font-semibold">
                          {row[c.key]}
                        </span>
                      </td>
                    ) : (
                      <td key={c.key} className="text-base text-[#334155] py-2.5 px-4">
                        {row[c.key]}
                      </td>
                    ),
                  )}
                  <td className="text-right py-2.5 px-4 whitespace-nowrap">
                    <button
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] mr-2 py-[3px] px-2.5 rounded-md bg-[#EEF2FF] border border-[#C7D2FE] cursor-pointer transition-all duration-150 hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5]"
                      onClick={() => openEdit(row)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#DC2626] py-[3px] px-2.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] cursor-pointer transition-all duration-150 hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626]"
                      onClick={() => handleDelete(row)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/45 z-[400] flex items-center justify-center p-5">
          <div className="bg-white rounded-xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04)]">
            <div className="py-5 px-6 pb-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="text-lg font-bold text-[#0B1F3A]">
                {editingRow ? `Edit ${title}` : `Add New ${title}`}
              </div>
              <button
                className="w-8 h-8 rounded-md border-none bg-[#F1F5F9] cursor-pointer text-lg flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0]"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <div className="py-5 px-6">
              {formError && (
                <div className="mb-3 text-sm text-[#991B1B] bg-[#FEF2F2] py-2 px-3 rounded-lg">{formError}</div>
              )}
              {fields.map((f) => (
                <div className="mb-4" key={f.key}>
                  <label className="block text-sm font-semibold text-[#334155] mb-[5px]">{f.label}</label>
                  <input
                    className={inputClass}
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder || ""}
                    value={form[f.key] ?? ""}
                    onChange={handleChange(f.key)}
                  />
                </div>
              ))}
            </div>

            <div className="py-4 px-6 border-t border-[#E2E8F0] flex justify-end gap-2.5">
              <button
                className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-base font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#4F46E5] text-white hover:bg-[#4338CA] disabled:opacity-60"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : editingRow ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterCrudPanel;