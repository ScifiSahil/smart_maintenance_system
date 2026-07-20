import React, { useState, useEffect, useRef } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from '../store';
import { loadEquipment, setEquipmentFilters, removeEquipment } from '../actions/equipmentActions';
import EquipmentStatsCards from './EquipmentStatsCards';
import EquipmentCard from './EquipmentCard';
import AddEquipmentModal from './AddEquipmentModal';
import ChecklistBuilder from './ChecklistBuilder';
import SOPLibrary from './SOPLibrary';
import { loadPlants } from '../actions/plantActions';
import { loadLines } from '../actions/lineActions';
import { loadMachines } from '../actions/machineActions';
import ConfigurationModal from './ConfigurationModal';
import ConfigMasterPicker from './ConfigMasterPicker';
import SpareStandardization from './SpareStandardization';



const SIDEBAR_LINK_BASE =
  "sidebar-link flex items-center gap-2.5 py-2.5 px-5 text-base font-semibold no-underline transition-all duration-150 border-l-[3px]";
const SIDEBAR_ACTIVE = "bg-[#F0F7FF] text-[#2563EB] border-l-[#2563EB] font-semibold hover:bg-[#F8FAFC]";
const SIDEBAR_INACTIVE = "border-l-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]";

const sidebarLinkClass = (tabName, activeTab) =>
  `${SIDEBAR_LINK_BASE} ${activeTab === tabName ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE}`;

