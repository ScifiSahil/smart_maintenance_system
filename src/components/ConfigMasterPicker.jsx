// components/ConfigMasterPicker.jsx
// Header ke ⚙️ icon pe click karne se ye dropdown-style panel khulta hai,
// top-right corner mein anchor hoke — reference "⚙ CONFIGURATION" panel ke
// style mein (colored icon tile + bold title + grey subtitle + chevron).
// Yahan se master choose karne par full-page ConfigurationModal khulta hai.

const MASTERS = [
  {
    key: "plant",
    label: "Plant Master",
    desc: "Plants / sites ki master list",
    icon: "🏢",
    bg: "#DBEAFE",
  },
  {
    key: "line",
    label: "Line Master",
    desc: "Production lines ki master list",
    icon: "📏",
    bg: "#D1FAE5",
  },
  {
    key: "machine",
    label: "Machine Master",
    desc: "Machines ki master list",
    icon: "🛠️",
    bg: "#FEF3C7",
  },
];

const ConfigMasterPicker = ({ onSelect, onClose, anchor = { top: 60, right: 20 } }) => (
  <div className="fixed inset-0 z-[300]" onClick={onClose}>
    <div
      className="absolute bg-white rounded-2xl w-[300px] shadow-[0_16px_40px_rgba(15,23,42,0.16),0_4px_10px_rgba(15,23,42,0.08)] border border-[#EEF2F6] overflow-hidden"
      style={{ top: anchor.top, right: anchor.right }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 py-3.5 px-4 border-b border-[#F1F5F9]">
        <span className="text-[16px]">⚙️</span>
        <span className="text-[13px] font-bold text-[#64748B] uppercase tracking-[0.6px]">Configuration</span>
      </div>

      <div className="py-1.5">
        {MASTERS.map((m, idx) => (
          <button
            key={m.key}
            className={`w-full flex items-center gap-3.5 py-3 px-4 border-none bg-transparent text-left cursor-pointer transition-colors duration-150 hover:bg-[#F8FAFC] ${
              idx !== MASTERS.length - 1 ? "border-b border-[#F8FAFC]" : ""
            }`}
            onClick={() => onSelect(m.key)}
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: m.bg }}
            >
              {m.icon}
            </span>
            <span className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-[#1E293B] leading-tight">{m.label}</div>
              <div className="text-[13px] text-[#94A3B8] mt-0.5 leading-snug">{m.desc}</div>
            </span>
            <span className="text-[#CBD5E1] text-base shrink-0">›</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default ConfigMasterPicker;