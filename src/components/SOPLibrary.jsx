// components/SOPLibrary.jsx
// SOP Library — list of uploaded SOPs (code, title, category, revision) with
// an "Upload SOP" modal and a full-screen preview viewer. Follows the exact
// same BLOB upload/preview/download pattern as SparePartPdfPanel.jsx, backed
// by /internal/smartpm_admin_sop_document (see smartpm_admin_sop_document.py).
//
// Field names match the actual smartpm_admin_sop_library Class Designer
// schema: sop_code Char(20), title Char(20), revision_no Integer,
// revision_date Date, category Char(10), is_active Char(20). Both title and
// category are very short columns, so inputs are capped to match
// (maxLength 20 / 10) and category uses short codes (not full labels).

import { useEffect, useRef, useState } from "react";
import apiAuth from "../services/apiAuth";
import { BASE, AUTH, REQUIRES_AUTH } from "../services/apiConfig";
import csrfService from "../services/csrfService";

const API_BASE = "/internal/smartpm_admin_sop_document";

// value = what's stored in the Char(10) "category" column, label = what's shown in the UI
const CATEGORY_OPTIONS = [
  { value: "ROTATING", label: "Rotating Equipment" },
  { value: "PUMP", label: "Pumps" },
  { value: "COMPRESSOR", label: "Compressors" },
  { value: "MOTOR", label: "Motors & Drives" },
  { value: "HEATEXCH", label: "Heat Exchangers" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "GENERAL", label: "General" },
];
const categoryLabel = (value) =>
  CATEGORY_OPTIONS.find((c) => c.value === value)?.label || value;

