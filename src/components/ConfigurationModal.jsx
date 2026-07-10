// components/ConfigurationModal.jsx
// "⚙️ Settings" icon (AdminPage header) -> ConfigMasterPicker se open hota
// hai. Iska header + sidebar jaante-bujhte AdminPage se ALAG theme mein hai
// (deep indigo, card-style sidebar) — taaki "Configuration" apni ek alag
// identity wali screen lage, na ki Admin Panel ka hi extension.
// Naya master future mein add karna ho to: MasterCrudPanel ko naye
// columns/fields ke saath SIDEBAR array mein ek entry jod ke reuse karo.

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MasterCrudPanel from "./MasterCrudPanel";
import { addPlant, editPlant, removePlant } from "../actions/plantActions";
import { addLine, editLine, removeLine } from "../actions/lineActions";
import { addMachine, editMachine, removeMachine } from "../actions/machineActions";

const SIDEBAR_ITEMS = [
  { key: "plant", label: "Plant Master", desc: "Plants / sites", icon: "🏢", bg: "#DBEAFE" },
  { key: "line", label: "Line Master", desc: "Production lines", icon: "📏", bg: "#D1FAE5" },
  { key: "machine", label: "Machine Master", desc: "Machines", icon: "🛠️", bg: "#FEF3C7" },
];

const ConfigurationModal = ({ onClose, initialMaster = "plant" }) => {
  const [activeMaster, setActiveMaster] = useState(initialMaster);
  const dispatch = useDispatch();

  const plants = useSelector((s) => s.plants);
  const lines = useSelector((s) => s.lines);
  const machines = useSelector((s) => s.machines);

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[300]">
      {/* HEADER — deep indigo, AdminPage ke navy header se jaan-boojh ke alag */}
      <nav className="bg-[#1E1B4B] h-14 flex items-center px-5 gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.25)] fixed top-0 left-0 right-0 z-[100]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#6366F1] rounded-md flex items-center justify-center text-base">⚙️</div>
          <div>
            <div className="text-white text-[16px] font-bold tracking-[-0.2px]">System Configuration</div>
            <div className="text-white/40 text-[11px] font-normal tracking-[0.6px] uppercase">
              Master Data Management
            </div>
          </div>
        </div>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="text-white/[0.85] text-xs font-semibold no-underline py-[7px] px-3.5 rounded-md transition-all duration-150 bg-white/[0.08] border border-white/[0.14] cursor-pointer hover:bg-white/[0.18] hover:text-white"
        >
          ✕ Close
        </button>
      </nav>

      <div className="flex pt-14 h-screen">
        {/* SIDEBAR — card-style entries (icon tile + title + subtitle), picker jaisa hi look */}
        <aside className="w-64 bg-white border-r border-[#E2E8F0] overflow-y-auto py-4 px-2.5 shrink-0">
          <div className="text-[11px] font-bold tracking-wider uppercase text-[#94A3B8] pt-2 px-2.5 pb-2">
            Master Data APIs
          </div>
          {SIDEBAR_ITEMS.map((item) => {
            const active = activeMaster === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveMaster(item.key)}
                className={`w-full flex items-center gap-3 py-2.5 px-2.5 rounded-xl border-none text-left cursor-pointer transition-all duration-150 mb-1 ${
                  active ? "bg-[#EEF2FF]" : "bg-transparent hover:bg-[#F8FAFC]"
                }`}
                style={active ? { boxShadow: "inset 3px 0 0 #6366F1" } : undefined}
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{ background: item.bg }}
                >
                  {item.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <div className={`text-[14px] font-semibold leading-tight ${active ? "text-[#3730A3]" : "text-[#1E293B]"}`}>
                    {item.label}
                  </div>
                  <div className="text-[13px] text-[#94A3B8] mt-0.5 leading-snug">{item.desc}</div>
                </span>
              </button>
            );
          })}
        </aside>

        {/* MAIN — selected master ka CRUD page */}
        <main className="flex-1 pt-7 px-7 pb-10 overflow-y-auto">
          <div className="max-w-[1200px]">
          {activeMaster === "plant" && (
            <MasterCrudPanel
              title="Plant Master"
              description="smartpm_plant_master — sabhi plants ki master list"
              columns={[
                { key: "plant_code", label: "Plant Code" },
                { key: "plant_name", label: "Plant Name" },
              ]}
              fields={[
                { key: "plant_code", label: "Plant Code", placeholder: "e.g. 1", type: "number", required: true },
                { key: "plant_name", label: "Plant Name", placeholder: "e.g. Ambethan-1", type: "text", required: true },
              ]}
              items={plants.items}
              status={plants.status}
              error={plants.error}
              onAdd={(data) => dispatch(addPlant(data))}
              onEdit={(id, data) => dispatch(editPlant(id, data))}
              onDelete={(id) => dispatch(removePlant(id))}
            />
          )}

          {activeMaster === "line" && (
            <MasterCrudPanel
              title="Line Master"
              description="smartpm_line_master — sabhi production lines ki master list"
              columns={[
                { key: "plant_code", label: "Plant Code" },
                { key: "line_name", label: "Line Name" },
              ]}
              fields={[
                { key: "plant_code", label: "Plant Code", placeholder: "e.g. 1", type: "number", required: true },
                { key: "line_name", label: "Line Name", placeholder: "e.g. Forging Line-1", type: "text", required: true },
              ]}
              items={lines.items}
              status={lines.status}
              error={lines.error}
              onAdd={(data) => dispatch(addLine(data))}
              onEdit={(id, data) => dispatch(editLine(id, data))}
              onDelete={(id) => dispatch(removeLine(id))}
            />
          )}

          {activeMaster === "machine" && (
            <MasterCrudPanel
              title="Machine Master"
              description="smartpm_machine_master — sabhi machines ki master list"
              columns={[
                { key: "plant_code", label: "Plant Code" },
                { key: "line_name", label: "Line Name" },
                { key: "machine_name", label: "Machine Name" },
              ]}
              fields={[
                { key: "plant_code", label: "Plant Code", placeholder: "e.g. 1", type: "number", required: true },
                { key: "line_name", label: "Line Name", placeholder: "e.g. Forging Line-1", type: "text", required: true },
                { key: "machine_name", label: "Machine Name", placeholder: "e.g. Induction Furnace-1", type: "text", required: true },
              ]}
              items={machines.items}
              status={machines.status}
              error={machines.error}
              onAdd={(data) => dispatch(addMachine(data))}
              onEdit={(id, data) => dispatch(editMachine(id, data))}
              onDelete={(id) => dispatch(removeMachine(id))}
            />
          )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConfigurationModal;