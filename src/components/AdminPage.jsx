import React, { useState, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from '../store';
import { loadEquipment, setEquipmentFilters, removeEquipment } from '../actions/equipmentActions';
import EquipmentStatsCards from './EquipmentStatsCards';
import EquipmentCard from './EquipmentCard';
import AddEquipmentModal from './AddEquipmentModal';

const SIDEBAR_LINK_BASE =
  "sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-[13px] font-medium no-underline transition-all duration-150 border-l-[3px]";
const SIDEBAR_ACTIVE = "bg-[#F0F7FF] text-[#2563EB] border-l-[#2563EB] font-semibold hover:bg-[#F8FAFC]";
const SIDEBAR_INACTIVE = "border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]";

const sidebarLinkClass = (tabName, activeTab) =>
  `${SIDEBAR_LINK_BASE} ${activeTab === tabName ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE}`;

function AdminPageInner({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('equipment');
  const [addEquipModalOpen, setAddEquipModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [clock, setClock] = useState('');

  const dispatch = useDispatch();
  const { items, filters, status, error } = useSelector((s) => s.equipment);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(
        n.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ' ' +
          n.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      );
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    dispatch(loadEquipment());
  }, [dispatch]);

  // Filter bar aur equipment list dono client-side filter hote hain
  // (backend abhi query-param filter support nahi karta — GET sab kuch laata hai)
  const filteredItems = items.filter((eq) => {
    if (filters.plant_code !== 'all' && String(eq.plant_code) !== String(filters.plant_code)) return false;
    if (filters.status === 'overdue' && eq.pm_status !== 'overdue') return false;
    if (filters.status === 'iiot_connected' && eq.iiot_status !== 'connected') return false;
    if (filters.status === 'no_pm_plan' && eq.checklist_sop_id) return false;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const matches =
        (eq.equipment_name || '').toLowerCase().includes(term) ||
        (eq.equipment_code || '').toLowerCase().includes(term);
      if (!matches) return false;
    }
    return true;
  });

  const handleFilterChange = (field) => (e) => {
    dispatch(setEquipmentFilters({ [field]: e.target.value }));
  };

  // Confirm karke soft-delete karta hai (backend is_active=0 karega)
  const handleDelete = (eq) => {
    const ok = window.confirm(`"${eq.equipment_name}" (${eq.equipment_code}) delete karna hai?`);
    if (ok) dispatch(removeEquipment(eq.cdb_object_id));
  };

  return (
    <div>
      <nav className="bg-[#0B1F3A] h-14 flex items-center px-5 gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.25)] fixed top-0 left-0 right-0 z-[100]">
        <a className="flex items-center gap-2.5 no-underline" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>
          <div className="w-8 h-8 bg-[#2563EB] rounded-md flex items-center justify-center text-base">⚙️</div>
          <div><div className="text-white text-[15px] font-bold tracking-[-0.2px]">SmartPM</div><div className="text-white/40 text-[10px] font-normal tracking-[0.6px] uppercase">Admin Panel</div></div>
        </a>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] rounded-full py-[5px] pl-2 pr-3"><div className="w-2 h-2 rounded-full bg-[#7C3AED]" /><span className="text-white text-xs font-semibold">Administrator</span></div>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="text-white/[0.55] text-xs no-underline py-[5px] px-2.5 rounded-md transition-all duration-150 hover:bg-white/[0.08] hover:text-white" style={{ marginLeft: 12 }}>← Home</a>
        <div className="text-white/50 text-[11px] font-['Roboto_Mono'] ml-2.5">{clock}</div>
      </nav>

      <div className="flex pt-14 min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-60 bg-white border-r border-[#E2E8F0] fixed top-14 left-0 bottom-0 overflow-y-auto py-5">
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Configuration</div>
          <a href="#" className={sidebarLinkClass('equipment', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('equipment'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">🏭</span>Equipment Register</a>
          <a href="#" className={sidebarLinkClass('checklist', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('checklist'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📝</span>PM Checklists</a>
          <a href="#" className={sidebarLinkClass('sop', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('sop'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📖</span>SOP Library</a>
          <a href="#" className={sidebarLinkClass('iiot', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('iiot'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📡</span>IIoT Sensor Config</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Users &amp; Access</div>
          <a href="#" className={sidebarLinkClass('users', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">👥</span>User Management</a>
          <a href="#" className={sidebarLinkClass('roles', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('roles'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">🔑</span>Roles &amp; Permissions</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Navigation</div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('checker'); }} className={`${SIDEBAR_LINK_BASE} ${SIDEBAR_INACTIVE}`}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">🔍</span>Checker View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('planner'); }} className={`${SIDEBAR_LINK_BASE} ${SIDEBAR_INACTIVE}`}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📋</span>Planner View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('executor'); }} className={`${SIDEBAR_LINK_BASE} ${SIDEBAR_INACTIVE}`}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">🔧</span>Executor View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className={`${SIDEBAR_LINK_BASE} ${SIDEBAR_INACTIVE}`}><span className="w-[18px] h-[18px] flex items-center justify-center text-sm shrink-0">📊</span>Mentor Dashboard</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Quick Actions</div>
          <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1">
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-xs font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={() => setAddEquipModalOpen(true)}>+ Add Equipment</button>
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-xs font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={() => alert('Add new user form')}>+ Add User</button>
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-xs font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={() => alert('System audit log')}>🔍 Audit Log</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="ml-60 flex-1 pt-7 px-7 pb-10 [max-width:calc(100%-15rem)]">
          {/* EQUIPMENT TAB — real data */}
          {activeTab === 'equipment' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-2 flex-wrap"><a className="text-[#94A3B8] no-underline hover:text-[#2563EB]" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>Home</a><span className="text-[10px] text-[#CBD5E1]">›</span>Admin<span className="text-[10px] text-[#CBD5E1]">›</span>Equipment Register</div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">Equipment Register</div><div className="text-[13px] text-[#64748B] mt-[3px]">All monitored assets with PM schedules</div></div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]" onClick={() => alert('Export equipment list')}>⬇ Export</button>
                    <button className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291]" onClick={() => setAddEquipModalOpen(true)}>+ Add Equipment</button>
                  </div>
                </div>
              </div>

              {/* Filter bar */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl py-3 px-4 mb-4 flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.5px]">Filter:</span>
                <select className="w-[110px] text-xs py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6]" value={filters.plant_code} onChange={handleFilterChange('plant_code')}>
                  <option value="all">All Plants</option>
                  <option value="1">Plant 1</option>
                  <option value="2">Plant 2</option>
                  <option value="3">Plant 3</option>
                </select>
                <select className="w-[150px] text-xs py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6]" value={filters.status} onChange={handleFilterChange('status')}>
                  <option value="all">All Status</option>
                  <option value="iiot_connected">IIoT Connected</option>
                  <option value="overdue">Overdue PM</option>
                  <option value="no_pm_plan">No PM Plan</option>
                </select>
                <input className="w-[180px] text-xs py-[5px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg font-sans text-[#334155] bg-white outline-none focus:border-[#3B82F6]" placeholder="🔍 Search equipment…" value={filters.search} onChange={handleFilterChange('search')} />
              </div>

              <EquipmentStatsCards items={items} />

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div><div className="text-sm font-bold text-[#0B1F3A]">Equipment List</div><div className="text-xs text-[#64748B] mt-0.5">Click to view checklist and sensor assignments</div></div>
                </div>

                {status === 'loading' && <p className="text-sm text-[#64748B] py-4">Loading equipment…</p>}
                {status === 'failed' && <p className="text-sm text-[#DC2626] py-4">Load failed: {error}</p>}
                {status === 'succeeded' && filteredItems.length === 0 && (
                  <p className="text-sm text-[#64748B] py-4">No equipment found.</p>
                )}
                {filteredItems.map((eq) => (
                  <EquipmentCard
                    key={eq.cdb_object_id}
                    equipment={eq}
                    onEdit={(e) => setEditingEquipment(e)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CHECKLIST TAB — static placeholder, module baad mein banega */}
          {activeTab === 'checklist' && (
            <div>
              <div className="mb-6"><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">PM Checklist Builder</div><div className="text-[13px] text-[#64748B] mt-[3px]">Define inspection points for each equipment</div></div>
              <p className="text-sm text-[#64748B]">Ye module abhi banaya nahi gaya — Equipment ke baad next.</p>
            </div>
          )}

          {/* USERS TAB — static placeholder */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6"><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">User Management</div><div className="text-[13px] text-[#64748B] mt-[3px]">Manage system users and role assignments</div></div>
              <p className="text-sm text-[#64748B]">Ye module abhi banaya nahi gaya.</p>
            </div>
          )}

          {/* IIoT TAB — static placeholder */}
          {activeTab === 'iiot' && (
            <div>
              <div className="mb-6"><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">IIoT Sensor Configuration</div><div className="text-[13px] text-[#64748B] mt-[3px]">Manage connected sensors and alert thresholds</div></div>
              <p className="text-sm text-[#64748B]">Ye module abhi banaya nahi gaya.</p>
            </div>
          )}

          {/* SOP TAB — static placeholder */}
          {activeTab === 'sop' && (
            <div>
              <div className="mb-6"><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">SOP Library</div><div className="text-[13px] text-[#64748B] mt-[3px]">Standard Operating Procedures for inspection tasks</div></div>
              <p className="text-sm text-[#64748B]">Ye module abhi banaya nahi gaya.</p>
            </div>
          )}

          {/* ROLES TAB — static placeholder */}
          {activeTab === 'roles' && (
            <div>
              <div className="mb-6"><div className="text-[22px] font-bold text-[#0B1F3A] tracking-[-0.3px]">Roles &amp; Permissions</div><div className="text-[13px] text-[#64748B] mt-[3px]">Define access levels for each user role</div></div>
              <p className="text-sm text-[#64748B]">Ye module abhi banaya nahi gaya.</p>
            </div>
          )}
        </main>
      </div>

      <AddEquipmentModal
        isOpen={addEquipModalOpen || Boolean(editingEquipment)}
        equipment={editingEquipment}
        onClose={() => { setAddEquipModalOpen(false); setEditingEquipment(null); }}
      />
    </div>
  );
}

// Apna alag Redux <Provider> — CMDBuild ke root Provider se independent.
// Sirf AdminPageInner aur uske children ko ye store dikhta hai.
export default function AdminPage(props) {
  return (
    <Provider store={store}>
      <AdminPageInner {...props} />
    </Provider>
  );
}