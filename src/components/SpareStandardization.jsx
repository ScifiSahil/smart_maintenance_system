import React, { useState } from 'react';
import { PARTS, HIER, DUPLICATES, MASTER_CATALOG } from './spareStandardizationData';

// ── Single, self-contained STATIC tab for AdminPage. No Redux, no API — all
// state is local useState and all data is imported from the static data file.
// Renders inside AdminPage's <main>, so it brings no top-nav / sidebar of its
// own; just a header + internal sub-tabs. Styling uses Tailwind arbitrary
// values to match the rest of the Admin panel.

// ── tiny presentational helpers ──────────────────────────────────────────
const TONE = {
  ok: 'bg-[#D1FAE5] text-[#047857]', critical: 'bg-[#FEE2E2] text-[#B91C1C]',
  high: 'bg-[#FFEDD5] text-[#C2410C]', medium: 'bg-[#FEF3C7] text-[#B45309]',
  low: 'bg-[#F1F5F9] text-[#475569]', neutral: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
};
const Badge = ({ tone = 'neutral', children }) => (
  <span className={`inline-flex items-center text-[11px] font-bold py-[3px] px-2.5 rounded-full leading-snug ${TONE[tone]}`}>{children}</span>
);
const statusTone = (s) => (s === 'Standardized' ? 'ok' : s === 'Under Review' ? 'medium' : 'critical');
const critInfo = (c) => (c === 'Critical' ? ['critical', 'Critical (Vital)'] : c === 'Essential' ? ['high', 'Essential'] : ['medium', 'Desirable']);
const locTone = (c) => (c === 'Main Store' ? 'ok' : c === 'Maintenance Store' ? 'medium' : 'low');
const uniq = (arr) => [...new Set(arr)];

const FIELD = 'text-[10px] font-bold tracking-[0.4px] uppercase text-[#94A3B8] mb-1';
const VAL = 'text-[13px] font-bold text-[#0F2942]';
const CARD = 'bg-white border border-[#E2E8F0] rounded-xl p-4 mb-3.5';
const INPUT = 'text-sm py-[9px] px-3 border-[1.5px] border-[#E2E8F0] rounded-lg text-[#334155] bg-white outline-none focus:border-[#60A5FA]';

// Layout as inline styles so it renders correctly even if Tailwind's compiled
// output.css hasn't been rebuilt to include these (responsive/arbitrary) grids.
const GRID_KPI = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 };
const GRID_CARDS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 };
const GRID_LINKS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 };
const GRID_FIELDS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 };
const GRID_2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 };
const KPI_TILE = { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: 14, textAlign: 'center' };
const KPI_VAL = { fontSize: 22, fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: '#0F2942' };
const KPI_LBL = { fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: 600, letterSpacing: '.3px', textTransform: 'uppercase' };