function AdminPageInner({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('equipment');
  const [addEquipModalOpen, setAddEquipModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [clock, setClock] = useState('');
  const [configOpen, setConfigOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState({ top: 60, right: 20 });
  const [selectedMaster, setSelectedMaster] = useState('plant');
  const gearBtnRef = useRef(null);

  const dispatch = useDispatch();
  const { items, filters, status, error } = useSelector((s) => s.equipment);
  const { items: plantItems, status: plantsStatus } = useSelector((s) => s.plants);
  const { items: lineItems, status: linesStatus } = useSelector((s) => s.lines);
  const { items: machineItems, status: machinesStatus } = useSelector((s) => s.machines);


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
    dispatch(loadPlants());
    dispatch(loadLines());       // Line Name filter — from smartpm_line_master
    dispatch(loadMachines());    // Machine Name filter — from smartpm_machine_master
  }, [dispatch]);

  // Both the filter bar and the equipment list are filtered client-side
  // (the backend doesn't support query-param filtering yet — GET returns everything)
  const filteredItems = items.filter((eq) => {
    if (filters.plant_code !== 'all' && String(eq.plant_code) !== String(filters.plant_code)) return false;
    if (filters.status === 'overdue' && eq.pm_status !== 'overdue') return false;
    if (filters.status === 'iiot_connected' && eq.iiot_status !== 'connected') return false;
    if (filters.status === 'no_pm_plan' && eq.checklist_sop_id) return false;
    if (filters.line_name !== 'all' && String(eq.line || '') !== String(filters.line_name)) return false;
    if (filters.machine_name !== 'all' && String(eq.machine || '') !== String(filters.machine_name)) return false;
    if (filters.assembly !== 'all' && String(eq.assembly || '') !== String(filters.assembly)) return false;
    if (filters.sub_assembly !== 'all' && String(eq.sub_assembly || '') !== String(filters.sub_assembly)) return false;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const matches =
        (eq.equipment_name || '').toLowerCase().includes(term) ||
        (eq.equipment_code || '').toLowerCase().includes(term);
      if (!matches) return false;
    }
    return true;
  });

  // Line Name dropdown — from smartpm_line_master, scoped to the selected Plant.
  // Deduped by name (so the dropdown doesn't show the same name twice) — the CRUD
  // table (Configuration modal) shows raw rows without dedup.
  const lineOptions = [
    ...new Map(
      lineItems
        .filter((l) => filters.plant_code === 'all' || String(l.plant_code) === String(filters.plant_code))
        .map((l) => [l.line_name, l])
    ).values(),
  ];

  // Machine Name dropdown — from smartpm_machine_master, scoped to selected Plant + Line
  const machineOptions = [
    ...new Map(
      machineItems
        .filter(
          (m) =>
            (filters.plant_code === 'all' || String(m.plant_code) === String(filters.plant_code)) &&
            (filters.line_name === 'all' || String(m.line_name) === String(filters.line_name))
        )
        .map((m) => [m.machine_name, m])
    ).values(),
  ];

  // Assembly / Sub-Assembly have no master table — unique, non-empty values are
  // derived directly from the equipment records already loaded. Assembly is
  // scoped by Machine, Sub-Assembly is scoped by Assembly.
  const assemblyOptions = [
    ...new Set(
      items
        .filter((eq) => filters.machine_name === 'all' || String(eq.machine || '') === String(filters.machine_name))
        .map((eq) => eq.assembly)
        .filter(Boolean)
    ),
  ].sort();

  const subAssemblyOptions = [
    ...new Set(
      items
        .filter(
          (eq) =>
            (filters.machine_name === 'all' || String(eq.machine || '') === String(filters.machine_name)) &&
            (filters.assembly === 'all' || String(eq.assembly || '') === String(filters.assembly))
        )
        .map((eq) => eq.sub_assembly)
        .filter(Boolean)
    ),
  ].sort();

  const handleFilterChange = (field) => (e) => {
    const value = e.target.value;
    // Changing Plant resets Line + Machine + Assembly + Sub-Assembly
    if (field === 'plant_code') {
      dispatch(
        setEquipmentFilters({
          plant_code: value,
          line_name: 'all',
          machine_name: 'all',
          assembly: 'all',
          sub_assembly: 'all',
        })
      );
      return;
    }
    // Changing Line resets Machine + Assembly + Sub-Assembly (machine is line-scoped)
    if (field === 'line_name') {
      dispatch(
        setEquipmentFilters({ line_name: value, machine_name: 'all', assembly: 'all', sub_assembly: 'all' })
      );
      return;
    }
    // Changing Machine resets Assembly + Sub-Assembly (assembly is machine-scoped)
    if (field === 'machine_name') {
      dispatch(setEquipmentFilters({ machine_name: value, assembly: 'all', sub_assembly: 'all' }));
      return;
    }
    // Changing Assembly resets Sub-Assembly (sub-assembly is assembly-scoped)
    if (field === 'assembly') {
      dispatch(setEquipmentFilters({ assembly: value, sub_assembly: 'all' }));
      return;
    }
    dispatch(setEquipmentFilters({ [field]: value }));
  };

  // Confirms and soft-deletes (backend sets is_active=0)
  const handleDelete = (eq) => {
    const ok = window.confirm(`Delete "${eq.equipment_name}" (${eq.equipment_code})?`);
    if (ok) dispatch(removeEquipment(eq.cdb_object_id));
  };

  return (
    <div>
      <nav className="bg-[#0B1F3A] h-14 flex items-center px-5 gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.25)] fixed top-0 left-0 right-0 z-[100]">
        <a className="flex items-center gap-2.5 no-underline" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>
          <div className="w-8 h-8 bg-[#2563EB] rounded-md flex items-center justify-center text-lg">⚙️</div>
          <div><div className="text-white text-lg font-bold tracking-[-0.2px]">SmartPM</div><div className="text-white/40 text-xs font-normal tracking-[0.6px] uppercase">Admin Panel</div></div>
        </a>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] rounded-full py-[5px] pl-2 pr-3"><div className="w-2 h-2 rounded-full bg-[#7C3AED]" /><span className="text-white text-sm font-semibold">Administrator</span></div>
        <button
          ref={gearBtnRef}
          onClick={() => {
            const rect = gearBtnRef.current.getBoundingClientRect();
            setPickerAnchor({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
            setPickerOpen(true);
          }}
          title="System Configuration"
          className="w-8 h-8 flex items-center justify-center rounded-md text-white/[0.75] text-lg bg-white/[0.08] border border-white/[0.12] cursor-pointer transition-all duration-150 hover:bg-white/[0.16] hover:text-white"
          style={{ marginLeft: 4 }}
        >
          ⚙️
        </button>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="text-white/[0.55] text-sm no-underline py-[5px] px-2.5 rounded-md transition-all duration-150 hover:bg-white/[0.08] hover:text-white" style={{ marginLeft: 12 }}>← Home</a>
        <div className="text-white/50 text-sm ml-2.5" style={{ fontFamily: 'var(--font-mono)' }}>{clock}</div>
      </nav>

      <div className="flex pt-14 min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-60 bg-white border-r border-[#E2E8F0] fixed top-14 left-0 bottom-0 overflow-y-auto py-5">
          <div className="text-xs font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Configuration</div>
          <a href="#" className={sidebarLinkClass('equipment', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('equipment'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">🏭</span>Equipment Register</a>
          <a href="#" className={sidebarLinkClass('checklist', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('checklist'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">📝</span>PM Checklists</a>
          <a href="#" className={sidebarLinkClass('sop', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('sop'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">📖</span>SOP Library</a>
          <a href="#" className={sidebarLinkClass('standardization', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('standardization'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">🔩</span>Spare Standardization</a>

          <a href="#" className={sidebarLinkClass('iiot', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('iiot'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">📡</span>IIoT Sensor Config</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-xs font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Users &amp; Access</div>
          <a href="#" className={sidebarLinkClass('users', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">👥</span>User Management</a>
          <a href="#" className={sidebarLinkClass('roles', activeTab)} onClick={(e) => { e.preventDefault(); setActiveTab('roles'); }}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">🔑</span>Roles &amp; Permissions</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-xs font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Navigation</div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('checker'); }} className={`${SIDEBAR_LINK_BASE} ${SIDEBAR_INACTIVE}`}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">🔍</span>Checker View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('planner'); }} className={`${SIDEBAR_LINK_BASE} ${SIDEBAR_INACTIVE}`}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">📋</span>Planner View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('executor'); }} className={`${SIDEBAR_LINK_BASE} ${SIDEBAR_INACTIVE}`}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">🔧</span>Executor View</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className={`${SIDEBAR_LINK_BASE} ${SIDEBAR_INACTIVE}`}><span className="w-[18px] h-[18px] flex items-center justify-center text-base shrink-0">📊</span>Mentor Dashboard</a>
          <div className="h-px bg-[#E2E8F0] my-2.5" />
          <div className="text-xs font-bold tracking-wider uppercase text-[#94A3B8] pt-3.5 px-5 pb-1.5">Quick Actions</div>
          <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1">
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-sm font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={() => setAddEquipModalOpen(true)}>+ Add Equipment</button>
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-sm font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={() => alert('Add new user form')}>+ Add User</button>
            <button className="flex items-center gap-2 py-[7px] px-3 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#1E5291] text-sm font-semibold cursor-pointer transition-all duration-150 w-full hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]" onClick={() => alert('System audit log')}>🔍 Audit Log</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="ml-60 flex-1 pt-7 px-7 pb-10 [max-width:calc(100%-15rem)]">
          <div className="max-w-[1440px]">
          {/* EQUIPMENT TAB — real data */}
          {activeTab === 'equipment' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-sm text-[#94A3B8] mb-2 flex-wrap"><a className="text-[#94A3B8] no-underline hover:text-[#2563EB]" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>Home</a><span className="text-xs text-[#CBD5E1]">›</span>Admin<span className="text-xs text-[#CBD5E1]">›</span>Equipment Register</div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div><div className="text-2xl font-bold text-[#0B1F3A] tracking-[-0.3px]">Equipment Register</div><div className="text-base text-[#64748B] mt-[3px]">All monitored assets with PM schedules</div></div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1.5 py-[5px] px-3 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]" onClick={() => alert('Export equipment list')}>⬇ Export</button>
                    <button className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-base font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-[#2563EB] text-white hover:bg-[#1E5291]" onClick={() => setAddEquipModalOpen(true)}>+ Add Equipment</button>
                  </div>
                </div>
              </div>

              {/* Filter bar */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl py-3 px-4 mb-4 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-[#64748B] uppercase tracking-[0.5px]">Filter:</span>
                <select
  className="w-[160px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
  value={filters.plant_code}
  onChange={handleFilterChange('plant_code')}
>
  <option value="all">All Plants</option>
  {plantsStatus === 'loading' && <option disabled>Loading plants…</option>}
  {plantItems.map((p) => (
    <option key={p.plant_code} value={p.plant_code}>
      {p.plant_name} ({p.plant_code})
    </option>
  ))}
</select>
                <select className="w-[150px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]" value={filters.status} onChange={handleFilterChange('status')}>
                  <option value="all">All Status</option>
                  <option value="iiot_connected">IIoT Connected</option>
                  <option value="overdue">Overdue PM</option>
                  <option value="no_pm_plan">No PM Plan</option>
                </select>
                <select
                  className="w-[150px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                  value={filters.line_name}
                  onChange={handleFilterChange('line_name')}
                >
                  <option value="all">All Lines</option>
                  {linesStatus === 'loading' && <option disabled>Loading lines…</option>}
                  {linesStatus === 'failed' && <option disabled>Failed to load lines</option>}
                  {lineOptions.map((l) => (
                    <option key={`${l.plant_code}-${l.line_name}`} value={l.line_name}>
                      {l.line_name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-[160px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                  value={filters.machine_name}
                  onChange={handleFilterChange('machine_name')}
                >
                  <option value="all">All Machines</option>
                  {machinesStatus === 'loading' && <option disabled>Loading machines…</option>}
                  {machinesStatus === 'failed' && <option disabled>Failed to load machines</option>}
                  {machineOptions.map((m) => (
                    <option key={`${m.plant_code}-${m.line_name}-${m.machine_name}`} value={m.machine_name}>
                      {m.machine_name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-[150px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                  value={filters.assembly}
                  onChange={handleFilterChange('assembly')}
                >
                  <option value="all">All Assemblies</option>
                  {assemblyOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <select
                  className="w-[160px] text-sm py-[5px] px-2 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]"
                  value={filters.sub_assembly}
                  onChange={handleFilterChange('sub_assembly')}
                >
                  <option value="all">All Sub-Assemblies</option>
                  {subAssemblyOptions.map((sa) => (
                    <option key={sa} value={sa}>{sa}</option>
                  ))}
                </select>
                <input className="w-[180px] text-sm py-[5px] px-2.5 border-[1.5px] border-[#CBD5E1] rounded-lg text-[#334155] bg-white outline-none focus:border-[#3B82F6]" placeholder="🔍 Search equipment…" value={filters.search} onChange={handleFilterChange('search')} />
              </div>

              <EquipmentStatsCards items={items} />

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div><div className="text-base font-bold text-[#0B1F3A]">Equipment List</div><div className="text-sm text-[#64748B] mt-0.5">Click to view checklist and sensor assignments</div></div>
                </div>

                {status === 'loading' && <p className="text-base text-[#64748B] py-4">Loading equipment…</p>}
                {status === 'failed' && <p className="text-base text-[#DC2626] py-4">Load failed: {error}</p>}
                {status === 'succeeded' && filteredItems.length === 0 && (
                  <p className="text-base text-[#64748B] py-4">No equipment found.</p>
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

          {/* CHECKLIST TAB — PM Checklist Builder (real data) */}
          {activeTab === 'checklist' && <ChecklistBuilder />}

          {/* USERS TAB — static placeholder */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6"><div className="text-2xl font-bold text-[#0B1F3A] tracking-[-0.3px]">User Management</div><div className="text-base text-[#64748B] mt-[3px]">Manage system users and role assignments</div></div>
              <p className="text-base text-[#64748B]">This module hasn't been built yet.</p>
            </div>
          )}

          {/* IIoT TAB — static placeholder */}
          {activeTab === 'iiot' && (
            <div>
              <div className="mb-6"><div className="text-2xl font-bold text-[#0B1F3A] tracking-[-0.3px]">IIoT Sensor Configuration</div><div className="text-base text-[#64748B] mt-[3px]">Manage connected sensors and alert thresholds</div></div>
              <p className="text-base text-[#64748B]">This module hasn't been built yet.</p>
            </div>
          )}

          {/* SOP TAB — SOP Library (real data) */}
          {activeTab === 'sop' && <SOPLibrary />}
 
 {activeTab === 'standardization' && <SpareStandardization />}



          {/* ROLES TAB — static placeholder */}
          {activeTab === 'roles' && (
            <div>
              <div className="mb-6"><div className="text-2xl font-bold text-[#0B1F3A] tracking-[-0.3px]">Roles &amp; Permissions</div><div className="text-base text-[#64748B] mt-[3px]">Define access levels for each user role</div></div>
              <p className="text-base text-[#64748B]">This module hasn't been built yet.</p>
            </div>
          )}
          </div>
        </main>
      </div>

      <AddEquipmentModal
        isOpen={addEquipModalOpen || Boolean(editingEquipment)}
        equipment={editingEquipment}
        onClose={() => { setAddEquipModalOpen(false); setEditingEquipment(null); }}
      />

      {pickerOpen && (
        <ConfigMasterPicker
          anchor={pickerAnchor}
          onClose={() => setPickerOpen(false)}
          onSelect={(key) => {
            setSelectedMaster(key);
            setPickerOpen(false);
            setConfigOpen(true);
          }}
        />
      )}

      {configOpen && (
        <ConfigurationModal initialMaster={selectedMaster} onClose={() => setConfigOpen(false)} />
      )}
    </div>
  );
}

// A separate Redux <Provider>, independent of CMDBuild's root Provider.
// Only AdminPageInner and its children see this store.
export default function AdminPage(props) {
  return (
    <Provider store={store}>
      <AdminPageInner {...props} />
    </Provider>
  );
}