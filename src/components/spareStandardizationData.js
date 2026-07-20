// Static seed data for the Spare Standardization admin tab.
// Plain data — no logic. Imported by SpareStandardization.jsx.

export const PARTS = {
  'SPC-1001': {
    code: 'SPC-1001', name: 'Bearing, Spherical Roller, 6308-2RS-C3', category: 'Mechanical', sub: 'Bearing', uom: 'NOS',
    spec: 'Bore 40mm · OD 90mm · Width 23mm · C3 clearance · 2RS sealed',
    criticality: 'Critical', abc: 'A', status: 'Standardized',
    oem: { make: 'SKF', partNo: '6308-2RS-C3' },
    alternates: [
      { make: 'FAG', partNo: '6308-2RS-C3', note: 'Fit/form/function identical — approved alternate' },
      { make: 'NBC', partNo: '6308-2RS-C3', note: 'Domestic alternate, lower cost, longer lead time' },
    ],
    legacyCodes: ['RJ-BRG-108 (Ranjangaon R1)', 'MW-BRG-0034 (Mundhwa)'],
    vendors: [
      { name: 'SKF India Ltd.', leadTime: '7 days', price: '₹4,200' },
      { name: 'Local Bearing House, Pune', leadTime: '3 days', price: '₹3,650 (NBC alt.)' },
    ],
    stockNorm: { min: 2, max: 10, rol: 4 },
    plantStock: [
      { plant: 'Ranjangaon R1', stock: 4 }, { plant: 'Ranjangaon R2', stock: 6 },
      { plant: 'Mundhwa', stock: 2 }, { plant: 'Baramati', stock: 1 },
    ],
    appliedIn: [
      { plant: 'Ranjangaon R1', machine: 'Forging Press FP-2502' },
      { plant: 'Ranjangaon R2', machine: 'Forging Press (18 lines)' },
      { plant: 'Baramati', machine: 'Forging Press FP-01' },
    ],
    rotable: 'No', insurance: 'No', shelfLife: '5 yrs (grease-packed, dry store)', hsn: '8482',
    bom: { machine: 'Forging Press', assembly: 'Main Drive & Flywheel', sub: 'Flywheel Assembly', component: 'Flywheel Bearing Housing' },
  },
  'SPC-1002': {
    code: 'SPC-1002', name: 'Contactor, 3-Pole, 63A, AC-3 Duty', category: 'Electrical', sub: 'Contactor', uom: 'NOS',
    spec: '3-Pole · 63A AC-3 · 230V AC coil · Auxiliary contact 1NO+1NC',
    criticality: 'Critical', abc: 'A', status: 'Standardized',
    oem: { make: 'Schneider Electric', partNo: 'LC1D65M7' },
    alternates: [
      { make: 'Siemens', partNo: '3RT1046-1AP04', note: 'Equivalent rating, mounting differs — verify panel clearance' },
      { make: 'L&T', partNo: 'MNX2-63', note: 'Domestic alternate' },
    ],
    legacyCodes: ['RJ-ELEC-221 (Ranjangaon R1)'],
    vendors: [
      { name: 'Schneider Electric India', leadTime: '10 days', price: '₹3,100' },
      { name: 'Automation Spares, Pune', leadTime: '2 days', price: '₹2,850 (Siemens alt.)' },
    ],
    stockNorm: { min: 1, max: 4, rol: 2 },
    plantStock: [{ plant: 'Ranjangaon R1', stock: 1 }, { plant: 'Ranjangaon R2', stock: 2 }, { plant: 'Baramati', stock: 0 }],
    appliedIn: [
      { plant: 'Ranjangaon R1', machine: 'Forging Press FP-2502 (Main Motor)' },
      { plant: 'Ranjangaon R1', machine: 'Trimming Press TP-2502 (Main Motor)' },
      { plant: 'Ranjangaon R2', machine: 'Induction Heater panels' },
    ],
    rotable: 'No', insurance: 'No', shelfLife: '—', hsn: '8536',
    bom: { machine: 'Forging Press / Trimming Press', assembly: 'Main Drive', sub: 'Motor Control Panel', component: 'Main Motor Contactor' },
  },
  'SPC-1003': {
    code: 'SPC-1003', name: 'Mechanical Seal, Cartridge Type, 45mm Shaft', category: 'Mechanical', sub: 'Seal', uom: 'NOS',
    spec: '45mm shaft · Carbon vs SiC faces · Viton O-ring · Max 100°C',
    criticality: 'Essential', abc: 'B', status: 'Standardized',
    oem: { make: 'John Crane', partNo: 'JC-5610-45' },
    alternates: [{ make: 'Flowserve', partNo: 'ISC2-45', note: 'Approved equivalent' }],
    legacyCodes: [],
    vendors: [{ name: 'John Crane India', leadTime: '14 days', price: '₹8,900' }],
    stockNorm: { min: 1, max: 3, rol: 1 },
    plantStock: [{ plant: 'Ranjangaon R1', stock: 1 }, { plant: 'Ranjangaon R2', stock: 1 }],
    appliedIn: [{ plant: 'Ranjangaon R1', machine: 'Coolant Pump — Circular Saw' }],
    rotable: 'Yes (send for reconditioning after removal)', insurance: 'No', shelfLife: '2 yrs (elastomer ageing)', hsn: '8484',
    bom: { machine: 'Circular Saw', assembly: 'Coolant System', sub: 'Pump Assembly', component: 'Pump Shaft Seal' },
  },
  'SPC-1004': {
    code: 'SPC-1004', name: 'Hydraulic Oil, ISO VG 68', category: 'Consumable', sub: 'Lubricant', uom: 'LTR',
    spec: 'ISO VG 68 · Anti-wear hydraulic oil · Pour point -6°C',
    criticality: 'Essential', abc: 'A', status: 'Standardized',
    oem: { make: 'Shell', partNo: 'Tellus S2 M68' },
    alternates: [{ make: 'Servo (IOCL)', partNo: 'Servo System HLP 68', note: 'PSU alternate — same spec, easier local procurement' }],
    legacyCodes: ['RJ-OIL-VG68 (Ranjangaon R1)', 'MW-LUB-011 (Mundhwa)', 'R2-OIL-068 (Ranjangaon R2)'],
    vendors: [
      { name: 'Shell Lubricants India', leadTime: '5 days', price: '₹210/ltr' },
      { name: 'IOCL Distributor', leadTime: '2 days', price: '₹185/ltr' },
    ],
    stockNorm: { min: 100, max: 500, rol: 200 },
    plantStock: [
      { plant: 'Ranjangaon R1', stock: 220 }, { plant: 'Ranjangaon R2', stock: 340 },
      { plant: 'Mundhwa', stock: 80 }, { plant: 'Baramati', stock: 60 },
    ],
    appliedIn: [
      { plant: 'Ranjangaon R1', machine: 'Forging Press FP-2502 hydraulics' },
      { plant: 'Ranjangaon R2', machine: 'Forging Press (18 lines)' },
      { plant: 'Mundhwa', machine: 'Compressor COM-302' },
    ],
    rotable: 'No', insurance: 'No', shelfLife: '3 yrs sealed drum', hsn: '2710',
    bom: { machine: 'Forging Press', assembly: 'Hydraulic Overload Protection', sub: 'Reservoir & Filtration', component: 'Oil Reservoir' },
  },
  'SPC-1005': {
    code: 'SPC-1005', name: 'V-Belt Set, Classical C-Section, 3550mm (Set of 6)', category: 'Mechanical', sub: 'Belt', uom: 'SET',
    spec: 'C-Section · 3550mm effective length · Matched set — replace as set only',
    criticality: 'Essential', abc: 'B', status: 'Standardized',
    oem: { make: 'Fenner', partNo: 'C140-SET6' },
    alternates: [{ make: 'Gates', partNo: 'C140', note: 'Individually approved, must still be replaced as a matched set' }],
    legacyCodes: [],
    vendors: [{ name: 'Fenner India', leadTime: '12 days', price: '₹5,400/set' }],
    stockNorm: { min: 1, max: 3, rol: 1 },
    plantStock: [{ plant: 'Ranjangaon R1', stock: 1 }, { plant: 'Ranjangaon R2', stock: 2 }],
    appliedIn: [{ plant: 'Ranjangaon R1', machine: 'Forging Press FP-2502 main drive' }],
    rotable: 'No', insurance: 'No', shelfLife: '4 yrs (rubber, store away from heat/UV)', hsn: '4010',
    bom: { machine: 'Forging Press', assembly: 'Main Drive & Flywheel', sub: 'Flywheel Assembly', component: 'Drive Belt System' },
  },
  'SPC-1006': {
    code: 'SPC-1006', name: 'Sensor, Inductive Proximity, M18 PNP-NO, 8mm Sensing', category: 'Electrical', sub: 'Sensor', uom: 'NOS',
    spec: 'M18 barrel · PNP NO · 8mm sensing distance · IP67 · 10-30V DC',
    criticality: 'Critical', abc: 'A', status: 'Standardized',
    oem: { make: 'Pepperl+Fuchs', partNo: 'NBB8-18GM50-E2' },
    alternates: [
      { make: 'Balluff', partNo: 'BES M18MI', note: 'Approved equivalent' },
      { make: 'Omron', partNo: 'E2E-X8MD1', note: 'Approved equivalent, different cable gland thread' },
    ],
    legacyCodes: ['R2-SENS-22 (Ranjangaon R2)', 'BRT-SEN-04 (Baramati)'],
    vendors: [
      { name: 'Pepperl+Fuchs India', leadTime: '8 days', price: '₹1,850' },
      { name: 'Balluff India', leadTime: '6 days', price: '₹1,650' },
    ],
    stockNorm: { min: 3, max: 12, rol: 6 },
    plantStock: [{ plant: 'Ranjangaon R1', stock: 5 }, { plant: 'Ranjangaon R2', stock: 4 }, { plant: 'Baramati', stock: 2 }],
    appliedIn: [
      { plant: 'Ranjangaon R1', machine: 'Robotic Arm RA-2502 — Safety Door' },
      { plant: 'Ranjangaon R1', machine: 'Trimming Press TP-2502 — Safety Gate' },
      { plant: 'Ranjangaon R2', machine: 'Circular Saw — Blade Guard' },
    ],
    rotable: 'No', insurance: 'No', shelfLife: '—', hsn: '8536',
    bom: { machine: 'Robotic Arm / Trimming Press', assembly: 'Controller & Safety System', sub: 'Safety I/O', component: 'Door / Gate Interlock Sensor' },
  },
  'SPC-1007': {
    code: 'SPC-1007', name: 'Encoder Backup Battery, 3.6V Lithium', category: 'Electrical', sub: 'Battery', uom: 'NOS',
    spec: '3.6V Lithium Thionyl Chloride · KR C4 controller compatible',
    criticality: 'Essential', abc: 'C', status: 'Standardized',
    oem: { make: 'KUKA', partNo: 'KUKA-BAT-0001' },
    alternates: [{ make: 'Saft', partNo: 'LS14500', note: 'Cell-level equivalent — verify connector' }],
    legacyCodes: [],
    vendors: [{ name: 'KUKA Robotics India', leadTime: '15 days', price: '₹1,100' }],
    stockNorm: { min: 2, max: 8, rol: 4 },
    plantStock: [{ plant: 'Ranjangaon R1', stock: 3 }, { plant: 'Ranjangaon R2', stock: 5 }],
    appliedIn: [
      { plant: 'Ranjangaon R1', machine: 'Robotic Arm RA-2502' },
      { plant: 'Ranjangaon R2', machine: 'Robotic Arm (all lines)' },
    ],
    rotable: 'No', insurance: 'No', shelfLife: '3 yrs', hsn: '8507',
    bom: { machine: 'Robotic Arm', assembly: 'Axes & Joint Drives', sub: 'Encoder System', component: 'Encoder Battery Pack' },
  },
  'SPC-1008': {
    code: 'SPC-1008', name: 'Servo Gearbox, Axis-1, KR240 R2900', category: 'Mechanical', sub: 'Gearbox', uom: 'NOS',
    spec: 'Axis-1 RV reducer · Ratio per KUKA KR240 R2900 ultra spec · Backlash < 0.08mm new',
    criticality: 'Critical', abc: 'A', status: 'Standardized',
    oem: { make: 'KUKA (Nabtesco RV)', partNo: 'KUKA-GBX-A1-240' },
    alternates: [],
    legacyCodes: [],
    vendors: [{ name: 'KUKA Robotics India', leadTime: '45 days', price: '₹2,85,000' }],
    stockNorm: { min: 0, max: 1, rol: 0 },
    plantStock: [{ plant: 'Ranjangaon R1', stock: 0 }, { plant: 'Ranjangaon R2', stock: 1 }],
    appliedIn: [
      { plant: 'Ranjangaon R1', machine: 'Robotic Arm RA-2502' },
      { plant: 'Ranjangaon R2', machine: 'Robotic Arm (all lines)' },
    ],
    rotable: 'Yes (exchange with OEM repair program)', insurance: 'Yes — high value, long lead time',
    shelfLife: '5 yrs sealed (rotate grease before install if > 2 yrs)', hsn: '8483',
    bom: { machine: 'Robotic Arm', assembly: 'Axes & Joint Drives', sub: 'Axis 1 Drive', component: 'Axis-1 Gearbox' },
  },
  'SPC-1009': {
    code: 'SPC-1009', name: 'Pressure Relief Valve, 175 Bar Set Point', category: 'Hydraulic', sub: 'Valve', uom: 'NOS',
    spec: 'Direct-acting relief valve · Cracking pressure 175±5 Bar · 3/4" BSP port',
    criticality: 'Critical', abc: 'B', status: 'Standardized',
    oem: { make: 'Bosch Rexroth', partNo: 'DBD-6-175' },
    alternates: [{ make: 'Parker', partNo: 'RD-Series-175', note: 'Approved equivalent' }],
    legacyCodes: [],
    vendors: [{ name: 'Bosch Rexroth India', leadTime: '10 days', price: '₹14,500' }],
    stockNorm: { min: 1, max: 2, rol: 1 },
    plantStock: [{ plant: 'Ranjangaon R1', stock: 1 }, { plant: 'Ranjangaon R2', stock: 1 }],
    appliedIn: [{ plant: 'Ranjangaon R1', machine: 'Forging Press FP-2502' }],
    rotable: 'No', insurance: 'No', shelfLife: '—', hsn: '8481',
    bom: { machine: 'Forging Press', assembly: 'Hydraulic Overload Protection', sub: 'Pressure Control', component: 'Relief Valve Assembly' },
  },
  'SPC-1010': {
    code: 'SPC-1010', name: 'Die Clamp Bolt, M36 x 150, Gr 10.9', category: 'Mechanical', sub: 'Fastener', uom: 'NOS',
    spec: 'M36 x 150mm · Property class 10.9 · Torque to 280 Nm',
    criticality: 'Essential', abc: 'C', status: 'Standardized',
    oem: { make: 'Unbrako', partNo: 'M36X150-109' },
    alternates: [],
    legacyCodes: [],
    vendors: [{ name: 'Unbrako Fasteners', leadTime: '5 days', price: '₹380' }],
    stockNorm: { min: 8, max: 20, rol: 12 },
    plantStock: [{ plant: 'Ranjangaon R1', stock: 12 }, { plant: 'Ranjangaon R2', stock: 16 }],
    appliedIn: [{ plant: 'Ranjangaon R1', machine: 'Trimming Press TP-2502' }],
    rotable: 'No', insurance: 'No', shelfLife: '—', hsn: '7318',
    bom: { machine: 'Trimming Press', assembly: 'Die Clamp & Safety Gate', sub: 'Die Clamping', component: 'Clamp Bolt Set' },
  },
};