// ── Part detail modal ─────────────────────────────────────────────────────
function PartModal({ code, onClose }) {
  const p = code && PARTS[code];
  if (!p) return null;
  const [ctone, clabel] = critInfo(p.criticality);
  const total = p.plantStock.reduce((a, b) => a + b.stock, 0);
  return (
    <div className="fixed inset-0 bg-[rgba(15,23,42,0.55)] z-[1000] flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[820px] max-h-[88vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between py-[18px] px-[22px] border-b border-[#E2E8F0] sticky top-0 bg-white">
          <div className="text-base font-bold text-[#0F2942]">🔩 {p.code} — {p.name}</div>
          <button className="bg-[#F1F5F9] w-[30px] h-[30px] rounded-lg text-[#64748B] cursor-pointer border-none" onClick={onClose}>✕</button>
        </div>
        <div className="p-[22px]">
          <div className="flex gap-1.5 flex-wrap mb-3">
            <Badge tone={ctone}>{clabel}</Badge><Badge tone={statusTone(p.status)}>{p.status}</Badge>
            <Badge>ABC-{p.abc}</Badge><Badge>{p.category} / {p.sub}</Badge>
          </div>
          <div style={{ ...GRID_FIELDS, marginBottom: 16 }}>
            {[['Standard Code', p.code], ['UOM', p.uom], ['HSN', p.hsn], ['Rotable?', p.rotable], ['Insurance?', p.insurance], ['Shelf Life', p.shelfLife]].map(([l, v]) => (
              <div className="bg-white border border-[#E2E8F0] rounded-lg py-2.5 px-3" key={l}><div className={FIELD}>{l}</div><div className="text-[13px] font-semibold text-[#0F2942]">{v}</div></div>
            ))}
          </div>
          <div className={CARD}><div className={FIELD}>Specification</div><div className="text-[13px] font-semibold text-[#0F2942]">{p.spec}</div></div>
          <div className={CARD}><div className={FIELD}>BOM Location</div><div className="text-[13px] font-semibold text-[#0F2942]">{p.bom.machine} › {p.bom.assembly} › {p.bom.sub} › {p.bom.component}</div></div>
          <div className={CARD}>
            <div className={`${FIELD} mb-2`}>OEM &amp; Interchangeable Alternates</div>
            <table className="w-full text-xs border-collapse">
              <thead><tr className="text-left text-[#64748B]"><th className="py-1.5 pr-3">Make</th><th className="py-1.5 pr-3">Part No.</th><th className="py-1.5">Note</th></tr></thead>
              <tbody>
                <tr className="bg-[#EFF6FF]"><td className="py-1.5 pr-3 font-semibold">{p.oem.make}</td><td className="py-1.5 pr-3 font-mono">{p.oem.partNo}</td><td className="py-1.5">Primary OEM</td></tr>
                {p.alternates.map((a, i) => <tr key={i}><td className="py-1.5 pr-3">{a.make}</td><td className="py-1.5 pr-3 font-mono">{a.partNo}</td><td className="py-1.5 text-[#64748B]">{a.note}</td></tr>)}
              </tbody>
            </table>
            {p.legacyCodes.length > 0 && <div className="mt-2 text-[11px] text-[#64748B]">🔗 Merged legacy codes: {p.legacyCodes.join(', ')}</div>}
          </div>
          <div className={CARD}>
            <div className={`${FIELD} mb-2`}>Inventory Norms &amp; Plant Stock (Total: {total} {p.uom})</div>
            <div className="flex gap-4 mb-2 text-[13px]"><span>Min <b>{p.stockNorm.min}</b></span><span>ROL <b>{p.stockNorm.rol}</b></span><span>Max <b>{p.stockNorm.max}</b></span></div>
            <div className="flex flex-wrap gap-1.5">{p.plantStock.map((ps) => <span key={ps.plant} className="text-[11px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] py-1 px-2.5 rounded-full">{ps.plant}: <b className="text-[#0F2942]">{ps.stock}</b></span>)}</div>
          </div>
          <div className={`${CARD} mb-0`}>
            <div className={`${FIELD} mb-2`}>Approved Vendors</div>
            <table className="w-full text-xs border-collapse"><thead><tr className="text-left text-[#64748B]"><th className="py-1.5 pr-3">Vendor</th><th className="py-1.5 pr-3">Lead Time</th><th className="py-1.5">Last Price</th></tr></thead>
              <tbody>{p.vendors.map((v, i) => <tr key={i}><td className="py-1.5 pr-3">{v.name}</td><td className="py-1.5 pr-3">{v.leadTime}</td><td className="py-1.5">{v.price}</td></tr>)}</tbody></table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Location edit modal ─────────────────────────────────────────────────────
const SUB_STORES = ['Sub-Store: Bearings', 'Sub-Store: Seals & Gaskets', 'Sub-Store: Electricals', 'Sub-Store: Electronics', 'Sub-Store: Friction Parts', 'Sub-Store: Insurance Spares Cage'];
function LocationModal({ row, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ category: row.loc.category, plant: row.loc.plant, subStore: row.loc.subStore || '', remark: row.loc.remark || '' }));
  const showSub = form.category === 'Main Store' && form.plant === 'Ranjangaon R1';
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div className="fixed inset-0 bg-[rgba(15,23,42,0.55)] z-[1000] flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between py-[18px] px-[22px] border-b border-[#E2E8F0]">
          <div className="text-base font-bold text-[#0F2942]">📍 Edit Storage Location</div>
          <button className="bg-[#F1F5F9] w-[30px] h-[30px] rounded-lg text-[#64748B] cursor-pointer border-none" onClick={onClose}>✕</button>
        </div>
        <div className="p-[22px]">
          <div className="bg-[#EFF6FF] text-[#1D4ED8] text-[13px] rounded-lg py-3 px-4 mb-3.5">Editing location for <b>{row.code} — {row.component} / {row.sub}</b></div>
          <label className={FIELD}>Storage Category</label>
          <select className={`${INPUT} w-full mb-3.5`} value={form.category} onChange={set('category')}>
            <option>Plant Floor</option><option>Main Store</option><option>Maintenance Store</option>
          </select>
          <label className={FIELD}>Plant</label>
          <select className={`${INPUT} w-full mb-3.5`} value={form.plant} onChange={set('plant')}>
            <option>Ranjangaon R1</option><option>Ranjangaon R2</option><option>Mundhwa</option><option>Baramati</option>
          </select>
          {showSub && (<><label className={FIELD}>Sub-Store (R1 · Main Store only)</label>
            <select className={`${INPUT} w-full mb-3.5`} value={form.subStore} onChange={set('subStore')}><option value="">— None —</option>{SUB_STORES.map((s) => <option key={s}>{s}</option>)}</select></>)}
          <label className={FIELD}>Remark (bin / rack / note)</label>
          <textarea className={`${INPUT} w-full mb-3.5 min-h-[80px]`} value={form.remark} onChange={set('remark')} placeholder="e.g. Bin B-14, Rack 3…" />
          <button className="bg-[#2563EB] text-white text-sm font-semibold py-2.5 px-4 rounded-lg border-none cursor-pointer hover:bg-[#1E5291]" onClick={() => onSave(row.code, form)}>Save Location</button>
        </div>
      </div>
    </div>
  );
}

