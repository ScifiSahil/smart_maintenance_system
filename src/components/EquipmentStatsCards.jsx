// components/EquipmentStatsCards.jsx
// 4 summary tiles — counts derived from the items list (no separate stats API,
// kyunki uska endpoint abhi confirm nahi hua). Pure calculation, no side effects.

const EquipmentStatsCards = ({ items }) => {
  const total = items.length;
  const activePm = items.filter((e) => e.pm_status === "active").length;
  const iiotConnected = items.filter((e) => e.iiot_status === "connected").length;
  const overdue = items.filter((e) => e.pm_status === "overdue").length;
  const plants = new Set(items.map((e) => e.plant_code)).size;

  const cards = [
    { label: "Total Equipment", value: total, sub: `Across ${plants} plants`, color: "#2563EB" },
    { label: "Active PM Plans", value: activePm, sub: total ? `${Math.round((activePm / total) * 100)}% coverage` : "—", color: "#059669" },
    { label: "IIoT Connected", value: iiotConnected, sub: total ? `${Math.round((iiotConnected / total) * 100)}% monitored` : "—", color: "#D97706" },
    { label: "Overdue PM", value: overdue, sub: "Requires attention", color: "#DC2626" },
  ];

  return (
    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] gap-3.5 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-xl py-[18px] px-5">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: c.color }} />
          <div className="text-[13px] font-semibold tracking-wide uppercase text-[#64748B] mb-1.5">{c.label}</div>
          <div className="text-[28px] font-bold text-[#0B1F3A] leading-none" style={{ fontFamily: 'var(--font-mono)' }}>{c.value}</div>
          <div className="text-[13px] text-[#94A3B8] mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};

export default EquipmentStatsCards;