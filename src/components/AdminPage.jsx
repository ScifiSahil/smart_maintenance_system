import React, { useEffect } from 'react';

/* ---------------------------------------------------------------
   Module-scope helpers (verbatim logic from the original page's
   <script> block). Kept as plain JS, driving the DOM directly
   exactly as in the original demo — only the class names being
   toggled were updated from the old custom-CSS "active" class to
   the actual Tailwind utility classes that represent that state.
------------------------------------------------------------------ */
const SIDEBAR_ACTIVE_CLASSES = ['bg-[#F0F7FF]', 'text-[#2563EB]', 'border-l-[#2563EB]', 'font-semibold'];
const SIDEBAR_INACTIVE_CLASSES = ['border-l-transparent'];

function showTab(name, e){
  document.querySelectorAll('[id^="tab-"]').forEach(el=>el.style.display='none');
  document.getElementById('tab-'+name).style.display='block';
  document.querySelectorAll('.sidebar-link').forEach(el=>{
    el.classList.remove(...SIDEBAR_ACTIVE_CLASSES);
    el.classList.add(...SIDEBAR_INACTIVE_CLASSES);
  });
  const link = e.target.closest('.sidebar-link');
  link.classList.remove(...SIDEBAR_INACTIVE_CLASSES);
  link.classList.add(...SIDEBAR_ACTIVE_CLASSES);
}

function openModal(id){
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  el.classList.add('flex');
}

function closeModal(id){
  const el = document.getElementById(id);
  el.classList.add('hidden');
  el.classList.remove('flex');
}