// ── Hierarchy tree node ─────────────────────────────────────────────────────
function TreeNode({ label, icon, count, depth, expandable, open, selected, onClick }) {
  return (
    <div className={`flex items-center gap-2 py-[7px] px-3.5 border-l-[3px] cursor-pointer text-[13px] transition-all
      ${selected ? 'bg-[#EFF6FF] border-l-[#3B82F6] text-[#2563EB] font-semibold' : 'border-l-transparent hover:bg-[#F8FAFC]'}`}
      style={{ paddingLeft: 14 + depth * 16, fontWeight: depth === 0 ? 700 : depth === 1 ? 600 : 500 }} onClick={onClick}>
      <span className="w-3.5 text-[10px] text-[#94A3B8]" style={{ visibility: expandable ? 'visible' : 'hidden', transform: open ? 'rotate(90deg)' : 'none' }}>▶</span>
      <span>{icon}</span><span className="flex-1 leading-tight">{label}</span>
      {count != null && <span className="text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] py-px px-1.5 rounded-full">{count}</span>}
    </div>
  );
}

// ── Part card (used in hierarchy detail) ────────────────────────────────────
function PartCard({ code, onOpen }) {
  const p = PARTS[code]; if (!p) return null;
  const [ctone, clabel] = critInfo(p.criticality);
  const accent = p.status === 'Standardized' ? '#059669' : p.status === 'Under Review' ? '#D97706' : '#DC2626';
  return (
    <div className="relative bg-white border border-[#E2E8F0] rounded-2xl p-3.5 cursor-pointer overflow-hidden hover:shadow-md hover:border-[#60A5FA] transition-all" onClick={() => onOpen(code)}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
      <div className="font-mono text-[11px] text-[#94A3B8] font-bold">{p.code}</div>
      <div className="text-[13px] font-bold text-[#0F2942] mt-1 mb-2">{p.name}</div>
      <div className="flex gap-1.5 flex-wrap"><Badge tone={ctone}>{clabel}</Badge><Badge tone={statusTone(p.status)}>{p.status}</Badge><Badge>ABC-{p.abc}</Badge></div>
    </div>
  );
}

// ═══════════════════════════════ MAIN ═══════════════════════════════════════
const SUBTABS = [['overview', '📊 Overview'], ['browser', '🌳 Hierarchy'], ['catalog', '📚 Master Catalog'], ['duplicates', '🧩 Duplicates'], ['request', '➕ Request New']];

