import React, { useEffect } from 'react';

export default function HomePage({ onNavigate }) {
  useEffect(() => {

      function tick(){
        const now=new Date();
        document.getElementById('live-clock').textContent=
          now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+
          ' '+now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
      }tick();const _iv = setInterval(tick, 1000);

        return () => clearInterval(_iv);
  }, []);

  return (
    <>
      <style>{`

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --blue-900:#0B1F3A;--blue-800:#122D52;--blue-700:#1A3F6F;
    --blue-600:#1E5291;--blue-500:#2563EB;--blue-400:#3B82F6;
    --blue-100:#EFF6FF;--blue-50:#F0F7FF;
    --slate-700:#334155;--slate-500:#64748B;--slate-300:#CBD5E1;
    --slate-100:#F1F5F9;--slate-50:#F8FAFC;
    --white:#FFFFFF;--success:#059669;--warning:#D97706;--danger:#DC2626;
    --font-main:'Inter',sans-serif;--font-mono:'Roboto Mono',monospace;
    --radius:8px;--shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.06);
    --shadow-md:0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.06);
    --shadow-lg:0 10px 25px rgba(0,0,0,.08),0 4px 8px rgba(0,0,0,.04);
  }
  body{font-family:var(--font-main);background:var(--slate-50);color:var(--slate-700);min-height:100vh;display:flex;flex-direction:column}
  /* ── TOP NAV ── */
  .top-nav{background:var(--blue-900);height:56px;display:flex;align-items:center;padding:0 24px;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,.25)}
  .nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
  .nav-logo-icon{width:32px;height:32px;background:var(--blue-500);border-radius:6px;display:flex;align-items:center;justify-content:center}
  .nav-logo-icon svg{width:18px;height:18px;fill:white}
  .nav-logo-text{color:white;font-size:15px;font-weight:700;letter-spacing:-.2px}
  .nav-logo-sub{color:rgba(255,255,255,.45);font-size:11px;font-weight:400;letter-spacing:.5px;text-transform:uppercase;margin-top:1px}
  .nav-spacer{flex:1}
  .nav-tag{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.65);font-size:11px;padding:3px 10px;border-radius:100px;font-family:var(--font-mono)}
  /* ── HERO ── */
  .hero{background:linear-gradient(135deg,var(--blue-900) 0%,var(--blue-700) 60%,var(--blue-600) 100%);padding:64px 24px 72px;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
  .hero-eyebrow{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);font-size:12px;font-weight:500;letter-spacing:.8px;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:20px}
  .hero-eyebrow::before{content:'';width:6px;height:6px;background:#34D399;border-radius:50%;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .hero h1{color:white;font-size:clamp(28px,4vw,44px);font-weight:700;line-height:1.15;margin-bottom:14px;letter-spacing:-.5px}
  .hero h1 span{color:#60A5FA}
  .hero p{color:rgba(255,255,255,.65);font-size:16px;max-width:520px;margin:0 auto 40px;line-height:1.65}
  /* ── ROLE CARDS ── */
  .roles-section{padding:0 24px 64px;max-width:960px;margin:0 auto;width:100%}
  .roles-label{text-align:center;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--slate-500);margin-bottom:28px;margin-top:-20px;background:var(--slate-50);padding-top:28px}
  .roles-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
  .role-card{background:white;border:1.5px solid var(--slate-300);border-radius:12px;padding:28px 20px 24px;text-align:center;cursor:pointer;transition:all .2s ease;text-decoration:none;display:block;position:relative;overflow:hidden}
  .role-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--card-accent,var(--blue-500))}
  .role-card:hover{border-color:var(--blue-400);box-shadow:var(--shadow-lg);transform:translateY(-2px)}
  .role-card.admin{--card-accent:#7C3AED}
  .role-card.checker{--card-accent:#059669}
  .role-card.planner{--card-accent:#2563EB}
  .role-card.executor{--card-accent:#D97706}
  .role-card.manager{--card-accent:#0891B2}
  .role-icon{width:52px;height:52px;border-radius:12px;background:var(--icon-bg,#EFF6FF);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:24px}
  .role-card.admin .role-icon{background:#F5F3FF}
  .role-card.checker .role-icon{background:#ECFDF5}
  .role-card.planner .role-icon{background:#EFF6FF}
  .role-card.executor .role-icon{background:#FFFBEB}
  .role-card.manager .role-icon{background:#ECFEFF}
  .role-name{font-size:15px;font-weight:700;color:var(--blue-900);margin-bottom:5px}
  .role-desc{font-size:12px;color:var(--slate-500);line-height:1.5}
  .role-badge{display:inline-block;margin-top:12px;font-size:11px;font-weight:600;color:var(--card-accent,var(--blue-500));background:transparent;border:1px solid var(--card-accent,var(--blue-500));padding:3px 10px;border-radius:100px}
  /* ── FLOW OVERVIEW ── */
  .flow-section{background:white;border-top:1px solid var(--slate-300);padding:48px 24px;max-width:960px;margin:0 auto;width:100%}
  .section-title{font-size:20px;font-weight:700;color:var(--blue-900);margin-bottom:6px}
  .section-sub{font-size:13px;color:var(--slate-500);margin-bottom:28px}
  .flow-steps{display:flex;flex-wrap:wrap;gap:0;counter-reset:step}
  .flow-step{flex:1;min-width:120px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;padding:0 8px}
  .flow-step:not(:last-child)::after{content:'→';position:absolute;right:-8px;top:16px;font-size:16px;color:var(--slate-300);font-weight:400}
  .flow-step-num{width:34px;height:34px;border-radius:50%;background:var(--blue-500);color:white;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:8px}
  .flow-step-label{font-size:11px;color:var(--slate-500);font-weight:500;line-height:1.4}
  /* ── FOOTER ── */
  footer{margin-top:auto;background:var(--blue-900);padding:16px 24px;text-align:center;color:rgba(255,255,255,.35);font-size:12px;font-family:var(--font-mono)}

`}</style>
      <div>
        <nav className="top-nav">
          <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>
            <div className="nav-logo-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
            </div>
            <div>
              <div className="nav-logo-text">SmartPM</div>
              <div className="nav-logo-sub">Maintenance Intelligence</div>
            </div>
          </a>
          <div className="nav-spacer" />
          <div className="nav-tag">v2.4.1 · DEMO</div>
          <div id="live-clock" style={{color: 'rgba(255,255,255,.55)', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 8}} />
        </nav>
        <div className="hero">
          <div className="hero-eyebrow">System Live</div>
          <h1>Intelligent <span>Preventive Maintenance</span><br />Management System</h1>
          <p>Unified platform connecting Checkers, Planners, and Executors — from IIoT sensor alerts to closed work orders and KPI dashboards.</p>
          {/* Quick system status strip */}
          <div style={{display: 'inline-flex', gap: 20, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 24px', flexWrap: 'wrap', justifyContent: 'center'}}>
            <div style={{textAlign: 'center'}}><div style={{fontSize: 22, fontWeight: 700, color: '#60A5FA', fontFamily: 'var(--font-mono)'}}>8</div><div style={{fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2}}>Open Actions</div></div>
            <div style={{width: 1, background: 'rgba(255,255,255,.15)'}} />
            <div style={{textAlign: 'center'}}><div style={{fontSize: 22, fontWeight: 700, color: '#34D399', fontFamily: 'var(--font-mono)'}}>5</div><div style={{fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2}}>WOs In Progress</div></div>
            <div style={{width: 1, background: 'rgba(255,255,255,.15)'}} />
            <div style={{textAlign: 'center'}}><div style={{fontSize: 22, fontWeight: 700, color: '#FBBF24', fontFamily: 'var(--font-mono)'}}>3</div><div style={{fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2}}>Spare Alerts</div></div>
            <div style={{width: 1, background: 'rgba(255,255,255,.15)'}} />
            <div style={{textAlign: 'center'}}><div style={{fontSize: 22, fontWeight: 700, color: '#F87171', fontFamily: 'var(--font-mono)'}}>2</div><div style={{fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2}}>Escalations</div></div>
            <div style={{width: 1, background: 'rgba(255,255,255,.15)'}} />
            <div style={{textAlign: 'center'}}><div style={{fontSize: 22, fontWeight: 700, color: '#A78BFA', fontFamily: 'var(--font-mono)'}}>96%</div><div style={{fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2}}>PM Compliance</div></div>
          </div>
        </div>
        <div className="roles-section">
          <div className="roles-label">Select Your Role to Enter</div>
          <div className="roles-grid">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('admin'); }} className="role-card admin">
              <div className="role-icon">⚙️</div>
              <div className="role-name">Admin</div>
              <div className="role-desc">Configure equipment, checklists, SOPs and user management</div>
              <div className="role-badge">System Config</div>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('checker'); }} className="role-card checker">
              <div className="role-icon">🔍</div>
              <div className="role-name">Checker</div>
              <div className="role-desc">Conduct SOP-based inspections, log abnormalities, audit repairs</div>
              <div className="role-badge">Inspection &amp; Audit</div>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('planner'); }} className="role-card planner">
              <div className="role-icon">📋</div>
              <div className="role-name">Planner</div>
              <div className="role-desc">Review consolidated list, generate work orders, coordinate PPC</div>
              <div className="role-badge">WO Management</div>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('executor'); }} className="role-card executor">
              <div className="role-icon">🔧</div>
              <div className="role-name">Executor</div>
              <div className="role-desc">Receive tasks, perform repairs, submit completion with proof</div>
              <div className="role-badge">Field Execution</div>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className="role-card manager">
              <div className="role-icon">📊</div>
              <div className="role-name">Mentor</div>
              <div className="role-desc">Monitor KPIs, escalations, kaizen, analytics — full mentor oversight</div>
              <div className="role-badge">KPI Dashboard</div>
            </a>
          </div>
        </div>
        <div style={{background: 'white', borderTop: '1px solid var(--slate-300)', padding: '48px 24px'}}>
          <div style={{maxWidth: 960, margin: '0 auto'}}>
            <div className="section-title">End-to-End Process Flow</div>
            <div className="section-sub">From inspection to closed work order — every step tracked in real time</div>
            <div className="flow-steps">
              <div className="flow-step"><div className="flow-step-num">1</div><div className="flow-step-label">Checklist<br />Inspection</div></div>
              <div className="flow-step"><div className="flow-step-num">2</div><div className="flow-step-label">IIoT<br />Monitoring</div></div>
              <div className="flow-step"><div className="flow-step-num">3</div><div className="flow-step-label">Abnormality<br />Consolidation</div></div>
              <div className="flow-step"><div className="flow-step-num">4</div><div className="flow-step-label">Planner<br />Review</div></div>
              <div className="flow-step"><div className="flow-step-num">5</div><div className="flow-step-label">Work Order<br />Generation</div></div>
              <div className="flow-step"><div className="flow-step-num">6</div><div className="flow-step-label">Task<br />Execution</div></div>
              <div className="flow-step"><div className="flow-step-num">7</div><div className="flow-step-label">Quality<br />Audit</div></div>
              <div className="flow-step"><div className="flow-step-num">8</div><div className="flow-step-label">KPI<br />Dashboard</div></div>
            </div>
          </div>
        </div>
        <footer>SmartPM Maintenance Intelligence Platform · Demo Mockup · All data simulated</footer>
      </div>

    </>
  );
}