export const HIER = [
  { id: 'fp', name: 'Forging Press', icon: '🔨', assemblies: [
    { name: 'Main Drive & Flywheel', subs: [
      { name: 'Flywheel Assembly', comps: [
        { name: 'Flywheel Bearing Housing', parts: ['SPC-1001'] },
        { name: 'Drive Belt System', parts: ['SPC-1005'] },
      ] },
      { name: 'Motor Control Panel', comps: [
        { name: 'Main Motor Contactor', parts: ['SPC-1002'] },
      ] },
    ] },
    { name: 'Hydraulic Overload Protection', subs: [
      { name: 'Pressure Control', comps: [
        { name: 'Relief Valve Assembly', parts: ['SPC-1009'] },
      ] },
      { name: 'Reservoir & Filtration', comps: [
        { name: 'Oil Reservoir', parts: ['SPC-1004'] },
      ] },
    ] },
  ] },
  { id: 'ra', name: 'Robotic Arm', icon: '🤖', assemblies: [
    { name: 'Axes & Joint Drives', subs: [
      { name: 'Axis 1 Drive', comps: [{ name: 'Axis-1 Gearbox', parts: ['SPC-1008'] }] },
      { name: 'Encoder System', comps: [{ name: 'Encoder Battery Pack', parts: ['SPC-1007'] }] },
    ] },
    { name: 'Controller & Safety System', subs: [
      { name: 'Safety I/O', comps: [{ name: 'Door Interlock Sensor', parts: ['SPC-1006'] }] },
    ] },
  ] },
  { id: 'tp', name: 'Trimming Press', icon: '✂️', assemblies: [
    { name: 'Main Drive', subs: [
      { name: 'Motor Control Panel', comps: [{ name: 'Main Motor Contactor', parts: ['SPC-1002'] }] },
    ] },
    { name: 'Die Clamp & Safety Gate', subs: [
      { name: 'Die Clamping', comps: [{ name: 'Clamp Bolt Set', parts: ['SPC-1010'] }] },
      { name: 'Safety Gate Interlock', comps: [{ name: 'Gate Sensor', parts: ['SPC-1006'] }] },
    ] },
  ] },
  { id: 'saw', name: 'Circular Saw', icon: '🪚', assemblies: [
    { name: 'Coolant System', subs: [
      { name: 'Pump Assembly', comps: [{ name: 'Pump Shaft Seal', parts: ['SPC-1003'] }] },
    ] },
  ] },
];

export const DUPLICATES = [
  {
    target: 'SPC-1001', targetName: 'Bearing, Spherical Roller, 6308-2RS-C3',
    legacy: [
      { plant: 'Ranjangaon R1', code: 'RJ-BRG-108', desc: 'Bearing 6308' },
      { plant: 'Mundhwa', code: 'MW-BRG-0034', desc: 'SKF Brg 6308 2RS' },
      { plant: 'Baramati', code: 'BRT-BEAR-19', desc: 'Ball brg 6308' },
    ],
    saving: '₹38,000 stock unlock + eliminates 2 duplicate purchase lines',
  },
  {
    target: 'SPC-1006', targetName: 'Sensor, Inductive Proximity, M18 PNP-NO',
    legacy: [
      { plant: 'Ranjangaon R2', code: 'R2-SENS-22', desc: 'Inductive sensor M18 PNP' },
      { plant: 'Baramati', code: 'BRT-SEN-04', desc: 'Prox switch 18mm' },
    ],
    saving: '₹11,000 stock unlock + common vendor rate contract',
  },
  {
    target: 'SPC-1004', targetName: 'Hydraulic Oil, ISO VG 68',
    legacy: [
      { plant: 'Ranjangaon R1', code: 'RJ-OIL-VG68', desc: 'Hyd oil VG68' },
      { plant: 'Mundhwa', code: 'MW-LUB-011', desc: 'Hydraulic oil 68 grade' },
      { plant: 'Ranjangaon R2', code: 'R2-OIL-068', desc: 'ISO 68 oil' },
    ],
    saving: '₹1,10,000 volume-consolidated annual rate contract',
  },
];