export default function SpareStandardization() {
  const [section, setSection] = useState('overview');
  const [catalog, setCatalog] = useState(() => MASTER_CATALOG.map((r) => ({ ...r, loc: { ...r.loc } })));
  const [filters, setFilters] = useState({ term: '', location: 'all', plant: 'all' });
  const [partCode, setPartCode] = useState(null);
  const [locRow, setLocRow] = useState(null);
  const [merged, setMerged] = useState([]);
  const [pending, setPending] = useState([]);
  const [sel, setSel] = useState(null);          // hierarchy selection
  const [open, setOpen] = useState({});           // tree expand map
  const [req, setReq] = useState({ desc: '', plant: 'Ranjangaon R1', bom: '' });

  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));
  const saveLoc = (code, form) => {
    setCatalog((rows) => rows.map((r) => r.code !== code ? r : ({ ...r, loc: {
      category: form.category, plant: form.plant,
      subStore: form.category === 'Main Store' && form.plant === 'Ranjangaon R1' ? form.subStore || null : null,
      remark: form.remark } })));
    setLocRow(null);
  };

  // catalog filter + KPIs (kept simple/inline; static dataset is small)
  const rows = catalog.filter((r) => {
    const hay = `${r.code} ${r.component} ${r.sub} ${r.fn} ${r.proposedMat} ${r.remarks}`.toLowerCase();
    return (!filters.term || hay.includes(filters.term.toLowerCase()))
      && (filters.location === 'all' || r.loc.category === filters.location)
      && (filters.plant === 'all' || r.loc.plant === filters.plant);
  });
  const kpi = catalog.reduce((a, r) => ({
    total: catalog.length,
    plant: a.plant + (r.loc.category === 'Plant Floor' ? 1 : 0),
    main: a.main + (r.loc.category === 'Main Store' ? 1 : 0),
    maint: a.maint + (r.loc.category === 'Maintenance Store' ? 1 : 0),
    sub: a.sub + (r.loc.plant === 'Ranjangaon R1' && r.loc.subStore ? 1 : 0),
  }), { plant: 0, main: 0, maint: 0, sub: 0 });

  const dupWarn = req.desc.trim().length >= 4
    ? Object.values(PARTS).filter((p) => p.name.toLowerCase().includes(req.desc.toLowerCase()) || req.desc.toLowerCase().includes(p.sub.toLowerCase()))
    : [];

  return (
    <div>
      {/* header */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#94A3B8] mb-2">Admin<span className="text-xs text-[#CBD5E1]">›</span>Spare Standardization</div>
        <div className="text-2xl font-bold text-[#0F2942] tracking-[-0.3px]">Spare Part Standardization</div>
        <div className="text-base text-[#64748B] mt-[3px]">One standard code per physical part — mapped across Machine › Assembly › Sub-Assembly › Component, across all plants</div>
      </div>

      {/* sub-tab strip */}
      <div className="flex gap-1.5 border-b border-[#E2E8F0] mb-5 flex-wrap">
        {SUBTABS.map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)}
            className={`text-sm font-semibold py-2.5 px-3.5 border-none bg-transparent cursor-pointer border-b-2 -mb-px ${section === id ? 'text-[#2563EB] border-b-[#2563EB]' : 'text-[#64748B] border-b-transparent hover:text-[#2563EB]'}`}>
            {label}{id === 'duplicates' && <span className="ml-1.5 bg-[#DC2626] text-white text-[10px] font-bold py-px px-1.5 rounded-full">3</span>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {section === 'overview' && (
        <div>
          <div className="bg-[#EFF6FF] text-[#1D4ED8] text-[13px] rounded-lg py-3 px-4 mb-4 border border-[#BFDBFE]">ℹ️ Goal: eliminate duplicate part codes for the same physical spare across Ranjangaon R1/R2, Mundhwa and Baramati; enable cross-plant interchangeability; drive Min-Max norms off a single master record.</div>
          <div style={{ ...GRID_KPI, marginBottom: 20 }}>
            {[['10', 'Standardized SKUs', '#2563EB'], ['73%', 'Catalog Standardized', '#059669'], ['8', 'Legacy Codes Flagged', '#DC2626'], ['3', 'Duplicate Clusters Open', '#D97706'], ['₹4.6L', 'Est. Inventory Unlock', '#7C3AED']].map(([v, l, c]) => (
              <div key={l} style={{ ...KPI_TILE, borderTop: `3px solid ${c}` }}>
                <div style={KPI_VAL}>{v}</div><div style={KPI_LBL}>{l}</div>
              </div>
            ))}
          </div>
          <div style={GRID_LINKS}>
            {[['browser', '🌳 Browse by Hierarchy', 'Drill Machine → Assembly → Component → Part'], ['duplicates', '🧩 Resolve Duplicates', '3 clusters awaiting merge into one code'], ['request', '➕ Request New Code', 'Checks for a near-duplicate before creating an SPC']].map(([go, t, d]) => (
              <div key={go} className={`${CARD} cursor-pointer hover:border-[#60A5FA]`} onClick={() => setSection(go)}><div className="text-sm font-bold text-[#0F2942]">{t}</div><div className="text-xs text-[#64748B] mt-1">{d}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* ── HIERARCHY BROWSER ── */}
      {section === 'browser' && (
        <div className="flex gap-0 border border-[#E2E8F0] rounded-xl overflow-hidden min-h-[520px]">
          <div className="w-[300px] bg-white border-r border-[#E2E8F0] overflow-y-auto py-3.5 shrink-0">
            <div className="px-3.5 pb-2 text-[10px] font-bold tracking-[0.8px] uppercase text-[#94A3B8]">Machine Hierarchy</div>
            {HIER.map((m, mi) => {
              let cnt = 0; m.assemblies.forEach((a) => a.subs.forEach((s) => s.comps.forEach((c) => { cnt += c.parts.length; })));
              const mid = `m${mi}`;
              return (
                <div key={m.id}>
                  <TreeNode label={m.name} icon={m.icon} count={`${cnt} pt.`} depth={0} expandable open={open[mid]}
                    selected={sel && sel.k === mid} onClick={() => { toggle(mid); setSel({ k: mid, level: 'machine', mi }); }} />
                  {open[mid] && m.assemblies.map((a, ai) => {
                    const aid = `${mid}a${ai}`;
                    return (
                      <div key={ai}>
                        <TreeNode label={a.name} icon="🗂️" depth={1} expandable open={open[aid]}
                          selected={sel && sel.k === aid} onClick={() => { toggle(aid); setSel({ k: aid, level: 'assembly', mi, ai }); }} />
                        {open[aid] && a.subs.map((s, si) => {
                          const sid = `${aid}s${si}`;
                          return (
                            <div key={si}>
                              <TreeNode label={s.name} icon="📦" depth={2} expandable open={open[sid]}
                                selected={sel && sel.k === sid} onClick={() => { toggle(sid); setSel({ k: sid, level: 'sub', mi, ai, si }); }} />
                              {open[sid] && s.comps.map((c, ci) => {
                                const cid = `${sid}c${ci}`;
                                return <TreeNode key={ci} label={c.name} icon="🔧" count={c.parts.length} depth={3}
                                  selected={sel && sel.k === cid} onClick={() => setSel({ k: cid, level: 'comp', mi, ai, si, ci })} />;
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-6 min-w-0">
            {!sel ? (
              <div className="bg-[#EFF6FF] text-[#1D4ED8] text-[13px] rounded-lg py-3 px-4 border border-[#BFDBFE]">ℹ️ Select a Machine, Assembly, Sub-Assembly or Component on the left.</div>
            ) : (() => {
              const m = HIER[sel.mi]; const push = (arr, c) => { if (!arr.includes(c)) arr.push(c); };
              let title, sub, codes = [];
              if (sel.level === 'machine') { m.assemblies.forEach((a) => a.subs.forEach((s) => s.comps.forEach((c) => c.parts.forEach((p) => push(codes, p))))); title = `${m.icon} ${m.name}`; sub = `${m.assemblies.length} Assemblies · ${codes.length} unique parts`; }
              else { const a = m.assemblies[sel.ai];
                if (sel.level === 'assembly') { a.subs.forEach((s) => s.comps.forEach((c) => c.parts.forEach((p) => push(codes, p)))); title = `🗂️ ${a.name}`; sub = `${a.subs.length} Sub-Assemblies · ${codes.length} parts`; }
                else { const s = a.subs[sel.si];
                  if (sel.level === 'sub') { s.comps.forEach((c) => c.parts.forEach((p) => push(codes, p))); title = `📦 ${s.name}`; sub = `${s.comps.length} Components · ${codes.length} parts`; }
                  else { const c = s.comps[sel.ci]; codes = c.parts; title = `🔧 ${c.name}`; sub = `${c.parts.length} standardized part(s)`; } } }
              return (<>
                <div className="text-xl font-bold text-[#0F2942]">{title}</div>
                <div className="text-sm text-[#64748B] mb-4">{sub}</div>
                <div style={GRID_CARDS}>{uniq(codes).map((c) => <PartCard key={c} code={c} onOpen={setPartCode} />)}</div>
              </>);
            })()}
          </div>
        </div>
      )}

      {/* ── MASTER CATALOG ── */}
      {section === 'catalog' && (
        <div>
          <div style={{ ...GRID_KPI, marginBottom: 16 }}>
            {[[kpi.total, 'Total Records', '#2563EB'], [kpi.plant, 'On Plant / Not Stocked', '#059669'], [kpi.main, 'In Main Store', '#D97706'], [kpi.maint, 'In Maint. Store', '#DC2626'], [kpi.sub, 'R1 Sub-Store', '#7C3AED']].map(([v, l, c]) => (
              <div key={l} style={{ ...KPI_TILE, borderTop: `3px solid ${c}` }}><div style={KPI_VAL}>{v}</div><div style={KPI_LBL}>{l}</div></div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center mb-4">
            <input className={`${INPUT} w-[240px]`} placeholder="🔍 Search code, component, material…" value={filters.term} onChange={(e) => setFilters((f) => ({ ...f, term: e.target.value }))} />
            <select className={INPUT} value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}><option value="all">All Storage</option><option>Plant Floor</option><option>Main Store</option><option>Maintenance Store</option></select>
            <select className={INPUT} value={filters.plant} onChange={(e) => setFilters((f) => ({ ...f, plant: e.target.value }))}><option value="all">All Plants</option><option>Ranjangaon R1</option><option>Ranjangaon R2</option><option>Mundhwa</option><option>Baramati</option></select>
            <button className="text-sm font-semibold py-[9px] px-3 rounded-lg bg-white text-[#334155] border border-[#CBD5E1] cursor-pointer hover:bg-[#F8FAFC]" onClick={() => setFilters({ term: '', location: 'all', plant: 'all' })}>✕ Clear</button>
            <span className="ml-auto text-[11px] text-[#94A3B8]">💡 Row → full spec · 📍 → edit location</span>
          </div>
          <div className="overflow-auto border border-[#E2E8F0] rounded-lg max-h-[600px]">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="text-left text-[#64748B]">{['Std Code', 'Component', 'Sub', 'Function', 'Proposed Material', 'Insp. Freq.', 'Wear Limit', 'Storage', 'Remark'].map((h) => <th key={h} className="bg-[#F8FAFC] py-2.5 px-3.5 font-bold uppercase text-[11px] tracking-[0.3px] border-b border-[#E2E8F0] whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.code} className="cursor-pointer hover:bg-[#F8FAFC] border-b border-[#F1F5F9]" onClick={() => setPartCode(PARTS[r.code] ? r.code : null)}>
                    <td className="py-2.5 px-3.5 font-mono font-bold">{r.code}</td>
                    <td className="py-2.5 px-3.5 font-semibold text-[#0F2942]">{r.component}</td>
                    <td className="py-2.5 px-3.5">{r.sub}</td><td className="py-2.5 px-3.5">{r.fn}</td>
                    <td className="py-2.5 px-3.5">{r.proposedMat}</td><td className="py-2.5 px-3.5">{r.inspFreq}</td><td className="py-2.5 px-3.5">{r.wearLimit}</td>
                    <td className="py-2.5 px-3.5" onClick={(e) => { e.stopPropagation(); setLocRow(r); }}>
                      <Badge tone={locTone(r.loc.category)}>{r.loc.category}</Badge>
                      <div className="text-[11px] text-[#64748B] mt-0.5">{r.loc.plant}{r.loc.subStore ? ` · ${r.loc.subStore}` : ''} <span className="text-[#2563EB]">📍 edit</span></div>
                    </td>
                    <td className="py-2.5 px-3.5">{r.loc.remark || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && <div className="bg-[#FEF3C7] text-[#92400E] text-[13px] rounded-lg py-3 px-4 mt-2.5 border border-[#FDE68A]">No records match the current filters.</div>}
        </div>
      )}

      {/* ── DUPLICATES ── */}
      {section === 'duplicates' && (
        <div>
          <div className="bg-[#FEF3C7] text-[#92400E] text-[13px] rounded-lg py-3 px-4 mb-4 border border-[#FDE68A]">⚠️ 3 clusters detected by description/spec similarity across plant ERPs. Merge to stop duplicate purchasing and split stock records.</div>
          {DUPLICATES.map((d, i) => {
            const done = merged.includes(i);
            return (
              <div key={d.target} className={`bg-white border border-[#E2E8F0] rounded-2xl py-4 px-[18px] mb-3.5 border-l-4 ${done ? 'border-l-[#059669] opacity-70' : 'border-l-[#DC2626]'}`}>
                <div className="flex justify-between items-start gap-3 mb-2.5 flex-wrap">
                  <div><div className="text-[11px] font-bold text-[#DC2626] uppercase tracking-[0.4px]">Duplicate Cluster #{i + 1}</div><div className="text-[15px] font-bold text-[#0F2942]">Merge into {d.target} — {d.targetName}</div></div>
                  {done ? <Badge tone="ok">✓ Merged</Badge> : <button className="bg-[#059669] text-white text-xs font-semibold py-1.5 px-3 rounded-lg border-none cursor-pointer" onClick={() => setMerged((m) => [...m, i])}>✓ Merge into Standard Code</button>}
                </div>
                {d.legacy.map((l) => <div key={l.code} className="flex items-center gap-2.5 py-2 px-2.5 bg-[#F8FAFC] rounded-md mb-1.5 text-xs"><span className="font-bold text-[#64748B] w-[90px] shrink-0">{l.plant}</span><span className="font-mono font-bold text-[#0F2942] w-[120px] shrink-0">{l.code}</span><span className="text-[#64748B]">{l.desc}</span></div>)}
                <div className="text-xs text-[#059669] font-semibold mt-2">💰 {d.saving}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── REQUEST NEW PART ── */}
      {section === 'request' && (
        <div className="max-w-[760px]">
          <div className={CARD}>
            <div className="text-sm font-bold text-[#0F2942] mb-3">New Part Request Form</div>
            <label className={FIELD}>Part Description</label>
            <input className={`${INPUT} w-full mb-3.5`} placeholder="e.g. Bearing, Deep Groove Ball, 6308" value={req.desc} onChange={(e) => setReq((r) => ({ ...r, desc: e.target.value }))} />
            <div style={GRID_2}>
              <div><label className={FIELD}>Requesting Plant</label><select className={`${INPUT} w-full`} value={req.plant} onChange={(e) => setReq((r) => ({ ...r, plant: e.target.value }))}><option>Ranjangaon R1</option><option>Ranjangaon R2</option><option>Mundhwa</option><option>Baramati</option></select></div>
              <div><label className={FIELD}>Machine / Assembly / Component</label><input className={`${INPUT} w-full`} placeholder="e.g. Forging Press / Main Drive / Bearing Housing" value={req.bom} onChange={(e) => setReq((r) => ({ ...r, bom: e.target.value }))} /></div>
            </div>
            {dupWarn.length > 0 && <div className="bg-[#FEF3C7] text-[#92400E] text-[13px] rounded-lg py-3 px-4 my-3.5 border border-[#FDE68A]">⚠️ Possible existing match: {dupWarn.map((h, i) => <span key={h.code}>{i > 0 ? ', ' : ''}<b>{h.code}</b> ({h.name})</span>)}</div>}
            <button className="bg-[#2563EB] text-white text-sm font-semibold py-2.5 px-4 rounded-lg border-none cursor-pointer mt-3.5 hover:bg-[#1E5291]"
              onClick={() => { if (req.desc.trim()) { setPending((p) => [...p, req]); setReq({ desc: '', plant: 'Ranjangaon R1', bom: '' }); } }}>Submit for Master Data Approval</button>
          </div>
          {pending.length > 0 && (
            <div className={CARD}><div className="text-sm font-bold text-[#0F2942] mb-2">Pending Approval Queue</div>
              {pending.map((r, i) => <div key={i} className="flex items-center gap-2.5 py-2 px-2.5 bg-[#FEF3C7] rounded-md mb-1.5 text-xs"><Badge tone="medium">Pending</Badge><span className="font-bold text-[#0F2942]">{r.desc}</span><span className="text-[#64748B] ml-auto">{r.plant} · {r.bom || 'BOM not specified'}</span></div>)}
            </div>
          )}
        </div>
      )}

      {/* modals */}
      <PartModal code={partCode} onClose={() => setPartCode(null)} />
      {locRow && <LocationModal row={locRow} onClose={() => setLocRow(null)} onSave={saveLoc} />}
    </div>
  );
}