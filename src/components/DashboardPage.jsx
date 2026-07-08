import React, { useEffect } from 'react';

/* ---------------------------------------------------------------
   Module-scope helpers (verbatim logic from the original page's
   <script> block). These are intentionally kept as plain JS,
   driving the DOM directly exactly as in the original demo.
------------------------------------------------------------------ */
function showSec(name, el) {
  // hide every top-level section
  document.querySelectorAll('main.main-content > [id^="sec-"]').forEach(s => s.style.display = 'none');
  const target = document.getElementById('sec-' + name);
  if (target) target.style.display = 'block';
  // update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  if (el) el.classList.add('active');
}

function showRelSub(subId, btn) {
  ['rel-sub-overview','rel-sub-mttr','rel-sub-mtbf','rel-sub-mttf','rel-sub-maintenance'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById(subId);
  if (target) target.style.display = 'block';
  // update pill active state (scoped inside sec-reliability)
  document.querySelectorAll('#sec-reliability .role-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

let _spareMachine = 'all';

let _spareCat = 'all';

function setDashMachine(machine, btn) {
  _spareMachine = machine;
  document.querySelectorAll('#dash-machine-filter .spare-cat-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyDashSpareFilter();
}

function setDashCat(cat, btn) {
  _spareCat = cat;
  document.querySelectorAll('#dash-cat-filter .spare-cat-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyDashSpareFilter();
}

function applyDashSpareFilter() {
  const cards = document.querySelectorAll('#dash-spare-grid .spare-item-card');
  let visible = 0;
  cards.forEach(card => {
    const m = card.getAttribute('data-machine') || '';
    const c = card.getAttribute('data-cat') || '';
    const machOk = (_spareMachine === 'all' || m === _spareMachine);
    const catOk  = (_spareCat === 'all' || c === _spareCat);
    if (machOk && catOk) { card.style.display = ''; visible++; }
    else                  { card.style.display = 'none'; }
  });
  const noMatch = document.getElementById('dash-no-spare');
  if (noMatch) noMatch.style.display = visible === 0 ? 'block' : 'none';
}

function filterRole(role, btn) {
  ['people-all','people-checker','people-planner','people-executor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById('people-' + (role === 'all' ? 'all' : role));
  if (target) target.style.display = 'block';
  document.querySelectorAll('#sec-people .role-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function filterKaizen(cat, btn) {
  document.querySelectorAll('#kaizen-list .kaizen-item').forEach(item => {
    const k = item.getAttribute('data-kcat') || '';
    item.style.display = (cat === 'all' || k === cat) ? 'block' : 'none';
  });
  document.querySelectorAll('#sec-kaizen .kaizen-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function openSpareDetail(code, name, stock, min, max, brand, loc) {
  document.getElementById('spare-modal-title').textContent = '🔩 ' + name + ' — Deep Dive';
  const pct = Math.round((parseInt(stock) / parseInt(max)) * 100);
  const col = parseInt(stock) === 0 ? 'var(--red)' : parseInt(stock) < parseInt(min) ? 'var(--amber)' : 'var(--green)';
  document.getElementById('spare-modal-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
      <div><div style="font-size:10px;text-transform:uppercase;color:var(--slate-400);font-weight:700;margin-bottom:3px">Part Number</div><div style="font-size:14px;font-family:var(--font-mono);font-weight:700;color:var(--blue-900)">${code}</div></div>
      <div><div style="font-size:10px;text-transform:uppercase;color:var(--slate-400);font-weight:700;margin-bottom:3px">Brand / OEM</div><div style="font-size:14px;font-weight:600;color:var(--blue-900)">${brand}</div></div>
      <div><div style="font-size:10px;text-transform:uppercase;color:var(--slate-400);font-weight:700;margin-bottom:3px">Current Stock</div><div style="font-size:22px;font-weight:700;font-family:var(--font-mono);color:${col}">${stock}</div></div>
      <div><div style="font-size:10px;text-transform:uppercase;color:var(--slate-400);font-weight:700;margin-bottom:3px">Location</div><div style="font-size:14px;font-weight:600;color:var(--blue-900)">${loc}</div></div>
    </div>
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--slate-500);margin-bottom:4px"><span>Stock Level</span><span>${stock} / ${max}</span></div>
      <div style="height:14px;background:var(--slate-100);border-radius:100px;overflow:hidden;position:relative">
        <div style="height:100%;width:${pct}%;background:${col};border-radius:100px;transition:width .6s ease"></div>
        <div style="position:absolute;top:0;left:${Math.round((parseInt(min)/parseInt(max))*100)}%;height:100%;width:2px;background:var(--red)"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--slate-400);margin-top:3px"><span>0</span><span style="color:var(--red)">Reorder: ${min}</span><span>Max: ${max}</span></div>
    </div>
    <div class="card" style="padding:14px;margin-bottom:0">
      <div style="font-size:12px;font-weight:700;color:var(--blue-900);margin-bottom:8px">Consumption History</div>
      <div class="table-wrap"><table style="font-size:12px">
        <thead><tr><th>Date</th><th>WO Number</th><th>Qty Used</th><th>Used By</th></tr></thead>
        <tbody>
          <tr><td>15 Jun 2026</td><td style="font-family:var(--font-mono)">WO-2026-0041</td><td>2</td><td>Manoj Shinde</td></tr>
          <tr><td>02 Jun 2026</td><td style="font-family:var(--font-mono)">WO-2026-0037</td><td>1</td><td>Pradeep Jadhav</td></tr>
          <tr><td>18 May 2026</td><td style="font-family:var(--font-mono)">WO-2026-0031</td><td>2</td><td>Manoj Shinde</td></tr>
          <tr><td>05 May 2026</td><td style="font-family:var(--font-mono)">WO-2026-0028</td><td>1</td><td>Rakesh Patil</td></tr>
        </tbody>
      </table></div>
    </div>`;
  document.getElementById('spareModal').classList.add('open');
}

export default function DashboardPage({ onNavigate }) {
  useEffect(() => {
    function t(){var n=new Date();document.getElementById('db-clock').textContent=n.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+' '+n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}t();const _iv = setInterval(t, 1000);
        return () => clearInterval(_iv);
  }, []);

  return (
    <>
      <style>{`

.kpi-card{background:white;border:1px solid var(--slate-200);border-radius:var(--radius-lg);padding:18px 20px;position:relative;overflow:hidden}
.kpi-card::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--kpi-color,var(--blue-500))}
.kpi-label{font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--slate-500);margin-bottom:4px}
.kpi-value{font-size:28px;font-weight:700;font-family:var(--font-mono);color:var(--blue-900);line-height:1}
.kpi-unit{font-size:13px;font-weight:400;color:var(--slate-500)}
.kpi-trend{font-size:11px;font-weight:600;margin-top:6px}
.kpi-trend.up{color:var(--green)}
.kpi-trend.down{color:var(--red)}
.kpi-spark{height:36px;display:flex;align-items:flex-end;gap:3px;margin-top:8px}
.spark{flex:1;border-radius:2px 2px 0 0;opacity:.3}
.spark:last-child{opacity:1}
.bar-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.bar-label{width:90px;font-size:12px;color:var(--slate-600);text-align:right;flex-shrink:0}
.bar-track{flex:1;height:22px;background:var(--slate-100);border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;display:flex;align-items:center;padding-left:8px;font-size:11px;font-weight:700;color:white;min-width:40px}
.bar-val{width:50px;font-size:12px;font-family:var(--font-mono);font-weight:700;color:var(--blue-900)}
/* spare dashboard */
.spare-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.spare-item-card{background:white;border:1px solid var(--slate-200);border-radius:var(--radius);padding:14px;position:relative;overflow:hidden;cursor:pointer;transition:all .2s}
.spare-item-card:hover{box-shadow:var(--shadow-md);border-color:var(--blue-400)}
.spare-item-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--sc,var(--green))}
.spare-item-card.critical-spare::before{--sc:#DC2626}
.spare-item-card.warning-spare::before{--sc:#D97706}
.spare-item-card.ok-spare::before{--sc:#059669}
.spare-level-bar{height:10px;background:var(--slate-100);border-radius:100px;overflow:hidden;margin:8px 0}
.spare-level-fill{height:100%;border-radius:100px;transition:width .6s ease}
/* people tabs */
.role-pill{padding:6px 14px;border-radius:100px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid var(--slate-300);background:white;color:var(--slate-600);transition:all .15s}
.role-pill.active{background:var(--blue-500);color:white;border-color:var(--blue-500)}
/* spare category pills (Change #4) */
.spare-cat-pill{padding:6px 14px;border-radius:100px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid var(--slate-300);background:white;color:var(--slate-600);transition:all .15s;white-space:nowrap}
.spare-cat-pill.active{background:var(--blue-500);color:white;border-color:var(--blue-500)}
/* kaizen */
.kaizen-item{background:white;border:1px solid var(--slate-200);border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:10px;border-left:4px solid var(--slate-300)}
.kaizen-item.mttr{border-left-color:var(--blue-500)}
.kaizen-item.mtbf{border-left-color:var(--green)}
.kaizen-item.mttf{border-left-color:var(--purple)}
.kaizen-item.design{border-left-color:var(--amber)}
.kaizen-item.others{border-left-color:var(--slate-400)}
.kaizen-tab{padding:8px 16px;font-size:12px;font-weight:600;border-radius:100px;cursor:pointer;border:1.5px solid var(--slate-300);background:white;color:var(--slate-600);transition:all .15s;white-space:nowrap}
.kaizen-tab.active{background:var(--blue-500);color:white;border-color:var(--blue-500)}

`}</style>
      <div>
        <nav className="top-nav">
          <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}><div className="nav-logo-icon">📊</div><div><div className="nav-logo-text">SmartPM</div><div className="nav-logo-sub">KPI Dashboard</div></div></a>
          <div className="nav-spacer" />
          <select className="form-select" style={{width: 120, fontSize: 12, padding: '5px 10px'}}><option>Jun 2026</option><option>May 2026</option><option>Apr 2026</option></select>
          <select className="form-select" style={{width: 100, fontSize: 12, padding: '5px 10px', marginLeft: 6}} id="db-plant-filter"><option>All Plants</option><option>Plant A</option><option>Plant B</option></select>
          <select className="form-select" style={{width: 95, fontSize: 12, padding: '5px 10px', marginLeft: 6}} id="db-line-filter"><option>All Lines</option><option>Line 1</option><option>Line 2</option><option>Line 3</option></select>
          <div className="nav-role-badge" style={{marginLeft: 8}}><div className="nav-role-dot" style={{background: '#0891B2'}} /><span className="nav-role-name">Mentor View</span></div>
          <div id="db-clock" style={{color: 'rgba(255,255,255,.5)', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 8}} />
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="nav-home-btn" style={{marginLeft: 8}}>← Home</a>
        </nav>
        <div className="app-layout">
          <aside className="sidebar">
            <div className="sidebar-section-label">KPI Sections</div>
            {/* Change #2: Reliability & Maintenance merged into one link */}
            <a href="#" className="sidebar-link active" onClick={(e) => { showSec('reliability',e.currentTarget) }}><span className="link-icon">📈</span>Reliability &amp; Maint. KPIs</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('pm',e.currentTarget) }}><span className="link-icon">✅</span>PM Compliance %</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('oee',e.currentTarget) }}><span className="link-icon">⚙️</span>OEE &amp; Availability</a>
            {/* Change #3: Separate tabs for Spares Cost & Maintenance Cost */}
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('spares',e.currentTarget) }}><span className="link-icon">🔩</span>Spare Parts Dashboard</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('spares-cost',e.currentTarget) }}><span className="link-icon">🏷️</span>Spares Cost</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('maint-cost',e.currentTarget) }}><span className="link-icon">💰</span>Maintenance Cost</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('people',e.currentTarget) }}><span className="link-icon">👥</span>People Productivity</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('breakdown',e.currentTarget) }}><span className="link-icon">💥</span>Breakdown % by Equip</a>
            {/* Change #6: Kaizen tab */}
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('kaizen',e.currentTarget) }}><span className="link-icon">🔄</span>Kaizen</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showSec('escalation',e.currentTarget) }}><span className="link-icon">🚨</span>Escalations<span className="sidebar-badge">2</span></a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Navigate</div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('checker'); }} className="sidebar-link"><span className="link-icon">🔍</span>Checker</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('planner'); }} className="sidebar-link"><span className="link-icon">📋</span>Planner</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('executor'); }} className="sidebar-link"><span className="link-icon">🔧</span>Executor</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('hierarchy'); }} className="sidebar-link"><span className="link-icon">🏭</span>Plant Hierarchy</a>
            {/* Quick Actions Dock */}
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Quick Actions</div>
            <div style={{padding: '4px 12px 12px'}}>
              <button className="quick-action-btn" onClick={(e) => { alert('Escalation raised') }}>🚨 Raise Escalation</button>
              <button className="quick-action-btn" onClick={(e) => { showSec('kaizen',document.querySelector('[onclick*=kaizen]')) }}>+ Log Kaizen</button>
              <button className="quick-action-btn" onClick={(e) => { alert('Export dashboard report') }}>⬇ Export Report</button>
            </div>
          </aside>
          <main className="main-content">
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Change #2: RELIABILITY & MAINTENANCE KPIs — MERGED in one tab */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div id="sec-reliability">
              <div className="page-header"><div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>Reliability &amp; Maint. KPIs</div>
                <div className="page-title">Reliability &amp; Maintenance KPIs</div>
                <div className="page-subtitle">Mean time metrics + maintenance performance · Jun 2026</div>
              </div>
              {/* Escalation banner — always visible when on dashboard */}
              <div className="esc-banner" onClick={(e) => { showSec('escalation',document.querySelector('[onclick*=escalation]')) }} style={{cursor: 'pointer'}}>
                🚨 <span>2 Active Escalations need your attention</span>
                <span style={{marginLeft: 'auto', fontSize: 11, textDecoration: 'underline'}}>View All Escalations →</span>
              </div>
              {/* Sub-tabs within the merged section */}
              <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20}}>
                <button className="role-pill active" onClick={(e) => { showRelSub('rel-sub-overview',e.currentTarget) }}>📊 Overview</button>
                <button className="role-pill" onClick={(e) => { showRelSub('rel-sub-mttr',e.currentTarget) }}>⏱ MTTR</button>
                <button className="role-pill" onClick={(e) => { showRelSub('rel-sub-mtbf',e.currentTarget) }}>🔁 MTBF</button>
                <button className="role-pill" onClick={(e) => { showRelSub('rel-sub-mttf',e.currentTarget) }}>⏳ MTTF</button>
                <button className="role-pill" onClick={(e) => { showRelSub('rel-sub-maintenance',e.currentTarget) }}>🔧 Maintenance</button>
              </div>
              {/* Overview sub-tab */}
              <div id="rel-sub-overview">
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16}}>
                  <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}>
                    <div className="kpi-label">MTTR</div><div className="kpi-value">3.2 <span className="kpi-unit">hrs</span></div>
                    <div style={{fontSize: 11, color: 'var(--slate-400)'}}>Mean Time to Repair</div>
                    <div className="kpi-trend up">↓ 0.4h vs May — improving</div>
                    <div className="kpi-spark"><div className="spark" style={{height: '60%', background: '#3B82F6'}} /><div className="spark" style={{height: '80%', background: '#3B82F6'}} /><div className="spark" style={{height: '70%', background: '#3B82F6'}} /><div className="spark" style={{height: '55%', background: '#3B82F6'}} /><div className="spark" style={{height: '45%', background: '#3B82F6'}} /><div className="spark" style={{height: '40%', background: '#3B82F6'}} /></div>
                  </div>
                  <div className="kpi-card" style={{'--kpi-color': '#059669'}}>
                    <div className="kpi-label">MTBF</div><div className="kpi-value">184 <span className="kpi-unit">hrs</span></div>
                    <div style={{fontSize: 11, color: 'var(--slate-400)'}}>Mean Time Between Failures</div>
                    <div className="kpi-trend up">↑ 12h vs May</div>
                    <div className="kpi-spark"><div className="spark" style={{height: '55%', background: '#059669'}} /><div className="spark" style={{height: '60%', background: '#059669'}} /><div className="spark" style={{height: '65%', background: '#059669'}} /><div className="spark" style={{height: '72%', background: '#059669'}} /><div className="spark" style={{height: '80%', background: '#059669'}} /><div className="spark" style={{height: '90%', background: '#059669'}} /></div>
                  </div>
                  <div className="kpi-card" style={{'--kpi-color': '#7C3AED'}}>
                    <div className="kpi-label">MTTF</div><div className="kpi-value">2,140 <span className="kpi-unit">hrs</span></div>
                    <div style={{fontSize: 11, color: 'var(--slate-400)'}}>Mean Time to Failure</div>
                    <div className="kpi-trend up">↑ 85h vs May</div>
                    <div className="kpi-spark"><div className="spark" style={{height: '50%', background: '#7C3AED'}} /><div className="spark" style={{height: '60%', background: '#7C3AED'}} /><div className="spark" style={{height: '68%', background: '#7C3AED'}} /><div className="spark" style={{height: '75%', background: '#7C3AED'}} /><div className="spark" style={{height: '82%', background: '#7C3AED'}} /><div className="spark" style={{height: '88%', background: '#7C3AED'}} /></div>
                  </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16}}>
                  <div className="kpi-card" style={{'--kpi-color': '#DC2626'}}><div className="kpi-label">Breakdowns</div><div className="kpi-value">6</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>This month</div><div className="kpi-trend up">↓ 3 vs May (9)</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#D97706'}}><div className="kpi-label">Repeat Failures</div><div className="kpi-value">1</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Same root cause</div><div className="kpi-trend up">↓ 2 vs May</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">WO Completion</div><div className="kpi-value">94<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>On time</div><div className="kpi-trend up">↑ 4%</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Rework Rate</div><div className="kpi-value">3.2<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>WOs redone</div><div className="kpi-trend up">↓ 1.8%</div></div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">MTTR by Equipment</div></div>
                  <div className="bar-row"><div className="bar-label">CP-101</div><div className="bar-track"><div className="bar-fill" style={{width: '52%', background: '#2563EB'}}>3.2h</div></div><div className="bar-val">3.2h</div></div>
                  <div className="bar-row"><div className="bar-label">HX-204</div><div className="bar-track"><div className="bar-fill" style={{width: '38%', background: '#3B82F6'}}>2.4h</div></div><div className="bar-val">2.4h</div></div>
                  <div className="bar-row"><div className="bar-label">COM-302</div><div className="bar-track"><div className="bar-fill" style={{width: '80%', background: '#DC2626'}}>5.1h</div></div><div className="bar-val">5.1h</div></div>
                  <div className="bar-row"><div className="bar-label">MDU-115</div><div className="bar-track"><div className="bar-fill" style={{width: '28%', background: '#059669'}}>1.8h</div></div><div className="bar-val">1.8h</div></div>
                  <div className="bar-row"><div className="bar-label">Target</div><div className="bar-track"><div className="bar-fill" style={{width: '62%', background: 'var(--slate-400)'}}>Target 4h</div></div><div className="bar-val">4.0h</div></div>
                </div>
              </div>
              {/* MTTR sub-tab */}
              <div id="rel-sub-mttr" style={{display: 'none'}}>
                <div className="page-header" style={{marginBottom: 12}}><div className="page-title" style={{fontSize: 18}}>⏱ MTTR — Mean Time to Repair</div></div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16}}>
                  <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">Overall MTTR</div><div className="kpi-value">3.2 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Target &lt; 4h</div><div className="kpi-trend up">↓ 0.4h vs May</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Best Equipment</div><div className="kpi-value">1.8 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>MDU-115</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#DC2626'}}><div className="kpi-label">Worst Equipment</div><div className="kpi-value">5.1 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>COM-302</div></div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">MTTR Trend — Jan to Jun 2026 (All Equipment Avg)</div></div>
                  <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, paddingBottom: 20}}>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 70, background: '#BFDBFE', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Jan</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>4.8h</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 62, background: '#93C5FD', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Feb</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>4.3h</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 55, background: '#60A5FA', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Mar</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>3.9h</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 50, background: '#3B82F6', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Apr</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>3.6h</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 44, background: '#2563EB', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>May</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>3.6h</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 38, background: '#059669', borderRadius: '3px 3px 0 0', marginBottom: 4, border: '2px solid #047857'}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Jun</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--green)'}}>3.2h↓</div></div>
                  </div>
                </div>
              </div>
              {/* MTBF sub-tab */}
              <div id="rel-sub-mtbf" style={{display: 'none'}}>
                <div className="page-header" style={{marginBottom: 12}}><div className="page-title" style={{fontSize: 18}}>🔁 MTBF — Mean Time Between Failures</div></div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16}}>
                  <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Overall MTBF</div><div className="kpi-value">184 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Target &gt; 200h</div><div className="kpi-trend up">↑ 12h vs May</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">Best Equipment</div><div className="kpi-value">312 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>HX-204</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#DC2626'}}><div className="kpi-label">Lowest MTBF</div><div className="kpi-value">68 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>COM-302</div></div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">MTBF by Equipment — Jun 2026</div></div>
                  <div className="bar-row"><div className="bar-label">HX-204</div><div className="bar-track"><div className="bar-fill" style={{width: '100%', background: '#059669'}}>312h</div></div><div className="bar-val">312h</div></div>
                  <div className="bar-row"><div className="bar-label">MDU-115</div><div className="bar-track"><div className="bar-fill" style={{width: '80%', background: '#3B82F6'}}>248h</div></div><div className="bar-val">248h</div></div>
                  <div className="bar-row"><div className="bar-label">CP-101</div><div className="bar-track"><div className="bar-fill" style={{width: '60%', background: '#D97706'}}>186h</div></div><div className="bar-val">186h</div></div>
                  <div className="bar-row"><div className="bar-label">COM-302</div><div className="bar-track"><div className="bar-fill" style={{width: '22%', background: '#DC2626'}}>68h</div></div><div className="bar-val">68h</div></div>
                  <div className="bar-row"><div className="bar-label">Target</div><div className="bar-track"><div className="bar-fill" style={{width: '64%', background: 'var(--slate-400)'}}>Target 200h</div></div><div className="bar-val">200h</div></div>
                </div>
              </div>
              {/* MTTF sub-tab */}
              <div id="rel-sub-mttf" style={{display: 'none'}}>
                <div className="page-header" style={{marginBottom: 12}}><div className="page-title" style={{fontSize: 18}}>⏳ MTTF — Mean Time to Failure</div></div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16}}>
                  <div className="kpi-card" style={{'--kpi-color': '#7C3AED'}}><div className="kpi-label">Overall MTTF</div><div className="kpi-value">2,140 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Avg component life</div><div className="kpi-trend up">↑ 85h vs May</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Bearings MTTF</div><div className="kpi-value">1,840 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>SKF/FAG class</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">Liner Plates MTTF</div><div className="kpi-value">4,200 <span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Hardox 450 grade</div></div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">MTTF by Equipment</div></div>
                  <div className="bar-row"><div className="bar-label">HX-204</div><div className="bar-track"><div className="bar-fill" style={{width: '100%', background: '#059669'}}>4,200h</div></div><div className="bar-val">4,200h</div></div>
                  <div className="bar-row"><div className="bar-label">MDU-115</div><div className="bar-track"><div className="bar-fill" style={{width: '75%', background: '#3B82F6'}}>3,150h</div></div><div className="bar-val">3,150h</div></div>
                  <div className="bar-row"><div className="bar-label">CP-101</div><div className="bar-track"><div className="bar-fill" style={{width: '60%', background: '#D97706'}}>2,520h</div></div><div className="bar-val">2,520h</div></div>
                  <div className="bar-row"><div className="bar-label">COM-302</div><div className="bar-track"><div className="bar-fill" style={{width: '33%', background: '#DC2626'}}>1,380h</div></div><div className="bar-val">1,380h</div></div>
                </div>
              </div>
              {/* Maintenance sub-tab */}
              <div id="rel-sub-maintenance" style={{display: 'none'}}>
                <div className="page-header" style={{marginBottom: 12}}><div className="page-title" style={{fontSize: 18}}>🔧 Maintenance Performance</div></div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20}}>
                  <div className="kpi-card" style={{'--kpi-color': '#DC2626'}}><div className="kpi-label">Breakdowns</div><div className="kpi-value">6</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>This month</div><div className="kpi-trend up">↓ 3 vs May (9)</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#D97706'}}><div className="kpi-label">Repeat Failures</div><div className="kpi-value">1</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Same root cause</div><div className="kpi-trend up">↓ 2 vs May</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">WO Completion</div><div className="kpi-value">94<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>On time</div><div className="kpi-trend up">↑ 4%</div></div>
                  <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Rework Rate</div><div className="kpi-value">3.2<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>WOs redone</div><div className="kpi-trend up">↓ 1.8%</div></div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">Monthly Breakdown Trend</div></div>
                  <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, paddingBottom: 20, position: 'relative'}}>
                    <div style={{position: 'absolute', bottom: 20, left: 0, right: 0, borderTop: '1px dashed var(--slate-300)'}} />
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 70, background: '#BFDBFE', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Jan</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>14</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 55, background: '#93C5FD', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Feb</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>11</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 50, background: '#60A5FA', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Mar</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>10</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 40, background: '#3B82F6', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Apr</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>8</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 45, background: '#2563EB', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>May</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>9</div></div>
                    <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 30, background: '#059669', borderRadius: '3px 3px 0 0', marginBottom: 4, border: '2px solid #047857'}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Jun</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--green)'}}>6↓</div></div>
                  </div>
                </div>
              </div>
            </div>
            {/* PM COMPLIANCE */}
            <div id="sec-pm" style={{display: 'none'}}>
              <div className="page-header"><div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>PM Compliance %</div><div className="page-title">PM Compliance %</div><div className="page-subtitle">Completion rates by equipment and frequency · Jun 2026</div></div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20}}>
                <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Overall Compliance</div><div className="kpi-value">96.4<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Target: 98%</div><div className="kpi-trend up">↑ 2.1% vs May</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">On-Time PM</div><div className="kpi-value">92.1<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Within window</div><div className="kpi-trend up">↑ 1.5%</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#DC2626'}}><div className="kpi-label">Overdue PMs</div><div className="kpi-value">3</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>COM-302, MDU-115</div><div className="kpi-trend down">↑ 1 vs May</div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">PM Compliance by Equipment</div></div>
                <div className="bar-row"><div className="bar-label">CP-101</div><div className="bar-track"><div className="bar-fill" style={{width: '100%', background: '#059669'}}>30/30</div></div><div className="bar-val">100%</div></div>
                <div className="bar-row"><div className="bar-label">HX-204</div><div className="bar-track"><div className="bar-fill" style={{width: '100%', background: '#059669'}}>4/4</div></div><div className="bar-val">100%</div></div>
                <div className="bar-row"><div className="bar-label">MDU-115</div><div className="bar-track"><div className="bar-fill" style={{width: '85%', background: '#D97706'}}>11/13</div></div><div className="bar-val">85%</div></div>
                <div className="bar-row"><div className="bar-label">COM-302</div><div className="bar-track"><div className="bar-fill" style={{width: '60%', background: '#DC2626'}}>3/5</div></div><div className="bar-val">60%</div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">PM Compliance Trend — Jan to Jun 2026</div></div>
                <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, paddingBottom: 20}}>
                  <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 56, background: '#BFDBFE', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Jan</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>88%</div></div>
                  <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 64, background: '#93C5FD', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Feb</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>90%</div></div>
                  <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 70, background: '#60A5FA', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Mar</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>92%</div></div>
                  <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 68, background: '#3B82F6', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Apr</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>92%</div></div>
                  <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 72, background: '#2563EB', borderRadius: '3px 3px 0 0', marginBottom: 4}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>May</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'}}>94%</div></div>
                  <div style={{flex: 1, textAlign: 'center'}}><div style={{height: 80, background: '#059669', borderRadius: '3px 3px 0 0', marginBottom: 4, border: '2px solid #047857'}} /><div style={{fontSize: 10, color: 'var(--slate-400)'}}>Jun</div><div style={{fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--green)'}}>96%↑</div></div>
                </div>
              </div>
            </div>
            {/* OEE */}
            <div id="sec-oee" style={{display: 'none'}}>
              <div className="page-header"><div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>OEE &amp; Availability</div><div className="page-title">OEE &amp; Equipment Availability</div></div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20}}>
                <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">Overall OEE</div><div className="kpi-value">78.4<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Target 82% · World class 85%</div><div className="kpi-trend up">↑ 2.3% vs May</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Availability</div><div className="kpi-value">91.2<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>A = MTBF/(MTBF+MTTR)</div><div className="kpi-trend up">↑ 1.1%</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#D97706'}}><div className="kpi-label">Performance × Quality</div><div className="kpi-value">86.0<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>93.4% × 89.6%</div><div className="kpi-trend up">↑ 0.5%</div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Equipment Availability %</div></div>
                <div className="bar-row"><div className="bar-label">HX-204</div><div className="bar-track"><div className="bar-fill" style={{width: '97%', background: '#059669'}}>97.2%</div></div><div className="bar-val">97.2%</div></div>
                <div className="bar-row"><div className="bar-label">MDU-115</div><div className="bar-track"><div className="bar-fill" style={{width: '95%', background: '#059669'}}>94.8%</div></div><div className="bar-val">94.8%</div></div>
                <div className="bar-row"><div className="bar-label">CP-101</div><div className="bar-track"><div className="bar-fill" style={{width: '89%', background: '#D97706'}}>89.1%</div></div><div className="bar-val">89.1%</div></div>
                <div className="bar-row"><div className="bar-label">COM-302</div><div className="bar-track"><div className="bar-fill" style={{width: '78%', background: '#DC2626'}}>78.3%</div></div><div className="bar-val">78.3%</div></div>
                <div className="bar-row"><div className="bar-label">Target</div><div className="bar-track"><div className="bar-fill" style={{width: '90%', background: 'var(--slate-400)'}}>90%</div></div><div className="bar-val">90%</div></div>
              </div>
            </div>
            {/* ══════════════════════════════════════════════════════════ */}
            {/* Change #4: SPARE PARTS DASHBOARD — category + machine     */}
            {/* ══════════════════════════════════════════════════════════ */}
            <div id="sec-spares" style={{display: 'none'}}>
              <div className="page-header"><div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>Spare Parts Dashboard</div><div className="page-title">Spare Parts Dashboard</div><div className="page-subtitle">Critical Spare Part Stock · Category-wise · Machine-wise filter · Jun 2026</div></div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16}}>
                <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Spare Availability</div><div className="kpi-value">87<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Critical items in stock</div><div className="kpi-trend down">↓ 5% — 2 OOS</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#DC2626'}}><div className="kpi-label">Out of Stock</div><div className="kpi-value">2</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Emergency PR needed</div><div className="kpi-trend down">↑ 1 vs May</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#D97706'}}><div className="kpi-label">Below Reorder</div><div className="kpi-value">4</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Raise PR this week</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">Inventory Value</div><div className="kpi-value">₹8.4<span className="kpi-unit">L</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Current stock</div></div>
              </div>
              {/* Machine filter */}
              <div style={{background: 'white', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 14}}>
                <div style={{fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10}}>Filter by Machine</div>
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}} id="dash-machine-filter">
                  <button className="spare-cat-pill active" onClick={(e) => { setDashMachine('all',e.currentTarget) }}>🔧 All Machines</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashMachine('CP-101',e.currentTarget) }}>⚙️ CP-101</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashMachine('HX-204',e.currentTarget) }}>🔥 HX-204</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashMachine('COM-302',e.currentTarget) }}>💨 COM-302</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashMachine('MDU-115',e.currentTarget) }}>⚡ MDU-115</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashMachine('Circular-Saw',e.currentTarget) }}>🪚 Circular Saw</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashMachine('Forging-Press',e.currentTarget) }}>🔨 Forging Press</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashMachine('Robotic-Arm',e.currentTarget) }}>🤖 Robotic Arm</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashMachine('Induction-Heater',e.currentTarget) }}>🌡️ Induction Heater</button>
                </div>
                {/* Category filter */}
                <div style={{fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '.5px', margin: '12px 0 8px'}}>Filter by Category</div>
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}} id="dash-cat-filter">
                  <button className="spare-cat-pill active" onClick={(e) => { setDashCat('all',e.currentTarget) }}>📦 All</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashCat('bearing',e.currentTarget) }}>🔵 Bearings</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashCat('seal',e.currentTarget) }}>🔴 Seals &amp; Gaskets</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashCat('motor',e.currentTarget) }}>⚡ Motors &amp; Electrical</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashCat('liner',e.currentTarget) }}>🟫 Liner Plates</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashCat('lubricant',e.currentTarget) }}>🟡 Lubricants</button>
                  <button className="spare-cat-pill" onClick={(e) => { setDashCat('hydraulic',e.currentTarget) }}>🔧 Hydraulic</button>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div><div className="card-title">🔩 Spare Part Stock Cards</div><div className="card-subtitle">Click any card for detail · Filtered by machine &amp; category</div></div>
                  <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--slate-500)'}}><span style={{width: 10, height: 10, background: 'var(--red)', borderRadius: '50%', display: 'inline-block'}} />OOS</span>
                    <span style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--slate-500)'}}><span style={{width: 10, height: 10, background: 'var(--amber)', borderRadius: '50%', display: 'inline-block'}} />Low</span>
                    <span style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--slate-500)'}}><span style={{width: 10, height: 10, background: 'var(--green)', borderRadius: '50%', display: 'inline-block'}} />OK</span>
                  </div>
                </div>
                <div className="spare-card-grid" id="dash-spare-grid">
                  <div className="spare-item-card ok-spare" data-machine="CP-101" data-cat="bearing" onClick={(e) => { openSpareDetail('BRG-6308ZZ','Bearing 6308 ZZ','4','2','10','SKF','Bin B-14') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>BRG-6308ZZ</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>Bearing 6308 ZZ</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>🔵 Bearing · ⚙️ CP-101</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '40%', background: '#059669'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--green)'}}>4 pcs</strong></span><span>Min: 2</span></div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginTop: 4}}>📍 Bin B-14 · Today</div>
                  </div>
                  <div className="spare-item-card ok-spare" data-machine="CP-101" data-cat="lubricant" onClick={(e) => { openSpareDetail('OIL-VG68-5L','ISO VG 68 Oil 5L','8','4','20','Shell','Oil Room R3') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>OIL-VG68-5L</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>ISO VG 68 Oil — 5L</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>🟡 Lubricant · ⚙️ CP-101</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '40%', background: '#059669'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--green)'}}>8 cans</strong></span><span>Min: 4</span></div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginTop: 4}}>📍 Oil Room R3 · 14 Jun</div>
                  </div>
                  <div className="spare-item-card warning-spare" data-machine="CP-101" data-cat="seal" onClick={(e) => { openSpareDetail('SEAL-CP101-MK','Mech Seal CP-101','1','2','5','OEM','Bin S-04') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>SEAL-CP101-MK</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>Mech Seal CP-101</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>🔴 Seal · ⚙️ CP-101</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '20%', background: '#D97706'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--amber)'}}>1 pc ⚠</strong></span><span>Min: 2</span></div>
                    <div style={{fontSize: 10, color: 'var(--amber)', fontWeight: 600, marginTop: 4}}>⚠ Below reorder — raise PR</div>
                  </div>
                  <div className="spare-item-card critical-spare" data-machine="MDU-115" data-cat="motor" onClick={(e) => { openSpareDetail('RLY-CTR-63A','Contactor Relay 63A','0','1','4','Schneider','—') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>RLY-CTR-63A</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>Contactor Relay 63A</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>⚡ Motor/Elec · ⚡ MDU-115</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '0%', background: '#DC2626'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--red)'}}>0 🔴 OOS</strong></span><span>Min: 1</span></div>
                    <div style={{fontSize: 10, color: 'var(--red)', fontWeight: 600, marginTop: 4}}>🔴 OUT OF STOCK — Emergency PR!</div>
                  </div>
                  <div className="spare-item-card ok-spare" data-machine="COM-302" data-cat="hydraulic" onClick={(e) => { openSpareDetail('FLT-COM302','Comp Air Filter','3','2','8','Donaldson','Bin F-09') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>FLT-COM302</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>Compressor Air Filter</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>🔧 Hydraulic · 💨 COM-302</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '38%', background: '#059669'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--green)'}}>3 pcs</strong></span><span>Min: 2</span></div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginTop: 4}}>📍 Bin F-09 · 05 Jun</div>
                  </div>
                  <div className="spare-item-card ok-spare" data-machine="CP-101" data-cat="lubricant" onClick={(e) => { openSpareDetail('GRS-EP2-1KG','EP2 Grease 1kg','6','3','12','Fuchs','Bin G-02') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>GRS-EP2-1KG</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>EP2 Grease 1kg</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>🟡 Lubricant · ⚙️ CP-101</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '50%', background: '#059669'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--green)'}}>6 pcs</strong></span><span>Min: 3</span></div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginTop: 4}}>📍 Bin G-02 · 13 Jun</div>
                  </div>
                  <div className="spare-item-card ok-spare" data-machine="HX-204" data-cat="seal" onClick={(e) => { openSpareDetail('GSK-HX204','HX-204 Gasket Set','2','1','6','Parker','Bin G-07') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>GSK-HX204</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>HX-204 Gasket Set</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>🔴 Seal · 🔥 HX-204</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '33%', background: '#059669'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--green)'}}>2 sets</strong></span><span>Min: 1</span></div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginTop: 4}}>📍 Bin G-07 · 28 May</div>
                  </div>
                  <div className="spare-item-card warning-spare" data-machine="Forging-Press" data-cat="hydraulic" onClick={(e) => { openSpareDetail('VLV-GATE-2IN','Gate Valve 2in','1','2','6','L&T Valves','Bin V-03') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>VLV-GATE-2IN</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>Gate Valve 2in</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>🔧 Hydraulic · 🔨 Forging Press</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '17%', background: '#D97706'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--amber)'}}>1 pc ⚠</strong></span><span>Min: 2</span></div>
                    <div style={{fontSize: 10, color: 'var(--amber)', fontWeight: 600, marginTop: 4}}>⚠ Below reorder — raise PR</div>
                  </div>
                  <div className="spare-item-card critical-spare" data-machine="Forging-Press" data-cat="liner" onClick={(e) => { openSpareDetail('LNR-FP-BOLST','Bolster Wear Plate','0','1','4','H13 Steel','—') }}>
                    <div style={{fontSize: 10, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4}}>LNR-FP-BOLST</div>
                    <div style={{fontSize: 13, fontWeight: 700, color: 'var(--blue-900)', marginBottom: 8}}>Bolster Wear Plate</div>
                    <div style={{fontSize: 10, color: 'var(--slate-400)', marginBottom: 6}}>🟫 Liner Plate · 🔨 Forging Press</div>
                    <div className="spare-level-bar"><div className="spare-level-fill" style={{width: '0%', background: '#DC2626'}} /></div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)'}}><span>Stock: <strong style={{color: 'var(--red)'}}>0 🔴 OOS</strong></span><span>Min: 1</span></div>
                    <div style={{fontSize: 10, color: 'var(--red)', fontWeight: 600, marginTop: 4}}>🔴 OUT OF STOCK — Emergency PR!</div>
                  </div>
                </div>
                <div id="dash-no-spare" style={{display: 'none', padding: 24, textAlign: 'center', color: 'var(--slate-400)', fontSize: 13}}>No spare parts found for the selected machine / category.</div>
              </div>
            </div>
            {/* ══════════════════════════════════════════════════════════ */}
            {/* Change #3: SPARES COST — separate tab                     */}
            {/* ══════════════════════════════════════════════════════════ */}
            <div id="sec-spares-cost" style={{display: 'none'}}>
              <div className="page-header"><div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>Spares Cost</div><div className="page-title">Spares Cost</div><div className="page-subtitle">Spare parts procurement and consumption cost analysis · Jun 2026</div></div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20}}>
                <div className="kpi-card" style={{'--kpi-color': '#D97706'}}><div className="kpi-label">Spare Consumption Jun</div><div className="kpi-value">₹1.8<span className="kpi-unit">L</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>This month</div><div className="kpi-trend neutral" style={{color: 'var(--slate-400)'}}>→ Stable vs May</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">Inventory Value</div><div className="kpi-value">₹8.4<span className="kpi-unit">L</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Current stock</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#DC2626'}}><div className="kpi-label">Emergency Purchases</div><div className="kpi-value">2</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Stock-out incidents</div><div className="kpi-trend down">↑ 1 vs May</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Annual Spare Budget</div><div className="kpi-value">₹22<span className="kpi-unit">L</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>₹9.4L used (43%)</div><div className="kpi-trend up">On track</div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Spare Cost — Last 6 Months</div></div>
                <div className="bar-row"><div className="bar-label">Jan</div><div className="bar-track"><div className="bar-fill" style={{width: '75%', background: '#BFDBFE', color: 'var(--slate-700)'}}>₹1.5L</div></div><div className="bar-val">₹1.5L</div></div>
                <div className="bar-row"><div className="bar-label">Feb</div><div className="bar-track"><div className="bar-fill" style={{width: '80%', background: '#93C5FD', color: 'var(--slate-700)'}}>₹1.6L</div></div><div className="bar-val">₹1.6L</div></div>
                <div className="bar-row"><div className="bar-label">Mar</div><div className="bar-track"><div className="bar-fill" style={{width: '100%', background: '#DC2626'}}>₹2.0L (spike)</div></div><div className="bar-val">₹2.0L</div></div>
                <div className="bar-row"><div className="bar-label">Apr</div><div className="bar-track"><div className="bar-fill" style={{width: '85%', background: '#60A5FA', color: 'var(--slate-700)'}}>₹1.7L</div></div><div className="bar-val">₹1.7L</div></div>
                <div className="bar-row"><div className="bar-label">May</div><div className="bar-track"><div className="bar-fill" style={{width: '90%', background: '#3B82F6'}}>₹1.8L</div></div><div className="bar-val">₹1.8L</div></div>
                <div className="bar-row"><div className="bar-label">Jun</div><div className="bar-track"><div className="bar-fill" style={{width: '90%', background: '#059669'}}>₹1.8L</div></div><div className="bar-val">₹1.8L</div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Spare Consumption by Category — Jun 2026</div></div>
                <div className="bar-row"><div className="bar-label">Bearings</div><div className="bar-track"><div className="bar-fill" style={{width: '60%', background: '#3B82F6'}}>₹54,000</div></div><div className="bar-val">₹54K</div></div>
                <div className="bar-row"><div className="bar-label">Liner Plates</div><div className="bar-track"><div className="bar-fill" style={{width: '45%', background: '#7C3AED'}}>₹42,000</div></div><div className="bar-val">₹42K</div></div>
                <div className="bar-row"><div className="bar-label">Seals &amp; Gaskets</div><div className="bar-track"><div className="bar-fill" style={{width: '35%', background: '#059669'}}>₹32,000</div></div><div className="bar-val">₹32K</div></div>
                <div className="bar-row"><div className="bar-label">Motors &amp; Elec</div><div className="bar-track"><div className="bar-fill" style={{width: '28%', background: '#D97706'}}>₹26,000</div></div><div className="bar-val">₹26K</div></div>
                <div className="bar-row"><div className="bar-label">Hydraulic</div><div className="bar-track"><div className="bar-fill" style={{width: '22%', background: '#DC2626'}}>₹18,000</div></div><div className="bar-val">₹18K</div></div>
                <div className="bar-row"><div className="bar-label">Lubricants</div><div className="bar-track"><div className="bar-fill" style={{width: '10%', background: '#94A3B8'}}>₹8,000</div></div><div className="bar-val">₹8K</div></div>
              </div>
            </div>
            {/* ══════════════════════════════════════════════════════════ */}
            {/* Change #3: MAINTENANCE COST — separate tab                */}
            {/* ══════════════════════════════════════════════════════════ */}
            <div id="sec-maint-cost" style={{display: 'none'}}>
              <div className="page-header"><div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>Maintenance Cost</div><div className="page-title">Maintenance Cost</div><div className="page-subtitle">Labour, contractor and overhead maintenance expenditure · Jun 2026</div></div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20}}>
                <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">Total Maint. Cost Jun</div><div className="kpi-value">₹4.2<span className="kpi-unit">L</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Budget ₹5.0L</div><div className="kpi-trend up">↓ 16% under budget</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Labour Cost</div><div className="kpi-value">₹2.1<span className="kpi-unit">L</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>7 technicians</div><div className="kpi-trend up">Within budget</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#D97706'}}><div className="kpi-label">Contractor Cost</div><div className="kpi-value">₹1.2<span className="kpi-unit">L</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>2 contractors</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#7C3AED'}}><div className="kpi-label">Overhead / Tools</div><div className="kpi-value">₹0.9<span className="kpi-unit">L</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Consumables etc.</div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Maintenance Cost — Last 6 Months</div></div>
                <div className="bar-row"><div className="bar-label">Jan</div><div className="bar-track"><div className="bar-fill" style={{width: '90%', background: '#BFDBFE', color: 'var(--slate-700)'}}>₹4.5L</div></div><div className="bar-val">₹4.5L</div></div>
                <div className="bar-row"><div className="bar-label">Feb</div><div className="bar-track"><div className="bar-fill" style={{width: '96%', background: '#93C5FD', color: 'var(--slate-700)'}}>₹4.8L</div></div><div className="bar-val">₹4.8L</div></div>
                <div className="bar-row"><div className="bar-label">Mar</div><div className="bar-track"><div className="bar-fill" style={{width: '100%', background: '#DC2626'}}>₹5.0L (over)</div></div><div className="bar-val">₹5.0L</div></div>
                <div className="bar-row"><div className="bar-label">Apr</div><div className="bar-track"><div className="bar-fill" style={{width: '88%', background: '#60A5FA', color: 'var(--slate-700)'}}>₹4.4L</div></div><div className="bar-val">₹4.4L</div></div>
                <div className="bar-row"><div className="bar-label">May</div><div className="bar-track"><div className="bar-fill" style={{width: '86%', background: '#3B82F6'}}>₹4.3L</div></div><div className="bar-val">₹4.3L</div></div>
                <div className="bar-row"><div className="bar-label">Jun</div><div className="bar-track"><div className="bar-fill" style={{width: '84%', background: '#059669'}}>₹4.2L</div></div><div className="bar-val">₹4.2L</div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Maintenance Cost by Equipment — Jun 2026</div></div>
                <div className="bar-row"><div className="bar-label">COM-302</div><div className="bar-track"><div className="bar-fill" style={{width: '100%', background: '#DC2626'}}>₹1.4L</div></div><div className="bar-val">₹1.4L</div></div>
                <div className="bar-row"><div className="bar-label">CP-101</div><div className="bar-track"><div className="bar-fill" style={{width: '75%', background: '#D97706'}}>₹1.1L</div></div><div className="bar-val">₹1.1L</div></div>
                <div className="bar-row"><div className="bar-label">MDU-115</div><div className="bar-track"><div className="bar-fill" style={{width: '50%', background: '#3B82F6'}}>₹0.8L</div></div><div className="bar-val">₹0.8L</div></div>
                <div className="bar-row"><div className="bar-label">HX-204</div><div className="bar-track"><div className="bar-fill" style={{width: '40%', background: '#059669'}}>₹0.6L</div></div><div className="bar-val">₹0.6L</div></div>
              </div>
            </div>
            {/* PEOPLE PRODUCTIVITY */}
            <div id="sec-people" style={{display: 'none'}}>
              <div className="page-header"><div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>People Productivity</div><div className="page-title">People Productivity</div><div className="page-subtitle">Performance by role and individual · Jun 2026</div></div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20}}>
                <div className="kpi-card" style={{'--kpi-color': '#2563EB'}}><div className="kpi-label">Wrench Time</div><div className="kpi-value">64<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Target 70%</div><div className="kpi-trend up">↑ 3%</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">WOs/Tech/Day</div><div className="kpi-value">3.2</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Average</div><div className="kpi-trend up">↑ 0.4</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#7C3AED'}}><div className="kpi-label">First-Time Fix</div><div className="kpi-value">91<span className="kpi-unit">%</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>No rework needed</div><div className="kpi-trend up">↑ 4%</div></div>
                <div className="kpi-card" style={{'--kpi-color': '#D97706'}}><div className="kpi-label">Overtime Hours</div><div className="kpi-value">18<span className="kpi-unit">hrs</span></div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>This month</div><div className="kpi-trend down">↑ 6h</div></div>
              </div>
              <div style={{display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap'}}>
                <button className="role-pill active" onClick={(e) => { filterRole('all',e.currentTarget) }}>All</button>
                <button className="role-pill" onClick={(e) => { filterRole('checker',e.currentTarget) }}>🔍 Checker</button>
                <button className="role-pill" onClick={(e) => { filterRole('planner',e.currentTarget) }}>📋 Planner</button>
                <button className="role-pill" onClick={(e) => { filterRole('executor',e.currentTarget) }}>🔧 Executor</button>
              </div>
              <div className="card" id="people-all">
                <div className="card-header"><div className="card-title">All Roles — Jun 2026</div></div>
                <div className="table-wrap"><table>
                    <thead><tr><th>Name</th><th>Role</th><th>Tasks/WOs</th><th>Completed</th><th>Avg Time</th><th>First-Fix</th><th>Rework</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td><strong>Sandeep Tapkir</strong></td><td><span className="badge badge-ok">Checker</span></td><td>42 insp.</td><td>40</td><td style={{fontFamily: 'var(--font-mono)'}}>1.2h</td><td><span className="badge badge-ok">—</span></td><td>0</td><td><span className="badge badge-ok">On Track</span></td></tr>
                      <tr><td><strong>Vishwas Landage</strong></td><td><span className="badge badge-progress">Planner</span></td><td>32 WOs</td><td>30</td><td style={{fontFamily: 'var(--font-mono)'}}>—</td><td>—</td><td>—</td><td><span className="badge badge-ok">On Track</span></td></tr>
                      <tr><td><strong>Manoj Shinde</strong></td><td><span className="badge badge-pending">Executor</span></td><td>28</td><td>26</td><td style={{fontFamily: 'var(--font-mono)'}}>2.8h</td><td><span className="badge badge-ok">96%</span></td><td>1</td><td><span className="badge badge-ok">On Track</span></td></tr>
                      <tr><td><strong>Pradeep Jadhav</strong></td><td><span className="badge badge-pending">Executor</span></td><td>24</td><td>22</td><td style={{fontFamily: 'var(--font-mono)'}}>3.4h</td><td><span className="badge badge-ok">91%</span></td><td>2</td><td><span className="badge badge-ok">On Track</span></td></tr>
                      <tr><td><strong>Rakesh Patil</strong></td><td><span className="badge badge-pending">Executor</span></td><td>20</td><td>19</td><td style={{fontFamily: 'var(--font-mono)'}}>3.1h</td><td><span className="badge badge-pending">85%</span></td><td>3</td><td><span className="badge badge-pending">Watch</span></td></tr>
                      <tr><td><strong>Suresh Kulkarni</strong></td><td><span className="badge badge-pending">Executor</span></td><td>18</td><td>17</td><td style={{fontFamily: 'var(--font-mono)'}}>3.1h</td><td><span className="badge badge-pending">83%</span></td><td>3</td><td><span className="badge badge-pending">Watch</span></td></tr>
                      <tr><td><strong>Dinesh Wagh</strong></td><td><span className="badge badge-pending">Executor</span></td><td>16</td><td>15</td><td style={{fontFamily: 'var(--font-mono)'}}>2.9h</td><td><span className="badge badge-ok">93%</span></td><td>1</td><td><span className="badge badge-ok">On Track</span></td></tr>
                      <tr><td><strong>Amol Deshmukh</strong></td><td><span className="badge badge-pending">Executor</span></td><td>12</td><td>12</td><td style={{fontFamily: 'var(--font-mono)'}}>2.5h</td><td><span className="badge badge-ok">100%</span></td><td>0</td><td><span className="badge badge-ok">On Track</span></td></tr>
                      <tr><td><strong>Nilesh More</strong></td><td><span className="badge badge-pending">Executor</span></td><td>10</td><td>10</td><td style={{fontFamily: 'var(--font-mono)'}}>2.2h</td><td><span className="badge badge-ok">100%</span></td><td>0</td><td><span className="badge badge-ok">On Track</span></td></tr>
                    </tbody>
                  </table></div>
              </div>
              <div className="card" id="people-checker" style={{display: 'none'}}>
                <div className="card-header"><div className="card-title">Checker Performance</div></div>
                <div className="table-wrap"><table>
                    <thead><tr><th>Name</th><th>Inspections Done</th><th>Abnormalities Logged</th><th>Audits Completed</th><th>Accuracy Rate</th></tr></thead>
                    <tbody><tr><td><strong>Sandeep Tapkir</strong></td><td>40/42</td><td>12</td><td>28</td><td><span className="badge badge-ok">97.5%</span></td></tr></tbody>
                  </table></div>
              </div>
              <div className="card" id="people-planner" style={{display: 'none'}}>
                <div className="card-header"><div className="card-title">Planner Performance</div></div>
                <div className="table-wrap"><table>
                    <thead><tr><th>Name</th><th>WOs Generated</th><th>On-Time Scheduling</th><th>Spare Accuracy</th><th>Avg Planning Time</th></tr></thead>
                    <tbody><tr><td><strong>Vishwas Landage</strong></td><td>30/32</td><td><span className="badge badge-ok">94%</span></td><td><span className="badge badge-ok">96%</span></td><td style={{fontFamily: 'var(--font-mono)'}}>42 min</td></tr></tbody>
                  </table></div>
              </div>
              <div className="card" id="people-executor" style={{display: 'none'}}>
                <div className="card-header"><div className="card-title">Executor Performance</div></div>
                <div className="table-wrap"><table>
                    <thead><tr><th>Name</th><th>WOs Assigned</th><th>WOs Done</th><th>Avg MTTR</th><th>First-Fix %</th><th>Rework</th></tr></thead>
                    <tbody>
                      <tr><td><strong>Manoj Shinde</strong></td><td>28</td><td>26</td><td style={{fontFamily: 'var(--font-mono)'}}>2.8h</td><td><span className="badge badge-ok">96%</span></td><td>1</td></tr>
                      <tr><td><strong>Pradeep Jadhav</strong></td><td>24</td><td>22</td><td style={{fontFamily: 'var(--font-mono)'}}>3.4h</td><td><span className="badge badge-ok">91%</span></td><td>2</td></tr>
                      <tr><td><strong>Rakesh Patil</strong></td><td>20</td><td>19</td><td style={{fontFamily: 'var(--font-mono)'}}>3.1h</td><td><span className="badge badge-pending">85%</span></td><td>3</td></tr>
                      <tr><td><strong>Suresh Kulkarni</strong></td><td>18</td><td>17</td><td style={{fontFamily: 'var(--font-mono)'}}>3.1h</td><td><span className="badge badge-pending">83%</span></td><td>3</td></tr>
                      <tr><td><strong>Dinesh Wagh</strong></td><td>16</td><td>15</td><td style={{fontFamily: 'var(--font-mono)'}}>2.9h</td><td><span className="badge badge-ok">93%</span></td><td>1</td></tr>
                    </tbody>
                  </table></div>
              </div>
            </div>
            {/* BREAKDOWN % */}
            <div id="sec-breakdown" style={{display: 'none'}}>
              <div className="page-header"><div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>Breakdown Analysis</div><div className="page-title">Equipment-wise Breakdown %</div><div className="page-subtitle">Breakdown share by asset · Jun 2026 · Total: 6 breakdowns</div></div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20}}>
                <div className="card">
                  <div className="card-title" style={{marginBottom: 16}}>Breakdown Distribution</div>
                  <div className="bar-row"><div className="bar-label">COM-302</div><div className="bar-track"><div className="bar-fill" style={{width: '50%', background: '#DC2626'}}>3 (50%)</div></div><div className="bar-val">50%</div></div>
                  <div className="bar-row"><div className="bar-label">CP-101</div><div className="bar-track"><div className="bar-fill" style={{width: '33%', background: '#D97706'}}>2 (33%)</div></div><div className="bar-val">33%</div></div>
                  <div className="bar-row"><div className="bar-label">MDU-115</div><div className="bar-track"><div className="bar-fill" style={{width: '17%', background: '#3B82F6'}}>1 (17%)</div></div><div className="bar-val">17%</div></div>
                  <div className="bar-row"><div className="bar-label">HX-204</div><div className="bar-track"><div className="bar-fill" style={{width: '0%', background: '#059669'}}>0 (0%)</div></div><div className="bar-val">0%</div></div>
                </div>
                <div className="card">
                  <div className="card-title" style={{marginBottom: 16}}>Breakdown by Cause</div>
                  <div className="bar-row"><div className="bar-label">Wear/Fatigue</div><div className="bar-track"><div className="bar-fill" style={{width: '50%', background: '#7C3AED'}}>3</div></div><div className="bar-val">50%</div></div>
                  <div className="bar-row"><div className="bar-label">Lubrication</div><div className="bar-track"><div className="bar-fill" style={{width: '33%', background: '#2563EB'}}>2</div></div><div className="bar-val">33%</div></div>
                  <div className="bar-row"><div className="bar-label">Electrical</div><div className="bar-track"><div className="bar-fill" style={{width: '17%', background: '#059669'}}>1</div></div><div className="bar-val">17%</div></div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Breakdown History — Last 6 Months by Equipment</div></div>
                <div className="table-wrap"><table>
                    <thead><tr><th>Equipment</th><th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th><th>May</th><th>Jun</th><th>Total</th><th>Trend</th></tr></thead>
                    <tbody>
                      <tr><td>COM-302</td><td>4</td><td>3</td><td>4</td><td>2</td><td>4</td><td><strong style={{color: 'var(--red)'}}>3</strong></td><td>20</td><td><span className="badge badge-pending">Chronic</span></td></tr>
                      <tr><td>CP-101</td><td>5</td><td>4</td><td>3</td><td>3</td><td>3</td><td><strong style={{color: 'var(--amber)'}}>2</strong></td><td>20</td><td><span className="badge badge-ok">Improving</span></td></tr>
                      <tr><td>MDU-115</td><td>3</td><td>2</td><td>2</td><td>2</td><td>1</td><td><strong style={{color: 'var(--green)'}}>1</strong></td><td>11</td><td><span className="badge badge-ok">Improving</span></td></tr>
                      <tr><td>HX-204</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td><strong style={{color: 'var(--green)'}}>0</strong></td><td>7</td><td><span className="badge badge-ok">Stable</span></td></tr>
                    </tbody>
                  </table></div>
              </div>
            </div>
            {/* ══════════════════════════════════════════════════════════ */}
            {/* Change #6: KAIZEN TAB — MTTR, MTBF, MTTF, Design, Others  */}
            {/* ══════════════════════════════════════════════════════════ */}
            <div id="sec-kaizen" style={{display: 'none'}}>
              <div className="kpi-card" style={{'--kpi-color': '#64748B'}}><div className="kpi-label">Others</div><div className="kpi-value">6</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Process / 5S / Safety</div><div className="kpi-trend up">2 completed</div></div>
            </div>
            {/* Kaizen category filter tabs */}
            <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16}}>
              <button className="kaizen-tab active" onClick={(e) => { filterKaizen('all',e.currentTarget) }}>📋 All (25)</button>
              <button className="kaizen-tab" onClick={(e) => { filterKaizen('mttr',e.currentTarget) }}>⏱ MTTR (7)</button>
              <button className="kaizen-tab" onClick={(e) => { filterKaizen('mtbf',e.currentTarget) }}>🔁 MTBF (5)</button>
              <button className="kaizen-tab" onClick={(e) => { filterKaizen('mttf',e.currentTarget) }}>⏳ MTTF (4)</button>
              <button className="kaizen-tab" onClick={(e) => { filterKaizen('design',e.currentTarget) }}>🔩 Design Change (3)</button>
              <button className="kaizen-tab" onClick={(e) => { filterKaizen('others',e.currentTarget) }}>📂 Others (6)</button>
            </div>
            {/* Kaizen items list */}
            <div id="kaizen-list">
              <div className="kaizen-item mttr" data-kcat="mttr">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-progress" style={{marginRight: 8}}>⏱ MTTR</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Quick-Release Coupling for CP-101 Bearing Housing</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Replace bolt-flange coupling with quick-release clamps. Reduces bearing change time from 4.2h to 1.8h.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Manoj Shinde</span><span>📅 10 Apr 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>📉 MTTR ↓ 2.4h on CP-101</span></div>
              </div>
              <div className="kaizen-item mttr" data-kcat="mttr">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-progress" style={{marginRight: 8}}>⏱ MTTR</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Prefabricated Gasket Kit for HX-204</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Pre-cut gaskets in labeled kit bags. Eliminates on-site cutting; reduces maintenance time by 45 min per job.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Pradeep Jadhav</span><span>📅 22 Mar 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>📉 MTTR ↓ 0.75h on HX-204</span></div>
              </div>
              <div className="kaizen-item mttr" data-kcat="mttr">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-progress" style={{marginRight: 8}}>⏱ MTTR</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>SOP Visual Cards at COM-302 Panel</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Laminated visual SOP step cards mounted at COM-302. Reduces time spent consulting manuals during repair.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Vishwas Landage</span><span>📅 14 Feb 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>📉 MTTR ↓ 0.5h on COM-302</span></div>
              </div>
              <div className="kaizen-item mttr" data-kcat="mttr">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-progress" style={{marginRight: 8}}>⏱ MTTR</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Dedicated Toolbox Shadow Board for MDU-115</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Shadow board with dedicated tools near MDU-115. Eliminates tool retrieval time (~15 min saved per WO).</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Rakesh Patil</span><span>📅 05 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 Est. MTTR ↓ 0.25h</span></div>
              </div>
              <div className="kaizen-item mttr" data-kcat="mttr">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-progress" style={{marginRight: 8}}>⏱ MTTR</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Spare Staging Area Near Forging Press</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Dedicated mini-store with top 10 consumables near Forging Press. Reduces spares retrieval from 25 min to 5 min.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Dinesh Wagh</span><span>📅 12 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 Est. MTTR ↓ 0.33h</span></div>
              </div>
              <div className="kaizen-item mttr" data-kcat="mttr">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-progress" style={{marginRight: 8}}>⏱ MTTR</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Digital WO Mobile Closeout</strong></div>
                  <span className="badge badge-abnormal">📋 Under Review</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Replace paper WO sign-off with mobile QR scan. Eliminates manual documentation delay of ~30 min/WO.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Sandeep Tapkir</span><span>📅 01 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 System-wide improvement</span></div>
              </div>
              <div className="kaizen-item mttr" data-kcat="mttr">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-progress" style={{marginRight: 8}}>⏱ MTTR</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Cross-Training Executor on COM-302 Overhaul</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Train 2 additional executors on COM-302 full overhaul procedure. Reduces dependency on single expert (5.1h to 3h target).</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Manoj Shinde</span><span>📅 08 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 COM-302 MTTR ↓ 2.1h</span></div>
              </div>
              <div className="kaizen-item mtbf" data-kcat="mtbf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-ok" style={{marginRight: 8}}>🔁 MTBF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Vibration Monitoring Installed on COM-302</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Wireless vibration sensor fitted on COM-302 main bearing. Early warning at 7.5 mm/s threshold before failure.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Suresh Kulkarni</span><span>📅 15 Mar 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>📈 MTBF ↑ 28h on COM-302</span></div>
              </div>
              <div className="kaizen-item mtbf" data-kcat="mtbf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-ok" style={{marginRight: 8}}>🔁 MTBF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Lubrication Schedule Optimization — CP-101</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Revised greasing interval from weekly to every 4 days based on bearing temperature data. Extended bearing life.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Amol Deshmukh</span><span>📅 02 Feb 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>📈 MTBF ↑ 18h on CP-101</span></div>
              </div>
              <div className="kaizen-item mtbf" data-kcat="mtbf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-ok" style={{marginRight: 8}}>🔁 MTBF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Upgraded Seal Grade on HX-204 Tubes</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Replace standard NBR seals with Viton grade on HX-204 high-temp zones. Expected 2× seal life.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Nilesh More</span><span>📅 10 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 MTBF ↑ 40h on HX-204</span></div>
              </div>
              <div className="kaizen-item mtbf" data-kcat="mtbf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-ok" style={{marginRight: 8}}>🔁 MTBF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Coolant Temperature Control — Circular Saw</strong></div>
                  <span className="badge badge-abnormal">📋 Under Review</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Auto temperature regulation for coolant reduces blade overheating failures. Install thermostat controller.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Rakesh Patil</span><span>📅 03 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 MTBF ↑ 25h on Circ. Saw</span></div>
              </div>
              <div className="kaizen-item mtbf" data-kcat="mtbf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-ok" style={{marginRight: 8}}>🔁 MTBF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>MDU-115 Dust Purge System for Drive Panel</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Automated compressed air purge cycle for MDU-115 VFD panel. Reduces dust-related drive faults.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Suresh Kulkarni</span><span>📅 14 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 MTBF ↑ 15h on MDU-115</span></div>
              </div>
              <div className="kaizen-item mttf" data-kcat="mttf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-pending" style={{marginRight: 8}}>⏳ MTTF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Hardox 450 Liner Plates for CP-101 Crusher</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Replaced standard Mn-steel liners with Hardox 450 grade. Wear life improved from 1,800h to 4,200h.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Vishwas Landage</span><span>📅 05 Jan 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>📈 MTTF ↑ 2,400h on CP-101</span></div>
              </div>
              <div className="kaizen-item mttf" data-kcat="mttf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-pending" style={{marginRight: 8}}>⏳ MTTF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Ceramic Coating on Forging Press Ram</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Thermal barrier ceramic coating on Forging Press ram surface to reduce thermal fatigue and scoring.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Manoj Shinde</span><span>📅 18 May 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 MTTF ↑ 800h on FP Ram</span></div>
              </div>
              <div className="kaizen-item mttf" data-kcat="mttf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-pending" style={{marginRight: 8}}>⏳ MTTF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Grade-up to NSK Bearings on Robotic Arm J3 Joint</strong></div>
                  <span className="badge badge-abnormal">📋 Under Review</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Current FAG bearings showing early wear at J3. Upgrade to NSK P5 precision grade for 3× life rating.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Pradeep Jadhav</span><span>📅 07 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 MTTF ↑ 1,200h on Robotic</span></div>
              </div>
              <div className="kaizen-item mttf" data-kcat="mttf">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-pending" style={{marginRight: 8}}>⏳ MTTF</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Anti-Corrosion Coating on HX-204 Tube Bundle</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Apply epoxy anti-corrosion coating on HX-204 tube exterior during next overhaul. Expected 5-year service life.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Dinesh Wagh</span><span>📅 20 May 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 MTTF ↑ 3,000h on HX-204</span></div>
              </div>
              <div className="kaizen-item design" data-kcat="design">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-pending" style={{background: '#FFFBEB', color: '#92400E', marginRight: 8}}>🔩 Design</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>COM-302 Inlet Strainer Modification</strong></div>
                  <span className="badge" style={{background: '#ECFDF5', color: '#065F46'}}>✅ Approved</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Increase strainer mesh size from 40 to 80 micron. Reduces clogging frequency from 3×/month to 1×/month.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Vishwas Landage</span><span>📅 28 Apr 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>📉 Clogging ↓ 67% on COM-302</span></div>
              </div>
              <div className="kaizen-item design" data-kcat="design">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-pending" style={{background: '#FFFBEB', color: '#92400E', marginRight: 8}}>🔩 Design</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Add Grease Nipple Access Port — Forging Press Eccentric</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Drill and tap grease nipple port on Forging Press eccentric shaft. Eliminates disassembly for lubrication — saves 2h/month.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Manoj Shinde</span><span>📅 11 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 2h/month lube time saved</span></div>
              </div>
              <div className="kaizen-item design" data-kcat="design">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-pending" style={{background: '#FFFBEB', color: '#92400E', marginRight: 8}}>🔩 Design</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>MDU-115 Cable Tray Rerouting</strong></div>
                  <span className="badge badge-abnormal">📋 Under Review</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Reroute power cables to avoid heat zone near MDU-115 transformer. Reduces cable insulation degradation causing tripping.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Suresh Kulkarni</span><span>📅 09 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 Reduce elec. faults on MDU</span></div>
              </div>
              <div className="kaizen-item others" data-kcat="others">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-closed" style={{marginRight: 8}}>📂 Others</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>5S Implementation in Maintenance Store</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Sort, Set in order, Shine, Standardize, Sustain — full 5S audit done. Part retrieval time cut by 40%.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Nilesh More</span><span>📅 12 Jan 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>⏱ Retrieval time ↓ 40%</span></div>
              </div>
              <div className="kaizen-item others" data-kcat="others">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-closed" style={{marginRight: 8}}>📂 Others</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Safety Tag-Out Procedure Digitized</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>QR-code based lockout/tagout digital log replaces paper permit. Audit trail improved. Zero permit violations since.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Sandeep Tapkir</span><span>📅 28 Feb 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>🛡 0 permit violations</span></div>
              </div>
              <div className="kaizen-item others" data-kcat="others">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-closed" style={{marginRight: 8}}>📂 Others</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Weekly Tech Toolbox Talk Program</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>30-min Monday morning session sharing failure learnings and best practices. 8 sessions held, rework down 1.8%.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Vishwas Landage</span><span>📅 06 Jan 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>📉 Rework rate ↓ 1.8%</span></div>
              </div>
              <div className="kaizen-item others" data-kcat="others">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-closed" style={{marginRight: 8}}>📂 Others</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>IIoT Dashboard Live Screen in Workshop</strong></div>
                  <span className="badge badge-pending">🔄 In Progress</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>TV screen showing live sensor feeds and open WOs installed in workshop. Operators report breakdowns faster.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Amol Deshmukh</span><span>📅 05 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 Avg alert response ↓ 12 min</span></div>
              </div>
              <div className="kaizen-item others" data-kcat="others">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-closed" style={{marginRight: 8}}>📂 Others</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Preventive Replacement Calendar Pinboard</strong></div>
                  <span className="badge badge-ok">✅ Completed</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Visual calendar with color-coded PM due dates for all 8 machines displayed at plant entrance. Zero missed PMs in April/May.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Vishwas Landage</span><span>📅 20 Mar 2026</span><span style={{color: 'var(--green)', fontWeight: 600}}>✅ 0 missed PMs Apr–May</span></div>
              </div>
              <div className="kaizen-item others" data-kcat="others">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                  <div><span className="badge badge-closed" style={{marginRight: 8}}>📂 Others</span><strong style={{fontSize: 13, color: 'var(--blue-900)'}}>Operator Ownership Program — Induction Heater</strong></div>
                  <span className="badge badge-abnormal">📋 Under Review</span>
                </div>
                <div style={{fontSize: 12, color: 'var(--slate-600)', marginBottom: 6}}>Assign Induction Heater to single operator as "machine owner". Operator performs daily checks, logs readings, reports deviations.</div>
                <div style={{display: 'flex', gap: 16, fontSize: 11, color: 'var(--slate-400)'}}><span>👤 Rakesh Patil</span><span>📅 13 Jun 2026</span><span style={{color: 'var(--amber)', fontWeight: 600}}>🎯 Autonomous Maintenance</span></div>
              </div>
            </div>
            <div style={{marginTop: 16, textAlign: 'right'}}>
              <button className="btn btn-primary btn-sm" onClick={(e) => { alert('Log New Kaizen — form would open here') }}>+ Log New Kaizen</button>
            </div>
          </main></div>
        {/* ESCALATION MANAGEMENT */}
        <div id="sec-escalation" style={{display: 'none'}}>
          <div className="page-header">
            <div className="breadcrumb"><span>Mentor</span><span className="breadcrumb-sep">›</span>Escalation Management</div>
            <div className="page-title">🚨 Escalation Management</div>
            <div className="page-subtitle">Active escalations requiring Mentor / Admin attention · Jun 2026</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20}}>
            <div className="kpi-card" style={{'--kpi-color': '#DC2626'}}><div className="kpi-label">Open Escalations</div><div className="kpi-value">2</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Needs immediate action</div></div>
            <div className="kpi-card" style={{'--kpi-color': '#D97706'}}><div className="kpi-label">Overdue Tasks</div><div className="kpi-value">3</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Past due date</div></div>
            <div className="kpi-card" style={{'--kpi-color': '#7C3AED'}}><div className="kpi-label">Critical Spares OOS</div><div className="kpi-value">2</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Emergency PR needed</div></div>
            <div className="kpi-card" style={{'--kpi-color': '#059669'}}><div className="kpi-label">Resolved This Month</div><div className="kpi-value">7</div><div style={{fontSize: 11, color: 'var(--slate-400)'}}>Avg resolution 1.4 days</div></div>
          </div>
          <div className="card" style={{marginBottom: 16}}>
            <div className="card-header">
              <div className="card-title">🔴 Active Escalations</div>
              <div style={{display: 'flex', gap: 8}}>
                <select className="form-select" style={{width: 130, fontSize: 12, padding: '5px 8px'}}><option>All Types</option><option>Overdue WO</option><option>Spare OOS</option><option>Missed PM</option><option>High Priority</option></select>
                <select className="form-select" style={{width: 110, fontSize: 12, padding: '5px 8px'}}><option>All Status</option><option>Open</option><option>In Progress</option><option>Resolved</option></select>
              </div>
            </div>
            {/* Escalation 1 */}
            <div style={{background: 'var(--red-light)', border: '1.5px solid var(--red-border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 12}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8}}>
                <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                  <span style={{fontSize: 18}}>🔴</span>
                  <div>
                    <div style={{fontSize: 13, fontWeight: 700, color: '#991B1B'}}>COM-302 Compressor — Motor 37kW Out of Stock</div>
                    <div style={{fontSize: 11, color: '#B91C1C', marginTop: 2}}>ESC-2026-001 · Raised: 12 Jun 2026 · 3 days unresolved</div>
                  </div>
                </div>
                <span className="badge badge-abnormal">🔴 Critical</span>
              </div>
              <div style={{fontSize: 12, color: 'var(--slate-700)', marginBottom: 10}}>Motor 37kW (MOT-COM302-37KW) is out of stock. COM-302 cannot run if current motor fails. Emergency PR required immediately. COM-302 accounts for 29% of monthly maintenance cost.</div>
              <div style={{display: 'flex', gap: 12, fontSize: 11, color: 'var(--slate-500)', marginBottom: 10, flexWrap: 'wrap'}}>
                <span>📍 COM-302 Compressor</span>
                <span>👤 Raised by: Vishwas Landage (Planner)</span>
                <span>👁 Visible to: Mentor, Admin</span>
                <span>⏱ SLA: 24 hrs (BREACHED)</span>
              </div>
              <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                <button className="btn btn-danger btn-sm" onClick={(e) => { alert('Emergency PR raised for MOT-COM302-37KW') }}>🚨 Raise Emergency PR</button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { alert('Escalation acknowledged') }}>✓ Acknowledge</button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { alert('Escalation assigned to Admin') }}>Assign to Admin</button>
              </div>
            </div>
            {/* Escalation 2 */}
            <div style={{background: 'var(--amber-light)', border: '1.5px solid var(--amber-border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 12}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8}}>
                <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                  <span style={{fontSize: 18}}>🟡</span>
                  <div>
                    <div style={{fontSize: 13, fontWeight: 700, color: '#92400E'}}>WO-2026-0038 — COM-302 Overdue by 2 Days</div>
                    <div style={{fontSize: 11, color: '#B45309', marginTop: 2}}>ESC-2026-002 · Raised: 14 Jun 2026 · 1 day unresolved</div>
                  </div>
                </div>
                <span className="badge badge-pending">🟡 High</span>
              </div>
              <div style={{fontSize: 12, color: 'var(--slate-700)', marginBottom: 10}}>Work Order WO-2026-0038 (COM-302 Bearing Replacement) was due 14 Jun 2026. Executor Manoj Shinde has not submitted completion. Spare bearing was available. Root cause unknown.</div>
              <div style={{display: 'flex', gap: 12, fontSize: 11, color: 'var(--slate-500)', marginBottom: 10, flexWrap: 'wrap'}}>
                <span>📍 COM-302 · WO-2026-0038</span>
                <span>👤 Assigned to: Manoj Shinde</span>
                <span>📅 Due: 14 Jun 2026</span>
                <span>⏱ SLA: 48 hrs (BREACHED)</span>
              </div>
              <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                <button className="btn btn-primary btn-sm" onClick={(e) => { alert('Reminder sent to Manoj Shinde') }}>📨 Send Reminder</button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { alert('WO reassigned') }}>🔄 Reassign WO</button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { alert('Acknowledged') }}>✓ Acknowledge</button>
              </div>
            </div>
          </div>
          {/* Escalation History */}
          <div className="card">
            <div className="card-header"><div className="card-title">📋 Escalation History — Jun 2026</div></div>
            <div className="table-wrap"><table>
                <thead><tr><th>Esc. ID</th><th>Type</th><th>Description</th><th>Raised By</th><th>Raised On</th><th>Resolved On</th><th>Resolution Time</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td style={{fontFamily: 'var(--font-mono)'}}>ESC-2026-001</td><td>Spare OOS</td><td>COM-302 Motor 37kW out of stock</td><td>Vishwas Landage</td><td>12 Jun</td><td>—</td><td><span style={{color: 'var(--red)'}}>Unresolved</span></td><td><span className="badge badge-abnormal">Open</span></td></tr>
                  <tr><td style={{fontFamily: 'var(--font-mono)'}}>ESC-2026-002</td><td>Overdue WO</td><td>WO-2026-0038 COM-302 overdue</td><td>Auto-trigger</td><td>14 Jun</td><td>—</td><td><span style={{color: 'var(--red)'}}>Unresolved</span></td><td><span className="badge badge-abnormal">Open</span></td></tr>
                  <tr><td style={{fontFamily: 'var(--font-mono)'}}>ESC-2026-003</td><td>Missed PM</td><td>MDU-115 Monthly PM missed</td><td>Auto-trigger</td><td>01 Jun</td><td>03 Jun</td><td>2 days</td><td><span className="badge badge-ok">Resolved</span></td></tr>
                  <tr><td style={{fontFamily: 'var(--font-mono)'}}>ESC-2026-004</td><td>High Priority</td><td>CP-101 Critical vibration alert</td><td>Sandeep Tapkir</td><td>05 Jun</td><td>06 Jun</td><td>18 hrs</td><td><span className="badge badge-ok">Resolved</span></td></tr>
                  <tr><td style={{fontFamily: 'var(--font-mono)'}}>ESC-2026-005</td><td>Spare Low</td><td>BRG-22212C below reorder point</td><td>Auto-trigger</td><td>08 Jun</td><td>10 Jun</td><td>2 days</td><td><span className="badge badge-ok">Resolved</span></td></tr>
                  <tr><td style={{fontFamily: 'var(--font-mono)'}}>ESC-2026-006</td><td>Overdue WO</td><td>HX-204 Gasket replacement overdue</td><td>Auto-trigger</td><td>10 Jun</td><td>11 Jun</td><td>1 day</td><td><span className="badge badge-ok">Resolved</span></td></tr>
                  <tr><td style={{fontFamily: 'var(--font-mono)'}}>ESC-2026-007</td><td>Rework</td><td>COM-302 Seal replacement rework</td><td>Sandeep Tapkir</td><td>12 Jun</td><td>13 Jun</td><td>22 hrs</td><td><span className="badge badge-ok">Resolved</span></td></tr>
                </tbody>
              </table></div>
          </div>
        </div>
        {/* SPARE DETAIL MODAL */}
        <div className="modal-overlay" id="spareModal">
          <div className="modal" style={{maxWidth: 600}}>
            <div className="modal-header"><div className="modal-title" id="spare-modal-title">Spare Detail</div><button className="modal-close" onClick={(e) => { document.getElementById('spareModal').classList.remove('open') }}>✕</button></div>
            <div className="modal-body" id="spare-modal-body" />
            <div className="modal-footer"><button className="btn btn-danger btn-sm" onClick={(e) => { alert('Purchase Requisition raised!') }}>Raise PR</button><button className="btn btn-secondary" onClick={(e) => { document.getElementById('spareModal').classList.remove('open') }}>Close</button></div>
          </div>
        </div>
      </div>

    </>
  );
}