const SOPLibrary = () => {
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm] = useState({
    sop_code: "",
    title: "",
    category: CATEGORY_OPTIONS[0].value,
    revision_no: "1",
    revision_date: "",
  });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewSop, setPreviewSop] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    fetchSops();
  }, []);

  // ── List ──────────────────────────────────────────────────────────────────
  const fetchSops = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAuth.get(`${API_BASE}?action=list`);
      setSops(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Upload — FormData with auth headers, same pattern as SparePartPdfPanel ──
  const handleUpload = async () => {
    if (!form.sop_code || !form.title) {
      setUploadError("SOP Code and Title are required");
      return;
    }
    if (!file) {
      setUploadError("Please choose a file to upload");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sop_code", form.sop_code.slice(0, 20));
      formData.append("title", form.title.slice(0, 20));
      formData.append("category", form.category.slice(0, 10));
      formData.append("revision_no", form.revision_no);
      formData.append("revision_date", form.revision_date);

      // FormData upload needs raw fetch — NO Content-Type header (the browser
      // sets the multipart boundary itself), so we can't use apiAuth.post()
      // (it always JSON.stringifies and forces Content-Type: application/json).
      const endpoint = `${API_BASE}?action=upload`;
      const headers = {};
      if (REQUIRES_AUTH) {
        headers["Authorization"] = AUTH;
        const token = await csrfService.getCsrfToken();
        if (token) headers["X-CSRFToken"] = token;
      }

      const res = await fetch(`${BASE}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      const result = await res.json();
      if (result.error) throw new Error(result.error);
      _afterUpload();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const _afterUpload = () => {
    setUploadOpen(false);
    setForm({ sop_code: "", title: "", category: CATEGORY_OPTIONS[0].value, revision_no: "1", revision_date: "" });
    setFile(null);
    fetchSops();
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteFinal = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const data = await apiAuth.get(
        `${API_BASE}?action=delete&cdb_object_id=${encodeURIComponent(confirmDelete.cdb_object_id)}`,
      );
      if (data.error) throw new Error(data.error);
      setSops((prev) => prev.filter((s) => s.cdb_object_id !== confirmDelete.cdb_object_id));
      setConfirmDelete(null);
    } catch (err) {
      setError(err.message);
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── URL builders ──────────────────────────────────────────────────────────
  const getPreviewUrl = (blob_id) => `${BASE}${API_BASE}?action=preview&blob_id=${blob_id}`;
  const getDownloadUrl = (blob_id) => `${BASE}${API_BASE}?action=download&blob_id=${blob_id}`;

  const formatRevisionDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div>
      {/* Breadcrumb + Title */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-2 flex-wrap">
          Admin<span className="text-[10px] text-[#CBD5E1]">›</span>SOP Library
        </div>
        <div>
          <div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">SOP Library</div>
          <div className="text-[13px] text-[#64748B] mt-[3px]">
            Standard Operating Procedures for inspection tasks
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] py-2 px-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button className="font-bold cursor-pointer bg-transparent border-none text-[#991B1B]" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="text-sm font-bold text-[#0B1F3A]">Available SOPs</div>
          <button
            className="inline-flex items-center gap-1.5 py-[7px] px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none bg-[#2563EB] text-white hover:bg-[#1E5291]"
            onClick={() => setUploadOpen(true)}
          >
            Upload SOP
          </button>
        </div>

        {loading && <p className="text-sm text-[#64748B] py-4">Loading SOPs…</p>}
        {!loading && sops.length === 0 && (
          <p className="text-sm text-[#64748B] py-4">
            No SOPs uploaded yet — click "Upload SOP" to add the first one.
          </p>
        )}

        {sops.map((sop) => (
          <div
            key={sop.cdb_object_id}
            className="flex items-center gap-4 py-3.5 border-b border-[#F1F5F9] last:border-b-0 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
            <span className="text-[13px] font-bold text-[#2563EB] w-[110px] flex-shrink-0">
              {sop.sop_code}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#0B1F3A]">{sop.title}</div>
              {sop.category && (
                <div className="text-xs text-[#94A3B8] mt-0.5">{categoryLabel(sop.category)}</div>
              )}
            </div>
            <div className="text-xs text-[#94A3B8] flex-shrink-0 whitespace-nowrap">
              Rev {sop.revision_no} · {formatRevisionDate(sop.revision_date)}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1E5291] cursor-pointer bg-transparent border-none"
                onClick={() => {
                  setPreviewUrl(getPreviewUrl(sop.blob_id));
                  setPreviewSop(sop);
                  setZoomLevel(100);
                }}
              >
                View
              </button>
              <a
                className="text-xs font-semibold text-[#059669] hover:text-[#047857] no-underline"
                href={getDownloadUrl(sop.blob_id)}
              >
                Download
              </a>
              <button
                className="text-xs font-semibold text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
                onClick={() => setConfirmDelete(sop)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Upload SOP modal ─────────────────────────────────────────────── */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center p-5">
          <div className="bg-white rounded-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04)]">
            <div className="py-5 px-6 pb-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="text-base font-bold text-[#0B1F3A]">Upload SOP</div>
              <button
                className="w-8 h-8 rounded-md border-none bg-[#F1F5F9] cursor-pointer text-base flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0]"
                onClick={() => setUploadOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="py-5 px-6">
              {uploadError && (
                <div className="mb-3 text-xs text-[#991B1B] bg-[#FEF2F2] py-2 px-3 rounded-lg">
                  {uploadError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                    SOP Code <span className="text-[#94A3B8] font-normal">(max 20 chars)</span>
                  </label>
                  <input
                    className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                    placeholder="e.g. SOP-PM-005"
                    maxLength={20}
                    value={form.sop_code}
                    onChange={(e) => setForm((f) => ({ ...f, sop_code: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-[5px]">Category</label>
                  <select
                    className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#334155] mb-[5px]">
                  Title <span className="text-[#94A3B8] font-normal">(max 20 chars — keep it short)</span>
                </label>
                <input
                  className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                  placeholder="e.g. Daily Inspection"
                  maxLength={20}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-[5px]">Revision No.</label>
                  <input
                    type="number"
                    className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                    placeholder="e.g. 4"
                    value={form.revision_no}
                    onChange={(e) => setForm((f) => ({ ...f, revision_no: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-[5px]">Revision Date</label>
                  <input
                    type="date"
                    className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                    value={form.revision_date}
                    onChange={(e) => setForm((f) => ({ ...f, revision_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-xs font-semibold text-[#334155] mb-[5px]">File</label>
                <button
                  className="w-full py-[9px] px-3 border-[1.5px] border-dashed border-[#CBD5E1] rounded-lg text-[13px] text-[#64748B] bg-white cursor-pointer hover:border-[#3B82F6] text-left"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? file.name : "Click to choose a PDF or document…"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </div>
            </div>

            <div className="py-4 px-6 border-t border-[#E2E8F0] flex justify-end gap-2.5">
              <button
                className="py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]"
                onClick={() => setUploadOpen(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none bg-[#2563EB] text-white hover:bg-[#1E5291] disabled:opacity-60"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center p-5">
          <div className="bg-white rounded-xl p-6 w-full max-w-[380px] shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
            <div className="text-base font-bold text-[#0B1F3A] mb-2">Delete this SOP?</div>
            <p className="text-[13px] text-[#64748B] mb-5">
              <strong className="text-[#0B1F3A]">
                {confirmDelete.sop_code} — {confirmDelete.title}
              </strong>{" "}
              will be permanently removed from the library.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                className="py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none bg-[#DC2626] text-white hover:bg-[#B91C1C] disabled:opacity-60"
                onClick={handleDeleteFinal}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-screen preview — toolbar shows SOP code + title so the
           viewer always knows what document they're looking at ──────────── */}
      {previewUrl && (
        <div className="fixed inset-0 bg-[#111827] flex flex-col z-[300]">
          <div className="flex items-center justify-between gap-3 py-2 px-4 bg-[#1E2535] border-b border-[#374151] text-white flex-shrink-0">
            <span className="text-[13px] font-semibold text-[#E5E7EB] whitespace-nowrap overflow-hidden text-ellipsis max-w-[380px]">
              {previewSop?.sop_code} — {previewSop?.title}
            </span>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <button
                className="py-[5px] px-3 rounded-md bg-[#374151] border border-[#4B5563] text-white text-lg cursor-pointer leading-none"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              >
                −
              </button>
              {[75, 100, 125, 150, 200].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className="py-[5px] px-2.5 rounded-md text-[11px] font-semibold cursor-pointer"
                  style={{
                    background: zoomLevel === z ? "#3B82F6" : "#374151",
                    border: `1px solid ${zoomLevel === z ? "#3B82F6" : "#4B5563"}`,
                    color: zoomLevel === z ? "#fff" : "#9CA3AF",
                  }}
                >
                  {z}%
                </button>
              ))}
              <button
                className="py-[5px] px-3 rounded-md bg-[#374151] border border-[#4B5563] text-white text-lg cursor-pointer leading-none"
                onClick={() => setZoomLevel((z) => Math.min(300, z + 10))}
              >
                +
              </button>
              <span className="text-xs text-[#6B7280] min-w-[40px] text-center">{zoomLevel}%</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={getDownloadUrl(previewSop?.blob_id)}
                className="py-[6px] px-3.5 rounded-md bg-[#16A34A] text-white no-underline text-xs font-semibold"
              >
                Download
              </a>
              <button
                className="py-[6px] px-3.5 rounded-md bg-[#DC2626] border-none text-white text-xs font-semibold cursor-pointer"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewSop(null);
                  setZoomLevel(100);
                }}
              >
                Close
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-auto bg-[#374151] flex justify-center items-start"
            style={{ padding: zoomLevel <= 100 ? 0 : 20 }}
          >
            <iframe
              src={previewUrl}
              title={previewSop?.title}
              className="border-none block"
              style={{
                width: zoomLevel <= 100 ? "100%" : `${zoomLevel}%`,
                minWidth: zoomLevel <= 100 ? "100%" : "800px",
                height: "100%",
                minHeight: "calc(100vh - 48px)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SOPLibrary;