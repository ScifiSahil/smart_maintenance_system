// components/EquipmentCard.jsx
// Renders one equipment row using real cdb response fields
// (equipment_code, equipment_name, plant_code, location, category, pm_status, iiot_status).

const CATEGORY_ICON = {
  rotating: "⚙️",
  static: "🔥",
  electrical: "⚡",
  instrumentation: "📡",
};

const badgeBase =
  "inline-flex items-center gap-1 py-[3px] px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current";

const EquipmentCard = ({ equipment, onEdit, onDelete }) => {
  const {
    equipment_name,
    equipment_code,
    plant_code,
    location,
    category,
    pm_status,
    iiot_status,
    pm_frequency,
    last_pm_date,
  } = equipment;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl py-4 px-[18px] mb-2.5 flex items-center gap-3.5 transition-all duration-150 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.06)] hover:border-[#3B82F6]">
      <div className="w-11 h-11 rounded-[10px] bg-[#F0F7FF] flex items-center justify-center text-xl shrink-0">
        {CATEGORY_ICON[category] || "⚙️"}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-[#0B1F3A]">
          {equipment_name} — {equipment_code}
        </div>
        <div className="text-xs text-[#64748B] mt-0.5">
          Plant {plant_code} · {location || "—"} · Last PM: {last_pm_date || "—"}
        </div>
      </div>
      <div className="flex gap-2 mr-3">
        <span className={`${badgeBase} ${pm_status === "overdue" ? "bg-[#FEF2F2] text-[#991B1B]" : "bg-[#ECFDF5] text-[#065F46]"}`}>
          {pm_status === "overdue" ? "Overdue" : "Active"}
        </span>
        <span className={`${badgeBase} ${iiot_status === "connected" ? "bg-[#EFF6FF] text-[#1E40AF]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
          {iiot_status === "connected" ? "IIoT ●" : "No IIoT"}
        </span>
      </div>
      <div className="flex gap-4 mr-3 text-right">
        <div className="text-[11px] text-[#64748B]">
          <strong className="block text-sm text-[#0B1F3A] font-['Roboto_Mono'] capitalize">
            {pm_frequency || "—"}
          </strong>
          Frequency
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button
          className="inline-flex items-center gap-1 py-[5px] px-2.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#2563EB] hover:bg-[#F0F7FF]"
          onClick={(e) => { e.stopPropagation(); onEdit && onEdit(equipment); }}
        >
          ✏️ Edit
        </button>
        <button
          className="inline-flex items-center gap-1 py-[5px] px-2.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all duration-150 whitespace-nowrap bg-transparent text-[#DC2626] hover:bg-[#FEF2F2]"
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(equipment); }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default EquipmentCard;