export default function AdminPage({ onNavigate }) {
  useEffect(() => {
    function t(){var n=new Date();document.getElementById('ad-clock').textContent=n.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}t();const _iv = setInterval(t, 1000);
        return () => clearInterval(_iv);
  }, []);

  return (
    <div>
      <nav className="bg-[#0B1F3A] h-14 flex items-center px-5 gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.25)] fixed top-0 left-0 right-0 z-[100]">
        <a className="flex items-center gap-2.5 no-underline" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>
          <div className="w-8 h-8 bg-[#2563EB] rounded-md flex items-center justify-center text-base">⚙️</div>
          <div><div className="text-white text-[15px] font-bold tracking-[-0.2px]">SmartPM</div><div className="text-white/40 text-[10px] font-normal tracking-[0.6px] uppercase">Admin Panel</div></div>
        </a>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] rounded-full py-[5px] pl-2 pr-3"><div className="w-2 h-2 rounded-full bg-[#7C3AED]" /><span className="text-white text-xs font-semibold">Administrator</span></div>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="text-white/[0.55] text-xs no-underline py-[5px] px-2.5 rounded-md transition-all duration-150 hover:bg-white/[0.08] hover:text-white" style={{marginLeft: 12}}>← Home</a>
        <div id="ad-clock" className="text-white/50 text-[11px] font-['Roboto_Mono'] ml-2.5" />
      </nav>
      <div className="flex pt-14 min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-60 bg-white border-r border-[#E2E8F0] fixed top-14 left-0 bottom-0 overflow-y-auto py-5">
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Configuration</div>
          <a href="#" className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] hover:bg-[#F8FAFC] bg-[#F0F7FF] text-[#2563EB] border-l-[#2563EB] font-semibold" onClick={(e) => { showTab('equipment', e) }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">🏭</span>Equipment Register</a>
          <a href="#" className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]" onClick={(e) => { showTab('checklist', e) }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📝</span>PM Checklists</a>
          <a href="#" className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]" onClick={(e) => { showTab('sop', e) }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📖</span>SOP Library</a>
          <a href="#" className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]" onClick={(e) => { showTab('iiot', e) }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📡</span>IIoT Sensor Config</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Users &amp; Access</div>
          <a href="#" className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]" onClick={(e) => { showTab('users', e) }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">👥</span>User Management</a>
          <a href="#" className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]" onClick={(e) => { showTab('roles', e) }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">🔑</span>Roles &amp; Permissions</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Navigation</div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('checker'); }} className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]"><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">🔍</span>Checker View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('planner'); }} className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]"><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📋</span>Planner View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('executor'); }} className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]"><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">🔧</span>Executor View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className="sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px] border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]"><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📊</span>Mentor Dashboard</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Quick Actions</div>
          <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1">
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-xs font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={(e) => { alert('Add new equipment form') }}>+ Add Equipment</button>
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-xs font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={(e) => { alert('Add new user form') }}>+ Add User</button>
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-xs font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={(e) => { alert('System audit log') }}>🔍 Audit Log</button>
          </div>
        </aside>
        {/* MAIN */}
        <main className="ml-60 flex-1 pt-7 px-7 pb-10 [max-width:calc(100%-15rem)]">
          {/* EQUIPMENT TAB */}
          <div id="tab-equipment">
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-2 flex-wrap"><a className="text-[#94A3B8] no-underline hover:text-[#2563EB]" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>Home</a><span className="text-[10px] text-[#CBD5E1]">›</span>Admin<span className="text-[10px] text-[#CBD5E1]">›</span>Equipment Register</div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">Equipment Register</div><div className="text-[13px] text-[#64748B] mt-[3px]">All monitored assets with PM schedules</div></div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]" onClick={(e) => { alert('Export equipment list') }}>⬇ Export</button>
                  <button className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291]" onClick={(e) => { openModal('addEquipModal') }}>+ Add Equipment</button>
                </div>
              </div>
            </div>
            {/* Plant / Line / Machine filter bar */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl py-3 px-4 mb-4 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.5px]">Filter:</span>
              <select className="w-[100px] text-xs py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>All Plants</option><option>Plant A</option><option>Plant B</option><option>Plant C</option></select>
              <select className="w-[95px] text-xs py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>All Lines</option><option>Line 1</option><option>Line 2</option><option>Line 3</option></select>
              <select className="w-[150px] text-xs py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>All Machines</option><option>CP-101 Crusher</option><option>HX-204 Heat Exch.</option><option>COM-302 Compressor</option><option>MDU-115 Motor Drive</option><option>Forging Press</option><option>Robotic Arm</option></select>
              <select className="w-[130px] text-xs py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>All Status</option><option>Active PM Plan</option><option>No PM Plan</option><option>IIoT Connected</option><option>Overdue PM</option></select>
              <input className="w-[180px] text-xs py-[5px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]" placeholder="🔍 Search equipment…" />
            </div>
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] gap-3.5 mb-6">
              <div className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-xl py-[18px] px-5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#2563EB]"><div className="text-[11px] font-semibold tracking-wide uppercase text-[#64748B] mb-1.5">Total Equipment</div><div className="text-[26px] font-bold text-[#0B1F3A] leading-none font-['Roboto_Mono']">47</div><div className="text-[11px] text-[#94A3B8] mt-1">Across 6 plants</div></div>
              <div className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-xl py-[18px] px-5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#059669]"><div className="text-[11px] font-semibold tracking-wide uppercase text-[#64748B] mb-1.5">Active PM Plans</div><div className="text-[26px] font-bold text-[#0B1F3A] leading-none font-['Roboto_Mono']">44</div><div className="text-[11px] text-[#94A3B8] mt-1">93.6% coverage</div></div>
              <div className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-xl py-[18px] px-5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#D97706]"><div className="text-[11px] font-semibold tracking-wide uppercase text-[#64748B] mb-1.5">IIoT Connected</div><div className="text-[26px] font-bold text-[#0B1F3A] leading-none font-['Roboto_Mono']">38</div><div className="text-[11px] text-[#94A3B8] mt-1">80.9% monitored</div></div>
              <div className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-xl py-[18px] px-5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#DC2626]"><div className="text-[11px] font-semibold tracking-wide uppercase text-[#64748B] mb-1.5">Overdue PM</div><div className="text-[26px] font-bold text-[#0B1F3A] leading-none font-['Roboto_Mono']">3</div><div className="text-[11px] text-[#94A3B8] mt-1">Requires attention</div></div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div><div className="text-sm font-bold text-[#0B1F3A]">Equipment List</div><div className="text-xs text-[#64748B] mt-0.5">Click to view checklist and sensor assignments</div></div>
                <div className="flex gap-2">
                  <input className="w-[200px] py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]" placeholder="🔍 Search equipment…" />
                  <select className="w-[140px] py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>All Plants</option><option>Plant A</option><option>Plant B</option></select>
                </div>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-xl py-4 px-[18px] mb-2.5 flex items-center gap-3.5 cursor-pointer transition-all duration-150 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.06)] hover:border-[#3B82F6]">
                <div className="w-11 h-11 rounded-[10px] bg-[#F0F7FF] flex items-center justify-center text-xl shrink-0">⚙️</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#0B1F3A]">Centrifugal Pump — CP-101</div>
                  <div className="text-xs text-[#64748B] mt-0.5">Plant A · Utility Block · Last PM: 12 Jun 2026</div>
                </div>
                <div className="flex gap-2 mr-3">
                  <span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Active</span>
                  <span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E40AF] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">IIoT ●</span>
                </div>
                <div className="flex gap-4 ml-auto text-right">
                  <div className="text-[11px] text-[#64748B]"><strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono']">18</strong>Check pts</div>
                  <div className="text-[11px] text-[#64748B]"><strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono']">Daily</strong>Frequency</div>
                </div>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-xl py-4 px-[18px] mb-2.5 flex items-center gap-3.5 cursor-pointer transition-all duration-150 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.06)] hover:border-[#3B82F6]">
                <div className="w-11 h-11 rounded-[10px] bg-[#F0F7FF] flex items-center justify-center text-xl shrink-0">🔥</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#0B1F3A]">Heat Exchanger — HX-204</div>
                  <div className="text-xs text-[#64748B] mt-0.5">Plant B · Process Area 2 · Last PM: 10 Jun 2026</div>
                </div>
                <div className="flex gap-2 mr-3">
                  <span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Active</span>
                  <span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E40AF] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">IIoT ●</span>
                </div>
                <div className="flex gap-4 ml-auto text-right">
                  <div className="text-[11px] text-[#64748B]"><strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono']">22</strong>Check pts</div>
                  <div className="text-[11px] text-[#64748B]"><strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono']">Weekly</strong>Frequency</div>
                </div>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-xl py-4 px-[18px] mb-2.5 flex items-center gap-3.5 cursor-pointer transition-all duration-150 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.06)] hover:border-[#3B82F6]">
                <div className="w-11 h-11 rounded-[10px] bg-[#F0F7FF] flex items-center justify-center text-xl shrink-0">💨</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#0B1F3A]">Compressor — COM-302</div>
                  <div className="text-xs text-[#64748B] mt-0.5">Plant A · Compression Unit · Last PM: 05 Jun 2026</div>
                </div>
                <div className="flex gap-2 mr-3">
                  <span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#FEF2F2] text-[#991B1B] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Overdue</span>
                  <span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E40AF] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">IIoT ●</span>
                </div>
                <div className="flex gap-4 ml-auto text-right">
                  <div className="text-[11px] text-[#64748B]"><strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono']">30</strong>Check pts</div>
                  <div className="text-[11px] text-[#64748B]"><strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono']">Weekly</strong>Frequency</div>
                </div>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-xl py-4 px-[18px] mb-2.5 flex items-center gap-3.5 cursor-pointer transition-all duration-150 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.06)] hover:border-[#3B82F6]">
                <div className="w-11 h-11 rounded-[10px] bg-[#F0F7FF] flex items-center justify-center text-xl shrink-0">⚡</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#0B1F3A]">Motor Drive Unit — MDU-115</div>
                  <div className="text-xs text-[#64748B] mt-0.5">Plant C · Electrical Bay · Last PM: 14 Jun 2026</div>
                </div>
                <div className="flex gap-2 mr-3">
                  <span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Active</span>
                  <span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#F1F5F9] text-[#64748B] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">No IIoT</span>
                </div>
                <div className="flex gap-4 ml-auto text-right">
                  <div className="text-[11px] text-[#64748B]"><strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono']">14</strong>Check pts</div>
                  <div className="text-[11px] text-[#64748B]"><strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono']">Monthly</strong>Frequency</div>
                </div>
              </div>
            </div>
          </div>
          {/* CHECKLIST TAB */}
          <div id="tab-checklist" style={{display: 'none'}}>
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-2 flex-wrap"><a className="text-[#94A3B8] no-underline hover:text-[#2563EB]" href="#">Admin</a><span className="text-[10px] text-[#CBD5E1]">›</span>PM Checklists</div>
              <div className="flex items-center justify-between">
                <div><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">PM Checklist Builder</div><div className="text-[13px] text-[#64748B] mt-[3px]">Define inspection points for each equipment</div></div>
                <button className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291]">+ New Checklist</button>
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="text-sm font-bold text-[#0B1F3A]">CP-101 — Centrifugal Pump Daily Checklist</div>
                <button className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]">Edit</button>
              </div>
              <div className="flex gap-2.5 mb-4">
                <select className="w-[200px] py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>CP-101 — Centrifugal Pump</option></select>
                <select className="w-[140px] py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
              </div>
              <div className="flex items-start gap-3.5 py-3.5 px-4 border-[1.5px] border-[#E2E8F0] rounded-lg mb-2 bg-white transition-all duration-200">
                <div className="w-[26px] h-[26px] rounded-full bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold flex items-center justify-center shrink-0">1</div>
                <div className="flex-1"><div className="text-[13px] font-semibold text-[#0B1F3A] mb-0.5">Bearing Temperature Check</div><div className="text-xs text-[#64748B]">SOP-PM-001 · Limit: &lt;80°C · Instrument: Temp Gun</div></div>
                <div className="flex gap-2 ml-auto shrink-0 items-start"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Active</span></div>
              </div>
              <div className="flex items-start gap-3.5 py-3.5 px-4 border-[1.5px] border-[#E2E8F0] rounded-lg mb-2 bg-white transition-all duration-200">
                <div className="w-[26px] h-[26px] rounded-full bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold flex items-center justify-center shrink-0">2</div>
                <div className="flex-1"><div className="text-[13px] font-semibold text-[#0B1F3A] mb-0.5">Vibration Level — Drive End</div><div className="text-xs text-[#64748B]">SOP-PM-001 · Limit: &lt;4.5 mm/s RMS · Instrument: Vibration Meter</div></div>
                <div className="flex gap-2 ml-auto shrink-0 items-start"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Active</span></div>
              </div>
              <div className="flex items-start gap-3.5 py-3.5 px-4 border-[1.5px] border-[#E2E8F0] rounded-lg mb-2 bg-white transition-all duration-200">
                <div className="w-[26px] h-[26px] rounded-full bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold flex items-center justify-center shrink-0">3</div>
                <div className="flex-1"><div className="text-[13px] font-semibold text-[#0B1F3A] mb-0.5">Oil Level &amp; Condition</div><div className="text-xs text-[#64748B]">SOP-PM-002 · Visual Check · Min Level Mark</div></div>
                <div className="flex gap-2 ml-auto shrink-0 items-start"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Active</span></div>
              </div>
              <div className="flex items-start gap-3.5 py-3.5 px-4 border-[1.5px] border-[#E2E8F0] rounded-lg mb-2 bg-white transition-all duration-200">
                <div className="w-[26px] h-[26px] rounded-full bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold flex items-center justify-center shrink-0">4</div>
                <div className="flex-1"><div className="text-[13px] font-semibold text-[#0B1F3A] mb-0.5">Seal Leakage Inspection</div><div className="text-xs text-[#64748B]">SOP-PM-003 · Max 10 drops/min permissible</div></div>
                <div className="flex gap-2 ml-auto shrink-0 items-start"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Active</span></div>
              </div>
              <div className="flex items-start gap-3.5 py-3.5 px-4 border-[1.5px] border-[#E2E8F0] rounded-lg mb-2 bg-white transition-all duration-200">
                <div className="w-[26px] h-[26px] rounded-full bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold flex items-center justify-center shrink-0">5</div>
                <div className="flex-1"><div className="text-[13px] font-semibold text-[#0B1F3A] mb-0.5">Coupling Guard Condition</div><div className="text-xs text-[#64748B]">SOP-PM-001 · Visual check — no cracks/missing bolts</div></div>
                <div className="flex gap-2 ml-auto shrink-0 items-start"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Active</span></div>
              </div>
              <div className="mt-3"><button className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]">+ Add Check Point</button></div>
            </div>
          </div>
          {/* USERS TAB */}
          <div id="tab-users" style={{display: 'none'}}>
            <div className="mb-6 relative">
              <div><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">User Management</div><div className="text-[13px] text-[#64748B] mt-[3px]">Manage system users and role assignments</div></div>
              <button className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291] float-right -mt-8">+ Add User</button>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2"><div className="text-sm font-bold text-[#0B1F3A]">Active Users</div><span className="text-xs text-[#64748B]">12 users registered</span></div>
              <div className="grid [grid-template-columns:1fr_1fr_1fr_auto] gap-3 items-center py-3 border-b border-[#F1F5F9] text-[11px] font-bold tracking-[0.5px] uppercase text-[#94A3B8]">
                <div>User</div><div>Role</div><div>Last Active</div><div>Actions</div>
              </div>
              <div className="grid [grid-template-columns:1fr_1fr_1fr_auto] gap-3 items-center py-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 bg-[#7C3AED]">AK</div><div><div className="text-[13px] font-semibold">Amit Kumar</div><div className="text-[11px] text-[#64748B]">amit.k@plant.com</div></div></div>
                <div><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#F5F3FF] text-[#5B21B6] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Admin</span></div>
                <div className="text-xs text-[#64748B]">Today, 08:42</div>
                <div><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">Edit</button></div>
              </div>
              <div className="grid [grid-template-columns:1fr_1fr_1fr_auto] gap-3 items-center py-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 bg-[#059669]">RV</div><div><div className="text-[13px] font-semibold">Rajesh Verma</div><div className="text-[11px] text-[#64748B]">r.verma@plant.com</div></div></div>
                <div><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Checker</span></div>
                <div className="text-xs text-[#64748B]">Today, 09:15</div>
                <div><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">Edit</button></div>
              </div>
              <div className="grid [grid-template-columns:1fr_1fr_1fr_auto] gap-3 items-center py-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 bg-[#2563EB]">SP</div><div><div className="text-[13px] font-semibold">Suresh Patel</div><div className="text-[11px] text-[#64748B]">s.patel@plant.com</div></div></div>
                <div><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E40AF] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Planner</span></div>
                <div className="text-xs text-[#64748B]">Today, 07:58</div>
                <div><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">Edit</button></div>
              </div>
              <div className="grid [grid-template-columns:1fr_1fr_1fr_auto] gap-3 items-center py-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 bg-[#D97706]">MK</div><div><div className="text-[13px] font-semibold">Manoj Khanna</div><div className="text-[11px] text-[#64748B]">m.khanna@plant.com</div></div></div>
                <div><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#FFFBEB] text-[#92400E] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Executor</span></div>
                <div className="text-xs text-[#64748B]">Today, 10:05</div>
                <div><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">Edit</button></div>
              </div>
              <div className="grid [grid-template-columns:1fr_1fr_1fr_auto] gap-3 items-center py-3">
                <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 bg-[#D97706]">PS</div><div><div className="text-[13px] font-semibold">Pradeep Singh</div><div className="text-[11px] text-[#64748B]">p.singh@plant.com</div></div></div>
                <div><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#FFFBEB] text-[#92400E] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Executor</span></div>
                <div className="text-xs text-[#64748B]">Today, 09:48</div>
                <div><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">Edit</button></div>
              </div>
            </div>
          </div>
          {/* IIoT TAB */}
          <div id="tab-iiot" style={{display: 'none'}}>
            <div className="mb-6 relative">
              <div><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">IIoT Sensor Configuration</div><div className="text-[13px] text-[#64748B] mt-[3px]">Manage connected sensors and alert thresholds</div></div>
              <button className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291] float-right -mt-8">+ Add Sensor</button>
            </div>
            <div className="flex items-start gap-2.5 py-3 px-3.5 rounded-lg mb-4 text-[13px] border bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]">✅ 38 sensors online · Last sync: 15 Jun 2026 10:47 AM</div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2"><div className="text-sm font-bold text-[#0B1F3A]">Sensor Assignments — CP-101</div></div>
              <div className="overflow-x-auto"><table className="w-full border-collapse text-[13px]">
                  <thead><tr>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Sensor ID</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Parameter</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Unit</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Normal Range</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Warning</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Critical</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Status</th>
                  </tr></thead>
                  <tbody>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle font-['Roboto_Mono'] text-xs">SEN-001</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Bearing Temp DE</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">°C</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">40–75</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">76–85</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">&gt;85</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] align-middle"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Online</span></td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle font-['Roboto_Mono'] text-xs">SEN-002</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Vibration DE</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">mm/s</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">0–4.5</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">4.5–7</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">&gt;7</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] align-middle"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Online</span></td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle font-['Roboto_Mono'] text-xs">SEN-003</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Motor Current</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Amps</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">38–52</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">52–58</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">&gt;58</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] align-middle"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Online</span></td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle font-['Roboto_Mono'] text-xs">SEN-004</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Discharge Pressure</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Bar</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">4.5–6.2</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">6.2–7</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">&gt;7</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] align-middle"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#FFFBEB] text-[#92400E] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Warning</span></td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 text-[#334155] align-middle font-['Roboto_Mono'] text-xs">SEN-005</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">Oil Level</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">%</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">60–100</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">40–60</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">&lt;40</td><td className="py-[11px] px-3.5 align-middle"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#ECFDF5] text-[#065F46] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current">Online</span></td></tr>
                  </tbody>
                </table></div>
            </div>
          </div>
          {/* SOP TAB placeholder */}
          <div id="tab-sop" style={{display: 'none'}}>
            <div className="mb-6"><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">SOP Library</div><div className="text-[13px] text-[#64748B] mt-[3px]">Standard Operating Procedures for inspection tasks</div></div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2"><div className="text-sm font-bold text-[#0B1F3A]">Available SOPs</div><button className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291]">Upload SOP</button></div>
              <div className="flex items-center gap-2.5 py-2.5 border-b border-[#F1F5F9]"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E40AF] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current mr-1.5">SOP-PM-001</span><span className="flex-1 text-[13px] font-medium">Rotating Equipment — Daily Inspection Procedure</span><span className="text-[11px] text-[#64748B] mr-3">Rev 4 · Jan 2026</span><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">View</button></div>
              <div className="flex items-center gap-2.5 py-2.5 border-b border-[#F1F5F9]"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E40AF] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current mr-1.5">SOP-PM-002</span><span className="flex-1 text-[13px] font-medium">Lubrication &amp; Oil Level Check Protocol</span><span className="text-[11px] text-[#64748B] mr-3">Rev 2 · Mar 2026</span><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">View</button></div>
              <div className="flex items-center gap-2.5 py-2.5 border-b border-[#F1F5F9]"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E40AF] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current mr-1.5">SOP-PM-003</span><span className="flex-1 text-[13px] font-medium">Mechanical Seal Inspection — Pumps</span><span className="text-[11px] text-[#64748B] mr-3">Rev 3 · Feb 2026</span><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">View</button></div>
              <div className="flex items-center gap-2.5 py-2.5"><span className="inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E40AF] before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current mr-1.5">SOP-PM-004</span><span className="flex-1 text-[13px] font-medium">Compressor Valve &amp; Filter Inspection</span><span className="text-[11px] text-[#64748B] mr-3">Rev 1 · May 2026</span><button className="inline-flex items-center gap-1.5 py-[5px] px-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]">View</button></div>
            </div>
          </div>
          {/* ROLES TAB placeholder */}
          <div id="tab-roles" style={{display: 'none'}}>
            <div className="mb-6"><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">Roles &amp; Permissions</div><div className="text-[13px] text-[#64748B] mt-[3px]">Define access levels for each user role</div></div>
            <div className="flex items-start gap-2.5 py-3 px-3.5 rounded-lg mb-4 text-[13px] border bg-[#F0F7FF] border-[#BFDBFE] text-[#1E40AF]">ℹ️ Role changes take effect on next login for affected users.</div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2"><div className="text-sm font-bold text-[#0B1F3A]">Permission Matrix</div></div>
              <div className="overflow-x-auto"><table className="w-full border-collapse text-[13px]">
                  <thead><tr>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Permission</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Admin</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Checker</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Planner</th>
                    <th className="text-left text-[11px] font-bold tracking-wide uppercase text-[#64748B] py-2.5 px-3.5 border-b-2 border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">Executor</th>
                  </tr></thead>
                  <tbody>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">View Equipment List</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Run PM Inspection</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Log Abnormality</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Generate Work Orders</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Assign Tasks</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Execute &amp; Close Tasks</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">Audit Work Quality</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">❌</td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">View Mentor Dashboard</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 border-b border-[#F1F5F9] text-[#334155] align-middle">✅</td></tr>
                    <tr className="hover:bg-[#F8FAFC]"><td className="py-[11px] px-3.5 text-[#334155] align-middle">System Configuration</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">✅</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">❌</td><td className="py-[11px] px-3.5 text-[#334155] align-middle">❌</td></tr>
                  </tbody>
                </table></div>
            </div>
          </div>
        </main>
      </div>
      {/* ADD EQUIPMENT MODAL */}
      <div className="hidden fixed inset-0 bg-black/45 z-[200] items-center justify-center p-5" id="addEquipModal">
        <div className="bg-white rounded-xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04)]">
          <div className="py-5 px-6 pb-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="text-base font-bold text-[#0B1F3A]">Add New Equipment</div>
            <button className="w-8 h-8 rounded-md border-none bg-[#F1F5F9] cursor-pointer text-base flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0]" onClick={(e) => { closeModal('addEquipModal') }}>✕</button>
          </div>
          <div className="py-5 px-6">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="mb-4"><label className="block text-xs font-semibold text-[#334155] mb-[5px]">Equipment ID</label><input className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]" placeholder="e.g. CP-201" /></div>
              <div className="mb-4"><label className="block text-xs font-semibold text-[#334155] mb-[5px]">Equipment Name</label><input className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]" placeholder="e.g. Centrifugal Pump" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="mb-4"><label className="block text-xs font-semibold text-[#334155] mb-[5px]">Plant / Location</label><select className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>Plant A</option><option>Plant B</option><option>Plant C</option></select></div>
              <div className="mb-4"><label className="block text-xs font-semibold text-[#334155] mb-[5px]">PM Frequency</label><select className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div>
            </div>
            <div className="mb-4"><label className="block text-xs font-semibold text-[#334155] mb-[5px]">Equipment Category</label><select className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>Rotating Equipment</option><option>Static Equipment</option><option>Electrical</option><option>Instrumentation</option></select></div>
            <div className="mb-4"><label className="block text-xs font-semibold text-[#334155] mb-[5px]">Assign Checklist SOP</label><select className="w-full py-[9px] px-3 border-[1.5px] border-[#CBD5E1] rounded-lg text-[13px] font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"><option>SOP-PM-001 — Rotating Equipment</option><option>SOP-PM-002 — Lubrication</option></select></div>
          </div>
          <div className="py-4 px-6 border-t border-[#E2E8F0] flex justify-end gap-2.5">
            <button className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]" onClick={(e) => { closeModal('addEquipModal') }}>Cancel</button>
            <button className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291]">Save Equipment</button>
          </div>
        </div>
      </div>
    </div>
  );
}