export const MASTER_CATALOG = [
  // ── Converted from OEM Spare Part Master ──
  { code: 'SPC-1001', component: 'Forging Press', sub: 'Flywheel Bearing Housing', fn: 'Flywheel rotational support', existingMat: '—', proposedMat: 'SKF 6308-2RS-C3 (Spherical Roller class)', hardness: '—', surface: '—', opTemp: '<95°C', load: 'Dynamic radial', lube: 'ISO VG 220 / Grease', inspFreq: 'Monthly', wearLimit: 'Vibration >7 mm/s', replCriteria: 'Replace on vibration/temp trend', remarks: 'Merged from RJ-BRG-108, MW-BRG-0034', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Bearings', remark: 'Bin B-14' } },
  { code: 'SPC-1002', component: 'Forging Press / Trimming Press', sub: 'Main Motor Contactor', fn: 'Motor switching', existingMat: '—', proposedMat: 'Schneider LC1D65M7', hardness: '—', surface: '—', opTemp: 'Ambient (panel)', load: 'Electrical AC-3', lube: '—', inspFreq: 'Quarterly', wearLimit: 'Contact pitting', replCriteria: 'Replace on contact wear/failure', remarks: 'Standard across Forging & Trimming panels', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Electricals', remark: 'Panel spares rack' } },
  { code: 'SPC-1003', component: 'Circular Saw', sub: 'Pump Shaft Seal', fn: 'Coolant pump sealing', existingMat: '—', proposedMat: 'John Crane JC-5610-45', hardness: '—', surface: '—', opTemp: '<100°C', load: 'Rotary seal', lube: '—', inspFreq: 'Monthly', wearLimit: 'Leakage', replCriteria: 'Replace on leakage', remarks: 'Rotable — recondition after removal', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R1', subStore: null, remark: 'Near pump repair bay' } },
  { code: 'SPC-1004', component: 'Forging Press', sub: 'Oil Reservoir', fn: 'Hydraulic power transmission', existingMat: '—', proposedMat: 'Shell Tellus S2 M68', hardness: '—', surface: '—', opTemp: '40-80°C', load: 'Continuous duty', lube: 'Self', inspFreq: 'Monthly', wearLimit: 'NAS>9 contamination', replCriteria: 'Flush & change', remarks: 'Merged 3 plant-local codes', loc: { category: 'Main Store', plant: 'Ranjangaon R2', subStore: null, remark: 'Drum storage — Oil Room R3' } },
  { code: 'SPC-1005', component: 'Forging Press', sub: 'Drive Belt System', fn: 'Power transmission to flywheel', existingMat: '—', proposedMat: 'Fenner C140 Set of 6', hardness: '—', surface: '—', opTemp: 'Ambient', load: 'Shock/cyclic', lube: '—', inspFreq: 'Weekly visual', wearLimit: 'Cracking/glazing', replCriteria: 'Replace as set', remarks: 'Never replace individually', loc: { category: 'Main Store', plant: 'Ranjangaon R2', subStore: null, remark: 'Belt rack — shaded, dry' } },
  { code: 'SPC-1006', component: 'Robotic Arm / Trimming Press', sub: 'Door/Gate Interlock Sensor', fn: 'Safety interlock feedback', existingMat: '—', proposedMat: 'Pepperl+Fuchs NBB8-18GM50-E2', hardness: '—', surface: '—', opTemp: '-25 to 80°C', load: 'Electrical', lube: '—', inspFreq: 'Monthly', wearLimit: 'Signal fault', replCriteria: 'Replace on fault', remarks: 'Merged R2-SENS-22, BRT-SEN-04', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Electronics', remark: 'ESD safe bin' } },
  { code: 'SPC-1007', component: 'Robotic Arm', sub: 'Encoder Battery Pack', fn: 'Position memory backup', existingMat: '—', proposedMat: 'KUKA-BAT-0001 (3.6V Li)', hardness: '—', surface: '—', opTemp: 'Ambient', load: 'Standby', lube: '—', inspFreq: 'Monthly (backup log)', wearLimit: 'Voltage <3.4V', replCriteria: 'Replace on low voltage', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Electronics', remark: 'ESD safe bin' } },
  { code: 'SPC-1008', component: 'Robotic Arm', sub: 'Axis-1 Gearbox', fn: 'Precision speed reduction', existingMat: '—', proposedMat: 'KUKA/Nabtesco RV reducer', hardness: '—', surface: '—', opTemp: 'Ambient', load: 'Dynamic precision', lube: 'Shell Tivela S320', inspFreq: 'Quarterly backlash check', wearLimit: 'Backlash >0.08mm', replCriteria: 'Exchange via OEM repair', remarks: 'Insurance spare — high value', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R2', subStore: null, remark: 'Insurance Spares Cage — approval req.' } },
  { code: 'SPC-1009', component: 'Forging Press', sub: 'Relief Valve Assembly', fn: 'Overload protection', existingMat: '—', proposedMat: 'Bosch Rexroth DBD-6-175', hardness: '—', surface: '—', opTemp: '40-80°C', load: 'Hydraulic pressure', lube: 'ISO VG68 oil', inspFreq: 'Monthly', wearLimit: 'Pressure drift', replCriteria: 'Replace on failed crack test', remarks: 'Do not adjust setting', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R1', subStore: null, remark: 'Hydraulics repair bay' } },
  { code: 'SPC-1010', component: 'Trimming Press', sub: 'Clamp Bolt Set', fn: 'Die holding', existingMat: '—', proposedMat: 'Unbrako M36x150 Gr10.9', hardness: '—', surface: '—', opTemp: 'Ambient', load: 'Tensile', lube: '—', inspFreq: 'Every die change (torque check)', wearLimit: 'Thread damage', replCriteria: 'Replace on damage', remarks: 'Torque to 280 Nm', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: null, remark: 'Fasteners bin F-02' } },

  // ── Merged from Component/Material Standardization Sheet ──
  { code: 'SPC-2001', component: 'RAM', sub: 'Guide Surface', fn: 'Vertical sliding guidance', existingMat: '—', proposedMat: 'EN-GJL-300 + Turcite', hardness: '220-250 HB', surface: 'PTFE/Turcite Liner', opTemp: '40-70°C', load: 'Impact + Sliding', lube: 'ISO VG 220', inspFreq: 'Monthly', wearLimit: '0.30 mm', replCriteria: '>0.30 mm wear', remarks: 'Standard for all presses', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R1', subStore: null, remark: 'Liner kit stocked as service item' } },
  { code: 'SPC-2002', component: 'Clutch', sub: 'Clutch Plate', fn: 'Torque transmission', existingMat: '—', proposedMat: 'Non-asbestos friction composite', hardness: '85-95 Shore D', surface: 'Heat resistant coating', opTemp: '80-150°C', load: 'Cyclic friction', lube: 'Dry', inspFreq: 'Weekly', wearLimit: '25% thickness loss', replCriteria: 'Replace at limit', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Friction Parts', remark: 'FIFO — check heat-pack date' } },
  { code: 'SPC-2003', component: 'Brake', sub: 'Brake Plate', fn: 'Press stopping', existingMat: '—', proposedMat: 'Ceramic friction composite', hardness: '90-100 Shore D', surface: 'Heat resistant coating', opTemp: '100-180°C', load: 'Dynamic braking', lube: 'Dry', inspFreq: 'Weekly', wearLimit: '20% wear', replCriteria: 'Replace at limit', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Friction Parts', remark: 'Paired with clutch plate change' } },
  { code: 'SPC-2004', component: 'Guide System', sub: 'Guide Liner', fn: 'Ram guidance', existingMat: '—', proposedMat: 'SAE660 Bronze / Turcite', hardness: '70-90 HB', surface: 'PTFE', opTemp: '40-80°C', load: 'Sliding + Impact', lube: 'NLGI-2 Grease', inspFreq: 'Monthly', wearLimit: '0.25 mm', replCriteria: 'Replace above limit', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R2', subStore: null, remark: 'Kept near line for quick swap' } },
  { code: 'SPC-2005', component: 'Connecting Rod', sub: 'Big End', fn: 'Force transmission', existingMat: '—', proposedMat: '42CrMo4 QT', hardness: '280-320 HB', surface: 'Shot peening', opTemp: '40-90°C', load: 'Cyclic fatigue', lube: 'Oil Splash', inspFreq: 'Quarterly', wearLimit: 'Crack not allowed', replCriteria: 'Immediate replacement', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Insurance Spares Cage', remark: 'High value — approval needed to issue' } },
  { code: 'SPC-2006', component: 'Bush', sub: 'Connecting Rod Bush', fn: 'Oscillating support', existingMat: '—', proposedMat: 'SAE660 Bronze', hardness: '65-75 HB', surface: 'Graphite plug optional', opTemp: '40-90°C', load: 'Oscillating load', lube: 'EP Grease', inspFreq: 'Monthly', wearLimit: '0.15 mm clearance', replCriteria: 'Replace', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Mundhwa', subStore: null, remark: '—' } },
  { code: 'SPC-2007', component: 'Bearing', sub: 'Main Bearing', fn: 'Rotational support', existingMat: '—', proposedMat: 'Spherical Roller Bearing 222 Series (OEM)', hardness: 'OEM', surface: 'OEM', opTemp: '<95°C', load: 'Dynamic radial load', lube: 'ISO VG 220', inspFreq: 'Monthly', wearLimit: 'Vibration >7 mm/s', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R2', subStore: null, remark: 'Long lead time — maintain 1 nos buffer' } },
  { code: 'SPC-2008', component: 'Crankshaft', sub: 'Main Journal', fn: 'Power transmission', existingMat: '—', proposedMat: '42CrMo4 QT', hardness: '280-320 HB', surface: 'Induction Hardening', opTemp: '40-90°C', load: 'Alternating bending', lube: 'Oil circulation', inspFreq: 'Quarterly', wearLimit: 'Crack not allowed', replCriteria: 'Immediate replacement', remarks: '—', loc: { category: 'Plant Floor', plant: 'Ranjangaon R1', subStore: null, remark: 'Not stocked — OEM reconditioning only' } },
  { code: 'SPC-2009', component: 'Flywheel', sub: 'Bore and Keyway', fn: 'Energy storage', existingMat: '—', proposedMat: 'FG260 / Cast Steel', hardness: '200-240 HB', surface: 'Dynamic balancing', opTemp: 'Ambient', load: 'Rotational', lube: 'None', inspFreq: 'Half yearly', wearLimit: 'Keyway wear 0.2 mm', replCriteria: 'Repair/replace', remarks: '—', loc: { category: 'Plant Floor', plant: 'Ranjangaon R1', subStore: null, remark: 'Not a stock item — site machining/repair' } },
  { code: 'SPC-2010', component: 'Main Gear', sub: 'Gear Teeth', fn: 'Speed reduction', existingMat: '—', proposedMat: '18CrNiMo7-6', hardness: '58-62 HRC', surface: 'Carburized and Ground', opTemp: '50-80°C', load: 'Shock load', lube: 'ISO VG 320', inspFreq: 'Monthly', wearLimit: 'Pitting 10%', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R2', subStore: null, remark: 'Matched set with pinion — order together' } },
  { code: 'SPC-2011', component: 'Pinion Gear', sub: 'Teeth', fn: 'Power transmission', existingMat: '—', proposedMat: '18CrNiMo7-6', hardness: '58-62 HRC', surface: 'Carburized', opTemp: '50-80°C', load: 'Shock load', lube: 'ISO VG 320', inspFreq: 'Monthly', wearLimit: 'Pitting 10%', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R2', subStore: null, remark: 'Matched set with main gear' } },
  { code: 'SPC-2012', component: 'Eccentric Shaft', sub: 'Eccentric Journal', fn: 'Stroke generation', existingMat: '—', proposedMat: '42CrMo4 QT', hardness: '280-320 HB', surface: 'Induction hardened', opTemp: '40-90°C', load: 'Alternating load', lube: 'Oil circulation', inspFreq: 'Quarterly', wearLimit: 'Crack not allowed', replCriteria: 'Replace immediately', remarks: '—', loc: { category: 'Plant Floor', plant: 'Baramati', subStore: null, remark: 'OEM reconditioning only' } },
  { code: 'SPC-2013', component: 'Crown Bearing', sub: 'Roller Bearing', fn: 'Shaft support', existingMat: '—', proposedMat: 'SKF/FAG Standard (OEM)', hardness: 'OEM', surface: 'OEM', opTemp: '<95°C', load: 'Dynamic load', lube: 'Oil circulation', inspFreq: 'Monthly', wearLimit: 'Vibration >7 mm/s', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Bearings', remark: 'Critical spare — shelf stored' } },
  { code: 'SPC-2014', component: 'Pitman', sub: 'Body', fn: 'Force transmission', existingMat: '—', proposedMat: 'Forged Alloy Steel', hardness: '280-320 HB', surface: 'Shot peening', opTemp: 'Ambient', load: 'Compression load', lube: 'Oil splash', inspFreq: 'Quarterly', wearLimit: 'Crack not allowed', replCriteria: 'Replace', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Mundhwa', subStore: null, remark: '—' } },
  { code: 'SPC-2015', component: 'Slide Adjustment Screw', sub: 'Threads', fn: 'Shut height adjustment', existingMat: '—', proposedMat: 'EN24', hardness: '32-36 HRC', surface: 'Nitriding', opTemp: '40-70°C', load: 'Static load', lube: 'EP Grease', inspFreq: 'Quarterly', wearLimit: 'Backlash >0.5 mm', replCriteria: 'Replace', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R1', subStore: null, remark: 'Check backlash before issue' } },
  { code: 'SPC-2016', component: 'Slide Nut', sub: 'Nut', fn: 'Height adjustment', existingMat: '—', proposedMat: 'Phosphor Bronze', hardness: '90-110 HB', surface: 'None', opTemp: '40-70°C', load: 'Static load', lube: 'Grease', inspFreq: 'Quarterly', wearLimit: 'Backlash >0.5 mm', replCriteria: 'Replace', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R1', subStore: null, remark: '—' } },
  { code: 'SPC-2017', component: 'Counterbalance Cylinder', sub: 'Rod', fn: 'Balance ram weight', existingMat: '—', proposedMat: 'Hard Chrome Steel', hardness: '50-55 HRC', surface: 'Hard Chrome', opTemp: 'Ambient', load: 'Cyclic load', lube: 'Pneumatic oil', inspFreq: 'Monthly', wearLimit: 'Seal leakage', replCriteria: 'Replace seals', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R2', subStore: null, remark: '—' } },
  { code: 'SPC-2018', component: 'Counterbalance Cylinder', sub: 'Seal Kit', fn: 'Air sealing', existingMat: '—', proposedMat: 'NBR/Viton (OEM)', hardness: 'OEM', surface: 'None', opTemp: '20-80°C', load: 'Pneumatic', lube: 'Pneumatic oil', inspFreq: 'Monthly', wearLimit: 'Leakage', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Seals & Gaskets', remark: '—' } },
  { code: 'SPC-2019', component: 'Pneumatic Clutch', sub: 'Piston Seal', fn: 'Clutch actuation', existingMat: '—', proposedMat: 'NBR/Viton (OEM)', hardness: 'OEM', surface: 'None', opTemp: '20-80°C', load: 'Pneumatic', lube: 'Pneumatic oil', inspFreq: 'Monthly', wearLimit: 'Leakage', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Seals & Gaskets', remark: '—' } },
  { code: 'SPC-2020', component: 'Brake Cylinder', sub: 'Piston Seal', fn: 'Brake actuation', existingMat: '—', proposedMat: 'NBR/Viton (OEM)', hardness: 'OEM', surface: 'None', opTemp: '20-80°C', load: 'Pneumatic', lube: 'Pneumatic oil', inspFreq: 'Monthly', wearLimit: 'Leakage', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Seals & Gaskets', remark: '—' } },
  { code: 'SPC-2021', component: 'Tie Rod', sub: 'Rod', fn: 'Frame integrity', existingMat: '—', proposedMat: 'EN24', hardness: '280-320 HB', surface: 'Shot peening', opTemp: 'Ambient', load: 'Tensile load', lube: 'None', inspFreq: 'Yearly', wearLimit: 'Crack not allowed', replCriteria: 'Replace', remarks: '—', loc: { category: 'Plant Floor', plant: 'Baramati', subStore: null, remark: 'Structural — inspect only, replace on failure' } },
  { code: 'SPC-2022', component: 'Frame', sub: 'Upright/Crown', fn: 'Structural support', existingMat: '—', proposedMat: 'Cast Steel GS52', hardness: '180-220 HB', surface: 'Stress relieved', opTemp: 'Ambient', load: 'Static + Dynamic', lube: 'None', inspFreq: 'Yearly', wearLimit: 'Crack not allowed', replCriteria: 'Repair/replace', remarks: '—', loc: { category: 'Plant Floor', plant: 'Ranjangaon R2', subStore: null, remark: 'Not stocked — major repair job' } },
  { code: 'SPC-2023', component: 'Lubrication System', sub: 'Pump', fn: 'Oil circulation', existingMat: '—', proposedMat: 'CI Body (OEM)', hardness: 'OEM', surface: 'None', opTemp: '40-80°C', load: 'Continuous duty', lube: 'ISO VG 220', inspFreq: 'Monthly', wearLimit: 'Flow reduction 20%', replCriteria: 'Replace', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R2', subStore: null, remark: '—' } },
  { code: 'SPC-2024', component: 'Lubrication System', sub: 'Filter', fn: 'Oil cleaning', existingMat: '—', proposedMat: 'Cellulose/Microglass (OEM)', hardness: 'OEM', surface: 'None', opTemp: '40-80°C', load: 'Continuous duty', lube: 'Oil', inspFreq: 'Monthly', wearLimit: 'DP high', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R2', subStore: null, remark: 'Fast-moving consumable' } },
  { code: 'SPC-2025', component: 'Hydraulic Overload Protector', sub: 'Cylinder', fn: 'Overload protection', existingMat: '—', proposedMat: 'Alloy Steel', hardness: '280-320 HB', surface: 'Honed', opTemp: '40-80°C', load: 'Hydraulic pressure', lube: 'ISO VG 68', inspFreq: 'Monthly', wearLimit: 'Pressure drop', replCriteria: 'Repair', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R1', subStore: null, remark: '—' } },
  { code: 'SPC-2026', component: 'Hydraulic Overload Protector', sub: 'Seal Kit', fn: 'Hydraulic sealing', existingMat: '—', proposedMat: 'NBR/Viton (OEM)', hardness: 'OEM', surface: 'None', opTemp: '40-80°C', load: 'Hydraulic', lube: 'ISO VG 68', inspFreq: 'Monthly', wearLimit: 'Leakage', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Seals & Gaskets', remark: '—' } },
  { code: 'SPC-2027', component: 'Knockout System', sub: 'Knockout Pin', fn: 'Component ejection', existingMat: '—', proposedMat: 'EN31', hardness: '58-60 HRC', surface: 'Through hardened', opTemp: 'Ambient', load: 'Impact load', lube: 'Grease', inspFreq: 'Monthly', wearLimit: 'Wear >0.3 mm', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Mundhwa', subStore: null, remark: '—' } },
  { code: 'SPC-2028', component: 'Die Cushion', sub: 'Cushion Cylinder', fn: 'Bottom support', existingMat: '—', proposedMat: 'Alloy Steel', hardness: '280-320 HB', surface: 'Honed', opTemp: 'Ambient', load: 'Cyclic hydraulic load', lube: 'Hydraulic Oil ISO VG 46', inspFreq: 'Monthly', wearLimit: 'Leakage', replCriteria: 'Repair', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Baramati', subStore: null, remark: '—' } },
  { code: 'SPC-2029', component: 'Slide Gib', sub: 'Wear Surface', fn: 'Alignment', existingMat: '—', proposedMat: 'SAE660 Bronze/Turcite', hardness: '70-90 HB', surface: 'PTFE', opTemp: 'Ambient', load: 'Sliding', lube: 'Grease', inspFreq: 'Monthly', wearLimit: '0.25 mm', replCriteria: 'Replace', remarks: '—', loc: { category: 'Maintenance Store', plant: 'Ranjangaon R1', subStore: null, remark: '—' } },
  { code: 'SPC-2030', component: 'Bolster Plate', sub: 'Top Surface', fn: 'Die support', existingMat: '—', proposedMat: 'FG260 / Cast Steel', hardness: '200-240 HB', surface: 'Ground', opTemp: 'Ambient', load: 'Static + Impact', lube: 'None', inspFreq: 'Half yearly', wearLimit: 'Flatness >0.2 mm', replCriteria: 'Regrind', remarks: '—', loc: { category: 'Plant Floor', plant: 'Ranjangaon R2', subStore: null, remark: 'Regrind on machine / send out — not stocked as new' } },
  { code: 'SPC-2031', component: 'Die Clamp', sub: 'Clamp Block', fn: 'Die holding', existingMat: '—', proposedMat: 'EN24', hardness: '32-36 HRC', surface: 'Black oxide', opTemp: 'Ambient', load: 'Tensile load', lube: 'Grease', inspFreq: 'Quarterly', wearLimit: 'Crack not allowed', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: null, remark: '—' } },
  { code: 'SPC-2032', component: 'Key and Keyway', sub: 'Power transmission', fn: 'Torque transmission', existingMat: '—', proposedMat: 'EN8', hardness: '28-32 HRC', surface: 'Black oxide', opTemp: 'Ambient', load: 'Shock load', lube: 'None', inspFreq: 'Quarterly', wearLimit: 'Wear >10%', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Mundhwa', subStore: null, remark: '—' } },
  { code: 'SPC-2033', component: 'Coupling', sub: 'Flexible Element', fn: 'Motor-drive connection', existingMat: '—', proposedMat: 'Polyurethane/Steel (OEM)', hardness: 'OEM', surface: 'None', opTemp: 'Ambient', load: 'Torsional load', lube: 'None', inspFreq: 'Quarterly', wearLimit: 'Crack/wear', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Baramati', subStore: null, remark: '—' } },
  { code: 'SPC-2034', component: 'Motor Bearing', sub: 'DE/NDE Bearing', fn: 'Motor support', existingMat: '—', proposedMat: 'SKF/FAG Standard (OEM)', hardness: 'OEM', surface: 'OEM', opTemp: '<90°C', load: 'Rotational load', lube: 'Grease', inspFreq: 'Monthly', wearLimit: 'Vibration >4.5 mm/s', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R2', subStore: null, remark: '—' } },
  { code: 'SPC-2035', component: 'Encoder/Resolver', sub: 'Sensor', fn: 'Position feedback', existingMat: '—', proposedMat: 'OEM', hardness: 'None', surface: '—', opTemp: '<70°C', load: 'Electrical', lube: 'None', inspFreq: 'Monthly', wearLimit: 'Signal loss', replCriteria: 'Replace', remarks: '—', loc: { category: 'Main Store', plant: 'Ranjangaon R1', subStore: 'Sub-Store: Electronics', remark: 'ESD safe storage required' } },
];
