import React, { useEffect } from 'react';

/* ---------------------------------------------------------------
   Module-scope helpers (verbatim logic from the original page's
   <script> block). These are intentionally kept as plain JS,
   driving the DOM directly exactly as in the original demo.
------------------------------------------------------------------ */
function toggleNode(id){
  const ch=document.getElementById('ch-'+id);
  const arr=document.getElementById('arr-'+id);
  if(!ch)return;
  const open=ch.classList.toggle('open');
  if(arr)arr.classList.toggle('open',open);
}

function selectPanel(id,context){
  document.querySelectorAll('.detail-panel').forEach(p=>p.classList.remove('active'));
  const target=document.getElementById(id);
  if(target)target.classList.add('active');
  // Context-aware panels
  if(id==='p-other-ra'&&context){
    target.innerHTML=buildRoboticArmPanel('Line '+context,'R1-'+context);
  }
  if(id==='p-generic-line'&&context){
    target.innerHTML=`<div class="hier-breadcrumb"><span>Line ${context}</span></div><div class="page-title">Line ${context}</div><div class="page-subtitle" style="margin-bottom:16px">4 Machines — Click Robotic Arm to inspect</div><div class="kpi-mini-grid"><div class="kpi-mini" style="--kc:#059669"><div class="kpi-mini-val">96.8%</div><div class="kpi-mini-label">Availability</div></div><div class="kpi-mini" style="--kc:#2563EB"><div class="kpi-mini-val">4</div><div class="kpi-mini-label">Machines</div></div><div class="kpi-mini" style="--kc:#D97706"><div class="kpi-mini-val">2</div><div class="kpi-mini-label">PM Due</div></div><div class="kpi-mini" style="--kc:#DC2626"><div class="kpi-mini-val">0</div><div class="kpi-mini-label">Breakdown</div></div></div>`+buildRoboticArmPanel('Line '+context,'generic-'+context);
  }
  if(id==='p-mach-plant'&&context){
    target.innerHTML=`<div class="hier-breadcrumb"><span class="hier-bc-item" onclick="selectPanel('p-machining')">⚙️ Machining</span><span class="hier-bc-sep">›</span><span>${context}</span></div><div class="page-title">${context}</div><div class="page-subtitle" style="margin-bottom:16px">18 Lines · 4 Machines each</div><div class="kpi-mini-grid"><div class="kpi-mini" style="--kc:#2563EB"><div class="kpi-mini-val">18</div><div class="kpi-mini-label">Lines</div></div><div class="kpi-mini" style="--kc:#059669"><div class="kpi-mini-val">94.8%</div><div class="kpi-mini-label">PM Compliance</div></div></div>`;
  }
}

function switchMachine(line,mach,btn){
  const panel=document.getElementById('p-'+line);
  panel.querySelectorAll('.machine-tab').forEach(t=>t.classList.remove('active'));
  panel.querySelectorAll('.machine-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('mp-'+line+'-'+mach).classList.add('active');
  // Lazy render
  const inner=document.getElementById('p-'+line+'-'+mach+'-inner');
  if(inner&&!inner.dataset.rendered){inner.innerHTML=getMachineHTML(line,mach);inner.dataset.rendered='1';}
}

const MACHINES={
  'saw':{icon:'🪚',name:'Circular Saw',tag:'CS-2502',make:'BEHRINGER',model:'HBP 400A',yr:'2019',
    specs:[{l:'Blade Diameter',v:'400 mm'},{l:'Motor Power',v:'11 kW'},{l:'Cut Speed',v:'0–120 m/min'},{l:'Max Bar Dia',v:'340 mm'},{l:'Coolant',v:'Soluble Oil'},{l:'Control',v:'PLC Siemens S7'}],
    subEquip:[
      {n:'Hydraulic Clamping Unit',pts:[
        {t:'Hydraulic Oil Level',d:'Min mark — ISO VG 46',sop:'SOP-CS-001-T1',steps:['Check sight glass — wipe clean first','Level must be above min mark. Top up VG 46 if needed','Check for leakage at all hose connections']},
        {t:'Clamping Pressure',d:'50–70 Bar — test with gauge',sop:'SOP-CS-001-T2',steps:['Attach gauge to test point TP-01','Activate clamp cycle. Record pressure','Normal 50–70 Bar. Below 45 = pump wear / valve leak']},
        {t:'Hydraulic Pump Noise',d:'No abnormal hissing or whine',sop:'SOP-CS-001-T3',steps:['Listen during operation — pump cavity at ear level (wear hearing PPE)','Cavitation hiss = low oil or blocked strainer','Whine = pump wear — log abnormality']},
        {t:'Cylinder Seal Leakage',d:'Visual — no wet marks',sop:'SOP-CS-001-T4',steps:['Inspect all cylinder rod seals visually','Any drip or wet contamination = abnormal','Photograph and log immediately']},
        {t:'Filter Differential Pressure',d:'ΔP < 3.5 Bar (gauge)',sop:'SOP-CS-001-T5',steps:['Read filter ΔP gauge on return line','Normal < 3.5 Bar. Red zone = replace element','Replace element per SOP-CS-005 if red']}
      ]},
      {n:'Drive Motor & Gearbox',pts:[
        {t:'Motor Winding Temperature',d:'< 120°C — IR gun on casing',sop:'SOP-CS-002-T1',steps:['Take IR reading on motor casing (3 points)','Normal < 100°C. Warning 100–120°C. Critical > 120°C','Check ventilation grille for blockage if hot']},
        {t:'Gearbox Oil Level',d:'Sight glass — above min mark',sop:'SOP-CS-002-T2',steps:['Wipe sight glass. Check level — must be at mid mark','Use gear oil SAE 90 for top-up','Any metallic particles in sight glass = critical']},
        {t:'V-Belt Tension & Condition',d:'20mm deflection at mid-span',sop:'SOP-CS-002-T3',steps:['Press belt at mid-span with 2 kg force — deflection 18–22mm','Inspect for cracks, glazing, fraying — replace if cracked','Do not over-tighten — check motor bearing temp after adjustment']},
        {t:'Vibration Level',d:'< 3.5 mm/s RMS',sop:'SOP-CS-002-T4',steps:['Place sensor on gearbox output shaft bearing','Record RMS. Normal < 3.5. High > 5 mm/s = abnormal','Compare trend — sudden increase indicates fault']},
        {t:'Gearbox Breather Condition',d:'Clear — no blockage',sop:'SOP-CS-002-T5',steps:['Remove breather cap — clean with compressed air','Blocked breather causes oil seal failure','Replace if damaged or clogged']}
      ]}
    ]},
  'ih':{icon:'🔥',name:'Induction Heater',tag:'IH-2502',make:'INDUCTOTHERM',model:'VIP Power-Trak 250',yr:'2020',
    specs:[{l:'Power Rating',v:'250 kW'},{l:'Frequency',v:'1–10 kHz'},{l:'Max Temp',v:'1300°C'},{l:'Billet Dia Range',v:'40–120 mm'},{l:'Cooling',v:'Closed loop water'},{l:'Control',v:'Siemens HMI'}],
    subEquip:[
      {n:'Induction Coil Assembly',pts:[
        {t:'Coil Insulation Resistance',d:'> 1 MΩ — Megger test monthly',sop:'SOP-IH-001-T1',steps:['Isolate coil. Connect Megger at 500V between coil and frame','> 1MΩ = pass. < 500kΩ = warning. < 100kΩ = immediate replacement','Record reading and date in log']},
        {t:'Coil Water Flow Rate',d:'> 8 LPM per coil',sop:'SOP-IH-001-T2',steps:['Check flow meter reading on cooling water panel','Normal > 8 LPM. Below 5 = blockage or pump fault','Flush with clean water if low flow suspected']},
        {t:'Coil Surface Condition',d:'Visual — no cracks or burn marks',sop:'SOP-IH-001-T3',steps:['Inspect coil surface for spatter build-up — clean if present','Cracks in coil = immediate shutdown and replacement','Arc burn marks indicate coil to billet arcing — check gap']},
        {t:'Gap Setting — Billet to Coil',d:'3–5mm clearance all round',sop:'SOP-IH-001-T4',steps:['Use feeler gauge at 3 positions — top, left, right','Gap must be uniform 3–5mm','Uneven gap causes hot spots and coil damage']},
        {t:'Coil Outlet Water Temperature',d:'< 45°C return temperature',sop:'SOP-IH-001-T5',steps:['Read thermometer on cooling water return line','Normal < 40°C. Warning 40–45°C. Critical > 45°C = reduce power','If > 45°C, stop heating and check cooler efficiency']}
      ]},
      {n:'Power Supply & Control Cabinet',pts:[
        {t:'Capacitor Bank Temperature',d:'< 60°C — IR scan',sop:'SOP-IH-002-T1',steps:['Perform IR scan of capacitor bank with thermal camera','Any capacitor showing > 60°C = suspect failure','Hot spot indicates internal short — replace affected capacitor']},
        {t:'IGBT Module Condition',d:'No alarm on HMI',sop:'SOP-IH-002-T2',steps:['Check HMI status screen for IGBT fault codes','Any IGBT fault = maintenance required before next heat cycle','Log fault code and inform planner']},
        {t:'Cabinet Cooling Fan Operation',d:'All fans running — no noise',sop:'SOP-IH-002-T3',steps:['Listen for fan operation. All 3 fans must be audible','Faulty fan = temperature rise in cabinet within 20 min','Replace failed fan immediately']},
        {t:'DC Bus Voltage',d:'650–700V DC — HMI reading',sop:'SOP-IH-002-T4',steps:['Read DC bus voltage on HMI display','Normal 650–700V. Low voltage = rectifier fault','Record and trend — gradual drop indicates rectifier ageing']},
        {t:'Earth Fault Leakage',d:'< 10 mA — ELCB test',sop:'SOP-IH-002-T5',steps:['Press ELCB test button on main panel','ELCB must trip within 0.3 sec. Fails to trip = immediate replacement','Check again after reset — two consecutive failures = isolate']}
      ]}
    ]},
  'fp':{icon:'🔨',name:'Forging Press',tag:'FP-2502',make:'SCHULER',model:'MSD 1600',yr:'2018',
    specs:[{l:'Pressing Force',v:'1600 Ton'},{l:'Motor Power',v:'185 kW'},{l:'Stroke',v:'200–500 mm'},{l:'SPM',v:'8–15'},{l:'Die Height',v:'700–1100 mm'},{l:'Control',v:'Beckhoff TwinCAT'}],
    subEquip:[
      {n:'Main Drive & Flywheel',pts:[
        {t:'Flywheel Bearing Temperature',d:'< 75°C — Temp gun',sop:'SOP-FP-001-T1',steps:['Take IR reading at flywheel bearing housing — 3 points','Normal < 70°C. Warning 70–80°C. Critical > 80°C','High temp = lubrication failure or bearing wear — log and escalate']},
        {t:'Clutch-Brake Engagement',d:'Clean snap with no slip',sop:'SOP-FP-001-T2',steps:['Run single stroke. Listen for clean clutch engagement sound','Slipping or delayed engagement = worn friction plates','Do not run production with slipping clutch — safety critical']},
        {t:'Main Motor Current Draw',d:'< FLA 285A — panel meter',sop:'SOP-FP-001-T3',steps:['Read current on MCC ammeter during press stroke','Must be < 285A (FLA). Overload trips = mechanical resistance','Check knockout, feed mechanism, die for binding']},
        {t:'Flywheel Speed',d:'200–210 RPM before cycle start',sop:'SOP-FP-001-T4',steps:['Check RPM on HMI before enabling cycle','Speed below 190 RPM = motor or belt issue — wait and check','Do not start production until correct flywheel speed is confirmed']},
        {t:'Drive Belt Condition & Tension',d:'< 15mm deflection, no cracks',sop:'SOP-FP-001-T5',steps:['Check all 6 V-belts for cracks, glazing, fraying','Tension: 10–15mm deflection under 5 kg load at mid-span','Replace all belts as a set — never replace individually']}
      ]},
      {n:'Hydraulic Overload Protection',pts:[
        {t:'Overload Pressure Setting',d:'175 Bar — do not adjust',sop:'SOP-FP-002-T1',steps:['Read overload valve pressure gauge — must show 175 Bar','Do not adjust. Tampering is a safety violation','If wrong pressure, raise job card for Engineering dept only']},
        {t:'Hydraulic Oil Temperature',d:'< 60°C — on panel gauge',sop:'SOP-FP-002-T2',steps:['Check temp gauge on hydraulic power pack','Normal 40–55°C. High > 60°C = cooler fault or pump bypass','Allow to cool. Check cooler fins for blockage']},
        {t:'Oil Contamination (NAS Level)',d:'NAS 9 max — send monthly lab sample',sop:'SOP-FP-002-T3',steps:['Collect 50ml oil sample from drain plug','Label with date, machine, oil hours. Send to lab','NAS > 9 = flush and change oil immediately']},
        {t:'Pressure Relief Valve Test',d:'Valve must open at 175 Bar',sop:'SOP-FP-002-T4',steps:['Test only on shutdown — raise pressure on bench','Valve must crack open at 175 ± 5 Bar','Failed test = replace valve. Do not operate press']},
        {t:'Reservoir Level & Breather',d:'Oil at ¾ full, breather clear',sop:'SOP-FP-002-T5',steps:['Check sight glass on reservoir — must be at ¾ mark','Inspect breather cap — clean with air if dusty','Low level = check for leaks in cylinder seals and hoses']}
      ]}
    ]},
  'ra':{icon:'🤖',name:'Robotic Arm',tag:'RA-2502',make:'KUKA',model:'KR 240 R2900 ultra',yr:'2021',
    specs:[{l:'Payload',v:'240 kg'},{l:'Reach',v:'2900 mm'},{l:'Axes',v:'6'},{l:'Repeat Accuracy',v:'±0.05 mm'},{l:'Controller',v:'KR C4'},{l:'IP Rating',v:'IP65'}],
    subEquip:[
      {n:'Axes & Joint Drives',pts:[
        {t:'Axis 1–3 Gear Oil Level',d:'At dipstick mark — Shell Tivela S 320',sop:'SOP-RA-001-T1',steps:['Access gear oil check point at each axis per KR C4 manual','Correct grade: Shell Tivela S 320 or equivalent','Low level = potential seal leak — inspect all seals']},
        {t:'Joint Backlash Check',d:'Axis repeatability test < 0.08mm',sop:'SOP-RA-001-T2',steps:['Run calibration program CALIB-01 on KR C4 controller','TCP error must be < 0.08mm at all 6 axes','Excess backlash on any axis = gearbox replacement required']},
        {t:'Motor Encoder Battery Check',d:'Battery voltage > 3.4V',sop:'SOP-RA-001-T3',steps:['Check encoder battery voltage on KR C4 status screen','< 3.4V = replace immediately. Battery failure = axis home position loss','Always master robot after battery replacement']},
        {t:'Axis Brake Function Test',d:'Robot holds position when drives off',sop:'SOP-RA-001-T4',steps:['With robot at load position, disable drives from KR C4','Robot must not drift or drop for 10 seconds','Any axis drifting > 0.5mm = brake replacement — safety critical']},
        {t:'Cable Pack Condition',d:'No abrasion, kinks or cracking',sop:'SOP-RA-001-T5',steps:['Inspect full cable harness run during motion cycle','Any abrasion on cable insulation = replace cable pack','Cracked cables in forging environment = short circuit risk']}
      ]},
      {n:'Controller & Safety System',pts:[
        {t:'Safety PLC Status',d:'All safety I/Os green on KR C4',sop:'SOP-RA-002-T1',steps:['Check KR C4 safety screen — all inputs must show green','Any red input = door switch, light curtain or E-stop fault','Do not acknowledge safety fault without identifying cause first']},
        {t:'E-Stop Function Test',d:'Robot stops within 250ms',sop:'SOP-RA-002-T2',steps:['With robot in T1 mode, press E-stop during motion','Robot must stop immediately — measure stop distance','Fails to stop = immediate isolation and safety report']},
        {t:'Cabinet Cooling Temperature',d:'Controller internal < 45°C',sop:'SOP-RA-002-T3',steps:['Check controller internal temp on KR C4 diagnostics page','Normal < 40°C. Warning 40–45°C = check cabinet fan','Fan failure in forging area causes rapid overtemperature']},
        {t:'Mastering Check (A1–A6)',d:'Master deviation < 0.1°',sop:'SOP-RA-002-T4',steps:['Run mastering check program MASTER-CHECK-01','All axes must be within ± 0.1° of master position','Out of master = re-master all axes in correct order per manual']},
        {t:'KR C4 Backup Status',d:'Daily backup completed — USB drive',sop:'SOP-RA-002-T5',steps:['Check backup log on KR C4 — must show today\'s date','If not backed up, run manual backup to USB: System → Backup','Store USB drive in KR C4 cabinet — never remove from site']}
      ]}
    ]},
  'tp':{icon:'✂️',name:'Trimming Press',tag:'TP-2502',make:'AIDA',model:'FT2-400-2',yr:'2020',
    specs:[{l:'Press Force',v:'400 Ton'},{l:'Motor Power',v:'55 kW'},{l:'Stroke',v:'150–250 mm'},{l:'SPM',v:'15–30'},{l:'Die Height',v:'300–600 mm'},{l:'Control',v:'Mitsubishi Q-Series'}],
    subEquip:[
      {n:'Crankshaft & Slide',pts:[
        {t:'Crankshaft Bearing Temperature',d:'< 70°C — temp gun',sop:'SOP-TP-001-T1',steps:['Read crankshaft main bearing housing with temp gun at 2 points','Normal < 65°C. Warning 65–75°C. Critical > 75°C','High temp = oil feed blocked or bearing wear — check oil pump flow']},
        {t:'Slide Gibs Clearance',d:'0.02–0.05mm — feeler gauge',sop:'SOP-TP-001-T2',steps:['Measure clearance at all 4 slide gib positions with feeler gauge','Must be 0.02–0.05mm. Excess = part quality issues','Adjust gibs to spec — tighten evenly all 4 corners']},
        {t:'Lubrication Flow to Gibs',d:'Central lube system — oil at all points',sop:'SOP-TP-001-T3',steps:['Check lube system oil reservoir level — must be > ½','Run manual lube cycle. Verify oil appears at all gib ports','Blocked port = immediate cleaning to prevent gib wear']},
        {t:'Stroke Counter & SPM',d:'SPM within ±2 of set speed',sop:'SOP-TP-001-T4',steps:['Read SPM from press HMI counter','If SPM deviates > 2 from set point = check clutch and brake','Record daily stroke count for maintenance trigger calculation']},
        {t:'Counterbalance Cylinder Pressure',d:'8–12 Bar — gauge on cylinder',sop:'SOP-TP-001-T5',steps:['Read counterbalance pressure gauge on press column','Normal 8–12 Bar. Low = nitrogen leak from bladder accumulator','Refill with dry nitrogen only — never use compressed air']}
      ]},
      {n:'Die Clamp & Safety Gate',pts:[
        {t:'Die Clamp Bolt Torque',d:'All 4 bolts at 280 Nm',sop:'SOP-TP-002-T1',steps:['Check all 4 die clamp bolts with calibrated torque wrench','Torque value: 280 Nm. Under-torque = die movement during operation','Always re-check after first 10 strokes of a new die setup']},
        {t:'Safety Gate Interlock',d:'Press disables when gate opens',sop:'SOP-TP-002-T2',steps:['Open safety gate with press in standby mode','Press must not allow cycle enable while gate is open','Bypassed interlock = safety stop all production immediately']},
        {t:'Die Clamping Surface Flatness',d:'< 0.05mm — dial gauge check',sop:'SOP-TP-002-T3',steps:['Place dial gauge on bolster surface. Move across in cross pattern','Flatness must be < 0.05mm across full bolster','Grooved surface from die impact = surface grinding required']},
        {t:'Air Blow-Off Nozzle Condition',d:'All nozzles clear and aimed correctly',sop:'SOP-TP-002-T4',steps:['Check all 4 trim flash blow-off nozzles for blockage','Blocked nozzle = flash build-up in die — causes die damage','Clear with wire and compressed air — do not enlarge nozzle bore']},
        {t:'Knockout System Function',d:'Part ejected cleanly every stroke',sop:'SOP-TP-002-T5',steps:['Run 3 dry cycles with dummy workpiece and observe knockout','Part must eject cleanly on every stroke','Partial ejection = knockout pin bent or spring failure — replace']}
      ]}
    ]}
};

function getMachineHTML(line,mach){
  const m=MACHINES[mach];if(!m)return '<div>No data</div>';
  const mid=line+'-'+mach;
  let html=`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      <div style="font-size:32px">${m.icon}</div>
      <div style="flex:1">
        <div style="font-size:18px;font-weight:700;color:var(--blue-900)">${m.name}</div>
        <div style="font-size:12px;color:var(--slate-500)">Tag: ${m.tag} · ${m.make} ${m.model} · Installed ${m.yr}</div>
      </div>
      <span class="badge badge-ok" style="align-self:flex-start">Online</span>
    </div>
    <div style="margin-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--blue-900)">Specifications</div>
        <button class="btn btn-secondary btn-sm" onclick="openSpecModal('${m.tag}')">+ Add Spec</button>
      </div>
      <div class="spec-grid">`;
  m.specs.forEach(s=>{
    html+=`<div class="spec-item"><div class="spec-item-label">${s.l}</div><div class="spec-item-value">${s.v}</div></div>`;
  });
  html+=`</div><div id="extra-specs-${mid}"></div></div>`;
  // SUB EQUIPMENT + CHECKLIST
  m.subEquip.forEach((se,si)=>{
    html+=`<div class="card" style="margin-bottom:14px">
      <div class="card-header">
        <div><div class="card-title">🔩 ${se.n}</div><div class="card-subtitle">${se.pts.length} Check Points · SOP attached to each</div></div>
        <span class="badge badge-ok">${se.pts.length} pts</span>
      </div>`;
    se.pts.forEach((pt,pi)=>{
      const sopId=`sop-${mid}-${si}-${pi}`;
      html+=`<div class="check-point-row">
        <div class="cp-num">${pi+1}</div>
        <div class="cp-info">
          <div class="cp-title">${pt.t}</div>
          <div class="cp-detail">${pt.d}</div>
          <button class="sop-toggle-btn" onclick="toggleSopDrop('${sopId}')">📖 ${pt.sop} ▾</button>
          <div class="sop-drop" id="${sopId}">
            <strong style="font-size:11px;color:var(--blue-700)">${pt.sop}</strong>
            <div style="margin-top:5px">`;
      pt.steps.forEach((st,idx)=>{
        html+=`<div class="sop-drop-step"><div class="sop-drop-num">${idx+1}</div><span>${st}</span></div>`;
      });
      html+=`</div></div></div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-items:flex-start;margin-top:2px">
          <button class="check-btn check-btn-ok" style="padding:5px 10px;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid var(--green);background:white;color:var(--green)" onclick="markHierOK(this)">✓ OK</button>
          <button class="check-btn check-btn-abn" style="padding:5px 10px;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid var(--red);background:white;color:var(--red)" onclick="markHierAbn(this)">✗ Abn</button>
        </div>
      </div>`;
    });
    html+=`</div>`;
  });
  return html;
}

function buildRoboticArmPanel(lineLabel,mid){
  const m=MACHINES['ra'];
  return `<div style="font-size:16px;font-weight:700;color:var(--blue-900);margin-bottom:4px">🤖 Robotic Arm — ${lineLabel}</div>
    <div style="font-size:12px;color:var(--slate-500);margin-bottom:12px">Tag: ${mid}-RA · KUKA KR 240 · 2021</div>`+getMachineHTML(mid,'ra').replace(/p-2502-ra/g,mid+'-ra').replace(/RA-2502/g,mid+'-RA');
}

function initStandalone(){
  const map={'2502-saw':'saw','2502-ih':'ih','2502-fp':'fp','2502-ra':'ra','2502-tp':'tp'};
  Object.entries(map).forEach(([key,mach])=>{
    const el=document.getElementById('p-'+key+'-standalone');
    if(el&&!el.dataset.rendered){el.innerHTML=getMachineHTML('2502',mach);el.dataset.rendered='1';}
  });
  // Inline tabs initial
  const inner=document.getElementById('p-2502-saw-inner');
  if(inner&&!inner.dataset.rendered){inner.innerHTML=getMachineHTML('2502','saw');inner.dataset.rendered='1';}
  // Line 4002/2501/2503 robotic
  ['4002','2501','2503'].forEach(l=>{
    const el=document.getElementById('p-'+l+'-ra-content');
    if(el&&!el.dataset.rendered){el.innerHTML=buildRoboticArmPanel('Line '+l,l);el.dataset.rendered='1';}
  });
}

function toggleSopDrop(id){
  const el=document.getElementById(id);if(el)el.classList.toggle('open');
}

function markHierOK(btn){
  const row=btn.closest('.check-point-row');
  row.style.background=btn.style.background='#ECFDF5';
  row.style.borderColor='#A7F3D0';
  btn.style.background='var(--green)';btn.style.color='white';
  row.querySelector('.check-btn-abn').style.background='white';
  row.querySelector('.check-btn-abn').style.color='var(--red)';
}

function markHierAbn(btn){
  const row=btn.closest('.check-point-row');
  row.style.background='#FEF2F2';row.style.borderColor='#FECACA';
  btn.style.background='var(--red)';btn.style.color='white';
  row.querySelector('.check-btn-ok').style.background='white';
  row.querySelector('.check-btn-ok').style.color='var(--green)';
}

let currentSpecMachine='';

function openSpecModal(tag){
  currentSpecMachine=tag;
  document.getElementById('spec-modal-title').textContent='Add Spec — '+tag;
  document.getElementById('specModal').classList.add('open');
}

function saveSpec(){
  const param=document.getElementById('spec-param').value;
  const val=document.getElementById('spec-val').value;
  const unit=document.getElementById('spec-unit').value;
  if(!param||!val)return;
  const targets=document.querySelectorAll('[id^="extra-specs"]');
  targets.forEach(t=>{
    if(t.closest('[data-rendered]')||t){
      const div=document.createElement('div');
      div.style.cssText='background:var(--amber-light);border:1px solid var(--amber-border);border-radius:var(--radius);padding:10px 14px;display:flex;gap:10px;align-items:center;margin-top:6px;font-size:12px';
      div.innerHTML=`<span style="font-size:14px">⭐</span><div><div style="font-size:10px;text-transform:uppercase;color:var(--slate-400);font-weight:700">${param}</div><div style="font-size:14px;font-weight:700;color:var(--blue-900);font-family:var(--font-mono)">${val} ${unit}</div></div><span style="margin-left:auto;font-size:10px;color:var(--slate-400)">User added</span>`;
      t.appendChild(div);
    }
  });
  document.getElementById('specModal').classList.remove('open');
  document.getElementById('spec-param').value='';
  document.getElementById('spec-val').value='';
  document.getElementById('spec-unit').value='';
}

export default function HierarchyPage({ onNavigate }) {
  useEffect(() => {
    const cleanups = [];
    (()=>{
      initStandalone();
    })();
    return () => { cleanups.forEach(fn => fn()); };
  }, []);

  return (
    <>
      <style>{`

/* ── LAYOUT ── */
.hier-layout{display:flex;gap:0;min-height:calc(100vh - 56px)}
.hier-tree{width:300px;background:white;border-right:1px solid var(--slate-200);overflow-y:auto;flex-shrink:0;padding:16px 0}
.hier-detail{flex:1;overflow-y:auto;padding:24px 28px}

/* ── TREE ── */
.tree-node{cursor:pointer;user-select:none}
.tree-row{display:flex;align-items:center;gap:8px;padding:7px 14px;border-left:3px solid transparent;transition:all .15s;font-size:13px}
.tree-row:hover{background:var(--slate-50)}
.tree-row.selected{background:var(--blue-50);border-left-color:var(--blue-500);color:var(--blue-600);font-weight:600}
.tree-arrow{width:14px;font-size:10px;color:var(--slate-400);flex-shrink:0;transition:transform .2s;display:inline-block}
.tree-arrow.open{transform:rotate(90deg)}
.tree-icon{font-size:14px;flex-shrink:0}
.tree-label{flex:1;line-height:1.3}
.tree-badge{font-size:10px;font-weight:700;background:var(--slate-100);color:var(--slate-500);padding:1px 6px;border-radius:100px}
.tree-children{display:none;padding-left:16px}
.tree-children.open{display:block}

/* ── DEPTH COLORS ── */
.depth-0 .tree-row{font-weight:700;font-size:14px}
.depth-1 .tree-row{font-weight:600}
.depth-2 .tree-row{font-weight:500}
.depth-3 .tree-row{}
.depth-4 .tree-row{font-size:12px}
.depth-5 .tree-row{font-size:11px}

/* ── DETAIL PANELS ── */
.detail-panel{display:none}
.detail-panel.active{display:block}
.spec-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px}
.spec-item{background:white;border:1px solid var(--slate-200);border-radius:var(--radius);padding:12px 14px}
.spec-item-label{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--slate-400);margin-bottom:4px}
.spec-item-value{font-size:14px;font-weight:700;color:var(--blue-900);font-family:var(--font-mono)}
.check-point-row{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1px solid var(--slate-200);border-radius:var(--radius);margin-bottom:6px;background:white}
.cp-num{width:22px;height:22px;border-radius:50%;background:var(--blue-100);color:var(--blue-600);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cp-info{flex:1}
.cp-title{font-size:13px;font-weight:600;color:var(--blue-900)}
.cp-detail{font-size:11px;color:var(--slate-500);margin-top:1px}
.sop-toggle-btn{font-size:10px;padding:2px 8px;background:var(--blue-50);color:var(--blue-600);border:1px solid #BFDBFE;border-radius:4px;cursor:pointer;white-space:nowrap;margin-top:4px}
.sop-drop{display:none;margin-top:6px;background:var(--blue-50);border:1px solid #BFDBFE;border-radius:6px;padding:8px 10px;font-size:11px;color:var(--slate-700)}
.sop-drop.open{display:block}
.sop-drop-step{display:flex;gap:6px;margin-bottom:4px;align-items:flex-start}
.sop-drop-num{width:16px;height:16px;background:var(--blue-500);color:white;border-radius:50%;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.machine-tab{padding:8px 16px;font-size:12px;font-weight:600;border-radius:6px 6px 0 0;cursor:pointer;border:1px solid var(--slate-200);border-bottom:none;background:var(--slate-50);color:var(--slate-500);transition:all .15s;white-space:nowrap}
.machine-tab.active{background:white;color:var(--blue-500);border-color:var(--slate-200);margin-bottom:-1px;z-index:1;position:relative}
.machine-tabs-row{display:flex;gap:4px;margin-bottom:0;flex-wrap:wrap;border-bottom:1px solid var(--slate-200);padding:0}
.machine-panel{display:none;background:white;border:1px solid var(--slate-200);border-radius:0 var(--radius) var(--radius) var(--radius);padding:20px}
.machine-panel.active{display:block}
.add-spec-form{background:var(--slate-50);border:1.5px dashed var(--slate-300);border-radius:var(--radius);padding:14px;margin-top:12px;display:none}
.add-spec-form.open{display:block}
.kpi-mini-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.kpi-mini{background:white;border:1px solid var(--slate-200);border-radius:var(--radius);padding:12px;text-align:center;border-top:3px solid var(--kc,var(--blue-500))}
.kpi-mini-val{font-size:20px;font-weight:700;font-family:var(--font-mono);color:var(--blue-900)}
.kpi-mini-label{font-size:10px;color:var(--slate-400);margin-top:2px;font-weight:600;letter-spacing:.3px;text-transform:uppercase}

/* ── BREADCRUMB ── */
.hier-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--slate-400);margin-bottom:16px;flex-wrap:wrap}
.hier-bc-item{cursor:pointer;color:var(--slate-400)}
.hier-bc-item:hover{color:var(--blue-500)}
.hier-bc-sep{color:var(--slate-300)}

`}</style>
      <div>
        <nav className="top-nav">
          <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}><div className="nav-logo-icon">🏭</div><div><div className="nav-logo-text">SmartPM</div><div className="nav-logo-sub">Plant Hierarchy</div></div></a>
          <div className="nav-spacer" />
          <div className="nav-role-badge"><div className="nav-role-dot" style={{background: '#0891B2'}} /><span className="nav-role-name">Manager View</span></div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className="nav-home-btn" style={{marginLeft: 8}}>← Dashboard</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="nav-home-btn">Home</a>
        </nav>
        <div className="app-layout" style={{paddingTop: 56}}>
          <div className="hier-layout" style={{marginLeft: 0, width: '100%'}}>
            {/* LEFT TREE */}
            <div className="hier-tree" id="hier-tree">
              <div style={{padding: '10px 14px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--slate-400)'}}>Plant Hierarchy</div>
              {/* ROOT: FORGING */}
              <div className="tree-node depth-0" id="tn-forging">
                <div className="tree-row" onClick={(e) => { toggleNode('forging');selectPanel('p-forging') }}>
                  <span className="tree-arrow open" id="arr-forging">▶</span>
                  <span className="tree-icon">🏭</span>
                  <span className="tree-label">Forging Division</span>
                  <span className="tree-badge">4 Plants</span>
                </div>
                <div className="tree-children open" id="ch-forging">
                  {/* RANJANGAON R1 */}
                  <div className="tree-node depth-1" id="tn-r1">
                    <div className="tree-row" onClick={(e) => { toggleNode('r1');selectPanel('p-r1') }}>
                      <span className="tree-arrow open" id="arr-r1">▶</span>
                      <span className="tree-icon">🏗️</span>
                      <span className="tree-label">Ranjangaon R1</span>
                      <span className="tree-badge">4 Lines</span>
                    </div>
                    <div className="tree-children open" id="ch-r1">
                      {/* LINE 2502 — FULL MACHINES */}
                      <div className="tree-node depth-2" id="tn-2502">
                        <div className="tree-row" onClick={(e) => { toggleNode('2502');selectPanel('p-2502') }}>
                          <span className="tree-arrow open" id="arr-2502">▶</span>
                          <span className="tree-icon">⚡</span>
                          <span className="tree-label">Line 2502</span>
                          <span className="tree-badge">5 Mach.</span>
                        </div>
                        <div className="tree-children open" id="ch-2502">
                          <div className="tree-node depth-3"><div className="tree-row" onClick={(e) => { selectPanel('p-2502-saw') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🪚</span><span className="tree-label">Circular Saw</span></div></div>
                          <div className="tree-node depth-3"><div className="tree-row" onClick={(e) => { selectPanel('p-2502-ih') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🔥</span><span className="tree-label">Induction Heater</span></div></div>
                          <div className="tree-node depth-3"><div className="tree-row" onClick={(e) => { selectPanel('p-2502-fp') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🔨</span><span className="tree-label">Forging Press</span></div></div>
                          <div className="tree-node depth-3"><div className="tree-row" onClick={(e) => { selectPanel('p-2502-ra') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🤖</span><span className="tree-label">Robotic Arm</span></div></div>
                          <div className="tree-node depth-3"><div className="tree-row" onClick={(e) => { selectPanel('p-2502-tp') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">✂️</span><span className="tree-label">Trimming Press</span></div></div>
                        </div>
                      </div>
                      {/* LINE 4002 — ROBOTIC ARM ONLY */}
                      <div className="tree-node depth-2" id="tn-4002">
                        <div className="tree-row" onClick={(e) => { toggleNode('4002');selectPanel('p-4002') }}>
                          <span className="tree-arrow" id="arr-4002">▶</span>
                          <span className="tree-icon">⚡</span>
                          <span className="tree-label">Line 4002</span>
                          <span className="tree-badge">1 Mach.</span>
                        </div>
                        <div className="tree-children" id="ch-4002">
                          <div className="tree-node depth-3"><div className="tree-row" onClick={(e) => { selectPanel('p-other-ra','4002') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🤖</span><span className="tree-label">Robotic Arm</span></div></div>
                        </div>
                      </div>
                      {/* LINE 2501 */}
                      <div className="tree-node depth-2" id="tn-2501">
                        <div className="tree-row" onClick={(e) => { toggleNode('2501');selectPanel('p-2501') }}>
                          <span className="tree-arrow" id="arr-2501">▶</span>
                          <span className="tree-icon">⚡</span>
                          <span className="tree-label">Line 2501</span>
                          <span className="tree-badge">1 Mach.</span>
                        </div>
                        <div className="tree-children" id="ch-2501">
                          <div className="tree-node depth-3"><div className="tree-row" onClick={(e) => { selectPanel('p-other-ra','2501') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🤖</span><span className="tree-label">Robotic Arm</span></div></div>
                        </div>
                      </div>
                      {/* LINE 2503 */}
                      <div className="tree-node depth-2" id="tn-2503">
                        <div className="tree-row" onClick={(e) => { toggleNode('2503');selectPanel('p-2503') }}>
                          <span className="tree-arrow" id="arr-2503">▶</span>
                          <span className="tree-icon">⚡</span>
                          <span className="tree-label">Line 2503</span>
                          <span className="tree-badge">1 Mach.</span>
                        </div>
                        <div className="tree-children" id="ch-2503">
                          <div className="tree-node depth-3"><div className="tree-row" onClick={(e) => { selectPanel('p-other-ra','2503') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🤖</span><span className="tree-label">Robotic Arm</span></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* RANJANGAON R2 */}
                  <div className="tree-node depth-1" id="tn-r2">
                    <div className="tree-row" onClick={(e) => { toggleNode('r2');selectPanel('p-r2') }}>
                      <span className="tree-arrow" id="arr-r2">▶</span><span className="tree-icon">🏗️</span>
                      <span className="tree-label">Ranjangaon R2</span><span className="tree-badge">18 Lines</span>
                    </div>
                    <div className="tree-children" id="ch-r2">
                      <div className="tree-node depth-2"><div className="tree-row" onClick={(e) => { selectPanel('p-generic-line','R2-L01') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">⚡</span><span className="tree-label">Line R2-L01</span></div></div>
                      <div className="tree-node depth-2"><div className="tree-row" onClick={(e) => { selectPanel('p-generic-line','R2-L02') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">⚡</span><span className="tree-label">Line R2-L02</span></div></div>
                      <div className="tree-node depth-2"><div className="tree-row" onClick={(e) => { selectPanel('p-generic-line','R2-L03') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">⚡</span><span className="tree-label">Line R2-L03</span></div></div>
                      <div className="tree-node depth-2"><div className="tree-row" style={{fontSize: 11, color: 'var(--slate-400)', paddingLeft: 20}}>+ 15 more lines…</div></div>
                    </div>
                  </div>
                  {/* MUNDHWA */}
                  <div className="tree-node depth-1" id="tn-mun">
                    <div className="tree-row" onClick={(e) => { toggleNode('mun');selectPanel('p-mun') }}>
                      <span className="tree-arrow" id="arr-mun">▶</span><span className="tree-icon">🏗️</span>
                      <span className="tree-label">Mundhwa</span><span className="tree-badge">18 Lines</span>
                    </div>
                    <div className="tree-children" id="ch-mun">
                      <div className="tree-node depth-2"><div className="tree-row" onClick={(e) => { selectPanel('p-generic-line','MUN-L01') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">⚡</span><span className="tree-label">Line MUN-L01</span></div></div>
                      <div className="tree-node depth-2"><div className="tree-row" style={{fontSize: 11, color: 'var(--slate-400)', paddingLeft: 20}}>+ 17 more lines…</div></div>
                    </div>
                  </div>
                  {/* BARAMATI */}
                  <div className="tree-node depth-1" id="tn-bar">
                    <div className="tree-row" onClick={(e) => { toggleNode('bar');selectPanel('p-bar') }}>
                      <span className="tree-arrow" id="arr-bar">▶</span><span className="tree-icon">🏗️</span>
                      <span className="tree-label">Baramati</span><span className="tree-badge">18 Lines</span>
                    </div>
                    <div className="tree-children" id="ch-bar">
                      <div className="tree-node depth-2"><div className="tree-row" onClick={(e) => { selectPanel('p-generic-line','BAR-L01') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">⚡</span><span className="tree-label">Line BAR-L01</span></div></div>
                      <div className="tree-node depth-2"><div className="tree-row" style={{fontSize: 11, color: 'var(--slate-400)', paddingLeft: 20}}>+ 17 more lines…</div></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ROOT: MACHINING */}
              <div className="tree-node depth-0" id="tn-machining" style={{marginTop: 8}}>
                <div className="tree-row" onClick={(e) => { toggleNode('machining');selectPanel('p-machining') }}>
                  <span className="tree-arrow" id="arr-machining">▶</span>
                  <span className="tree-icon">⚙️</span>
                  <span className="tree-label">Machining Division</span>
                  <span className="tree-badge">4 Plants</span>
                </div>
                <div className="tree-children" id="ch-machining">
                  <div className="tree-node depth-1"><div className="tree-row" onClick={(e) => { selectPanel('p-mach-plant','MCH-Ranjangaon') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🏗️</span><span className="tree-label">Ranjangaon</span></div></div>
                  <div className="tree-node depth-1"><div className="tree-row" onClick={(e) => { selectPanel('p-mach-plant','MCH-Mundhwa') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🏗️</span><span className="tree-label">Mundhwa</span></div></div>
                  <div className="tree-node depth-1"><div className="tree-row" onClick={(e) => { selectPanel('p-mach-plant','MCH-Baramati') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🏗️</span><span className="tree-label">Baramati</span></div></div>
                  <div className="tree-node depth-1"><div className="tree-row" onClick={(e) => { selectPanel('p-mach-plant','MCH-Chakan') }}><span className="tree-arrow" style={{visibility: 'hidden'}}>▶</span><span className="tree-icon">🏗️</span><span className="tree-label">Chakan</span></div></div>
                </div>
              </div>
            </div>{/* /hier-tree */}
            {/* RIGHT DETAIL */}
            <div className="hier-detail" id="hier-detail">
              {/* FORGING DIVISION */}
              <div className="detail-panel active" id="p-forging">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging Division</span></div>
                <div className="page-title">Forging Division</div>
                <div className="page-subtitle" style={{marginBottom: 20}}>4 Plants · 18 Lines each · 4–5 Machines per Line</div>
                <div className="kpi-mini-grid">
                  <div className="kpi-mini" style={{'--kc': '#2563EB'}}><div className="kpi-mini-val">4</div><div className="kpi-mini-label">Plants</div></div>
                  <div className="kpi-mini" style={{'--kc': '#059669'}}><div className="kpi-mini-val">72</div><div className="kpi-mini-label">Total Lines</div></div>
                  <div className="kpi-mini" style={{'--kc': '#D97706'}}><div className="kpi-mini-val">288</div><div className="kpi-mini-label">Machines</div></div>
                  <div className="kpi-mini" style={{'--kc': '#DC2626'}}><div className="kpi-mini-val">96.2%</div><div className="kpi-mini-label">Availability</div></div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">Plant Summary</div></div>
                  <div className="table-wrap"><table>
                      <thead><tr><th>Plant</th><th>Lines</th><th>Machines</th><th>PM Compliance</th><th>Breakdowns</th><th>Availability</th></tr></thead>
                      <tbody>
                        <tr><td><strong>Ranjangaon R1</strong></td><td>18</td><td>72</td><td><span className="badge badge-ok">97.4%</span></td><td>4</td><td><span className="badge badge-ok">97.1%</span></td></tr>
                        <tr><td><strong>Ranjangaon R2</strong></td><td>18</td><td>72</td><td><span className="badge badge-ok">95.8%</span></td><td>6</td><td><span className="badge badge-ok">95.4%</span></td></tr>
                        <tr><td><strong>Mundhwa</strong></td><td>18</td><td>72</td><td><span className="badge badge-pending">93.2%</span></td><td>9</td><td><span className="badge badge-pending">92.7%</span></td></tr>
                        <tr><td><strong>Baramati</strong></td><td>18</td><td>72</td><td><span className="badge badge-ok">96.1%</span></td><td>5</td><td><span className="badge badge-ok">95.9%</span></td></tr>
                      </tbody>
                    </table></div>
                </div>
              </div>
              {/* RANJANGAON R1 */}
              <div className="detail-panel" id="p-r1">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span>Ranjangaon R1</span></div>
                <div className="page-title">Ranjangaon R1</div>
                <div className="page-subtitle" style={{marginBottom: 20}}>4 Active Lines — 2502, 4002, 2501, 2503</div>
                <div className="kpi-mini-grid">
                  <div className="kpi-mini" style={{'--kc': '#2563EB'}}><div className="kpi-mini-val">4</div><div className="kpi-mini-label">Lines</div></div>
                  <div className="kpi-mini" style={{'--kc': '#059669'}}><div className="kpi-mini-val">97.4%</div><div className="kpi-mini-label">PM Compliance</div></div>
                  <div className="kpi-mini" style={{'--kc': '#D97706'}}><div className="kpi-mini-val">4</div><div className="kpi-mini-label">Breakdowns</div></div>
                  <div className="kpi-mini" style={{'--kc': '#7C3AED'}}><div className="kpi-mini-val">97.1%</div><div className="kpi-mini-label">Availability</div></div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">Lines Overview</div></div>
                  <div className="table-wrap"><table>
                      <thead><tr><th>Line</th><th>Machines</th><th>Full Config</th><th>PM Due</th><th>Breakdowns</th><th>Availability</th></tr></thead>
                      <tbody>
                        <tr><td><strong style={{color: 'var(--blue-500)', cursor: 'pointer'}} onClick={(e) => { selectPanel('p-2502') }}>2502</strong></td><td>5</td><td><span className="badge badge-ok">Full Line</span></td><td>3</td><td>1</td><td><span className="badge badge-ok">98.2%</span></td></tr>
                        <tr><td><strong style={{color: 'var(--blue-500)', cursor: 'pointer'}} onClick={(e) => { selectPanel('p-4002');toggleNode('4002') }}>4002</strong></td><td>1</td><td><span className="badge badge-pending">Robotic Arm Only</span></td><td>1</td><td>1</td><td><span className="badge badge-ok">96.5%</span></td></tr>
                        <tr><td><strong style={{color: 'var(--blue-500)', cursor: 'pointer'}} onClick={(e) => { selectPanel('p-2501');toggleNode('2501') }}>2501</strong></td><td>1</td><td><span className="badge badge-pending">Robotic Arm Only</span></td><td>1</td><td>1</td><td><span className="badge badge-ok">97.1%</span></td></tr>
                        <tr><td><strong style={{color: 'var(--blue-500)', cursor: 'pointer'}} onClick={(e) => { selectPanel('p-2503');toggleNode('2503') }}>2503</strong></td><td>1</td><td><span className="badge badge-pending">Robotic Arm Only</span></td><td>1</td><td>1</td><td><span className="badge badge-ok">96.8%</span></td></tr>
                      </tbody>
                    </table></div>
                </div>
              </div>
              {/* LINE 2502 OVERVIEW */}
              <div className="detail-panel" id="p-2502">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span>Line 2502</span></div>
                <div className="page-title">Line 2502 — Full Production Line</div>
                <div className="page-subtitle" style={{marginBottom: 20}}>5 Machines · Ranjangaon R1 · Click any machine tab to inspect</div>
                <div className="kpi-mini-grid">
                  <div className="kpi-mini" style={{'--kc': '#059669'}}><div className="kpi-mini-val">98.2%</div><div className="kpi-mini-label">Availability</div></div>
                  <div className="kpi-mini" style={{'--kc': '#2563EB'}}><div className="kpi-mini-val">5</div><div className="kpi-mini-label">Machines</div></div>
                  <div className="kpi-mini" style={{'--kc': '#D97706'}}><div className="kpi-mini-val">3</div><div className="kpi-mini-label">PM Due</div></div>
                  <div className="kpi-mini" style={{'--kc': '#DC2626'}}><div className="kpi-mini-val">1</div><div className="kpi-mini-label">Breakdown</div></div>
                </div>
                <div className="machine-tabs-row">
                  <button className="machine-tab active" onClick={(e) => { switchMachine('2502','saw',e.currentTarget) }}>🪚 Circular Saw</button>
                  <button className="machine-tab" onClick={(e) => { switchMachine('2502','ih',e.currentTarget) }}>🔥 Induction Heater</button>
                  <button className="machine-tab" onClick={(e) => { switchMachine('2502','fp',e.currentTarget) }}>🔨 Forging Press</button>
                  <button className="machine-tab" onClick={(e) => { switchMachine('2502','ra',e.currentTarget) }}>🤖 Robotic Arm</button>
                  <button className="machine-tab" onClick={(e) => { switchMachine('2502','tp',e.currentTarget) }}>✂️ Trimming Press</button>
                </div>
                {/* CIRCULAR SAW */}
                <div className="machine-panel active" id="mp-2502-saw">
                  <div id="p-2502-saw-inner" />
                </div>
                <div className="machine-panel" id="mp-2502-ih"><div id="p-2502-ih-inner" /></div>
                <div className="machine-panel" id="mp-2502-fp"><div id="p-2502-fp-inner" /></div>
                <div className="machine-panel" id="mp-2502-ra"><div id="p-2502-ra-inner" /></div>
                <div className="machine-panel" id="mp-2502-tp"><div id="p-2502-tp-inner" /></div>
              </div>
              {/* MACHINE STANDALONE PANELS (for tree click) */}
              <div className="detail-panel" id="p-2502-saw">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-2502') }}>2502</span><span className="hier-bc-sep">›</span><span>🪚 Circular Saw</span></div>
                <div id="p-2502-saw-standalone" />
              </div>
              <div className="detail-panel" id="p-2502-ih">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-2502') }}>2502</span><span className="hier-bc-sep">›</span><span>🔥 Induction Heater</span></div>
                <div id="p-2502-ih-standalone" />
              </div>
              <div className="detail-panel" id="p-2502-fp">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-2502') }}>2502</span><span className="hier-bc-sep">›</span><span>🔨 Forging Press</span></div>
                <div id="p-2502-fp-standalone" />
              </div>
              <div className="detail-panel" id="p-2502-ra">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-2502') }}>2502</span><span className="hier-bc-sep">›</span><span>🤖 Robotic Arm</span></div>
                <div id="p-2502-ra-standalone" />
              </div>
              <div className="detail-panel" id="p-2502-tp">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span className="hier-bc-item" onClick={(e) => { selectPanel('p-2502') }}>2502</span><span className="hier-bc-sep">›</span><span>✂️ Trimming Press</span></div>
                <div id="p-2502-tp-standalone" />
              </div>
              {/* LINE 4002/2501/2503 */}
              <div className="detail-panel" id="p-4002">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span>Line 4002</span></div>
                <div className="page-title">Line 4002</div><div className="page-subtitle" style={{marginBottom: 16}}>Robotic Arm only — other machines not commissioned</div>
                <div className="alert alert-info" style={{marginBottom: 16}}>ℹ️ Only Robotic Arm is active on this line. Circular Saw, Induction Heater, Forging Press and Trimming Press are not commissioned.</div>
                <div id="p-4002-ra-content" />
              </div>
              <div className="detail-panel" id="p-2501">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span>Line 2501</span></div>
                <div className="page-title">Line 2501</div><div className="page-subtitle" style={{marginBottom: 16}}>Robotic Arm only — other machines not commissioned</div>
                <div className="alert alert-info" style={{marginBottom: 16}}>ℹ️ Only Robotic Arm is active on this line.</div>
                <div id="p-2501-ra-content" />
              </div>
              <div className="detail-panel" id="p-2503">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-r1') }}>R1</span><span className="hier-bc-sep">›</span><span>Line 2503</span></div>
                <div className="page-title">Line 2503</div><div className="page-subtitle" style={{marginBottom: 16}}>Robotic Arm only — other machines not commissioned</div>
                <div className="alert alert-info" style={{marginBottom: 16}}>ℹ️ Only Robotic Arm is active on this line.</div>
                <div id="p-2503-ra-content" />
              </div>
              <div className="detail-panel" id="p-other-ra" />
              {/* R2, MUNDHWA, BARAMATI */}
              <div className="detail-panel" id="p-r2">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span>Ranjangaon R2</span></div>
                <div className="page-title">Ranjangaon R2</div>
                <div className="page-subtitle" style={{marginBottom: 16}}>18 Lines · 4 Machines each · Same line structure as R1</div>
                <div className="kpi-mini-grid">
                  <div className="kpi-mini" style={{'--kc': '#2563EB'}}><div className="kpi-mini-val">18</div><div className="kpi-mini-label">Lines</div></div>
                  <div className="kpi-mini" style={{'--kc': '#059669'}}><div className="kpi-mini-val">95.8%</div><div className="kpi-mini-label">PM Compliance</div></div>
                  <div className="kpi-mini" style={{'--kc': '#DC2626'}}><div className="kpi-mini-val">6</div><div className="kpi-mini-label">Breakdowns</div></div>
                  <div className="kpi-mini" style={{'--kc': '#7C3AED'}}><div className="kpi-mini-val">95.4%</div><div className="kpi-mini-label">Availability</div></div>
                </div>
                <div className="alert alert-info">ℹ️ 18 lines configured. Click any line in the tree to drill down. Each line follows the same machine structure as Line 2502.</div>
              </div>
              <div className="detail-panel" id="p-mun">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span>Mundhwa</span></div>
                <div className="page-title">Mundhwa Plant</div><div className="page-subtitle" style={{marginBottom: 16}}>18 Lines · 4 Machines each</div>
                <div className="kpi-mini-grid">
                  <div className="kpi-mini" style={{'--kc': '#2563EB'}}><div className="kpi-mini-val">18</div><div className="kpi-mini-label">Lines</div></div>
                  <div className="kpi-mini" style={{'--kc': '#D97706'}}><div className="kpi-mini-val">93.2%</div><div className="kpi-mini-label">PM Compliance</div></div>
                  <div className="kpi-mini" style={{'--kc': '#DC2626'}}><div className="kpi-mini-val">9</div><div className="kpi-mini-label">Breakdowns</div></div>
                  <div className="kpi-mini" style={{'--kc': '#7C3AED'}}><div className="kpi-mini-val">92.7%</div><div className="kpi-mini-label">Availability</div></div>
                </div>
              </div>
              <div className="detail-panel" id="p-bar">
                <div className="hier-breadcrumb"><span className="hier-bc-item" onClick={(e) => { selectPanel('p-forging') }}>🏭 Forging</span><span className="hier-bc-sep">›</span><span>Baramati</span></div>
                <div className="page-title">Baramati Plant</div><div className="page-subtitle" style={{marginBottom: 16}}>18 Lines · 4 Machines each</div>
                <div className="kpi-mini-grid">
                  <div className="kpi-mini" style={{'--kc': '#2563EB'}}><div className="kpi-mini-val">18</div><div className="kpi-mini-label">Lines</div></div>
                  <div className="kpi-mini" style={{'--kc': '#059669'}}><div className="kpi-mini-val">96.1%</div><div className="kpi-mini-label">PM Compliance</div></div>
                  <div className="kpi-mini" style={{'--kc': '#DC2626'}}><div className="kpi-mini-val">5</div><div className="kpi-mini-label">Breakdowns</div></div>
                  <div className="kpi-mini" style={{'--kc': '#7C3AED'}}><div className="kpi-mini-val">95.9%</div><div className="kpi-mini-label">Availability</div></div>
                </div>
              </div>
              {/* MACHINING */}
              <div className="detail-panel" id="p-machining">
                <div className="hier-breadcrumb"><span>⚙️ Machining Division</span></div>
                <div className="page-title">Machining Division</div><div className="page-subtitle" style={{marginBottom: 16}}>4 Plants · Same line structure as Forging</div>
                <div className="kpi-mini-grid">
                  <div className="kpi-mini" style={{'--kc': '#2563EB'}}><div className="kpi-mini-val">4</div><div className="kpi-mini-label">Plants</div></div>
                  <div className="kpi-mini" style={{'--kc': '#059669'}}><div className="kpi-mini-val">94.8%</div><div className="kpi-mini-label">PM Compliance</div></div>
                  <div className="kpi-mini" style={{'--kc': '#DC2626'}}><div className="kpi-mini-val">11</div><div className="kpi-mini-label">Breakdowns</div></div>
                  <div className="kpi-mini" style={{'--kc': '#7C3AED'}}><div className="kpi-mini-val">94.2%</div><div className="kpi-mini-label">Availability</div></div>
                </div>
              </div>
              <div className="detail-panel" id="p-mach-plant" />
              <div className="detail-panel" id="p-generic-line" />
            </div>{/* /hier-detail */}
          </div>{/* /hier-layout */}
        </div>
        {/* ADD SPEC MODAL */}
        <div className="modal-overlay" id="specModal">
          <div className="modal">
            <div className="modal-header"><div className="modal-title" id="spec-modal-title">Add Machine Specification</div><button className="modal-close" onClick={(e) => { document.getElementById('specModal').classList.remove('open') }}>✕</button></div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Parameter Name</label><input className="form-input" id="spec-param" placeholder="e.g. Rated Power (kW)" /></div>
                <div className="form-group"><label className="form-label">Value</label><input className="form-input" id="spec-val" placeholder="e.g. 75" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Unit</label><input className="form-input" id="spec-unit" placeholder="kW, RPM, kg…" /></div>
                <div className="form-group"><label className="form-label">Category</label><select className="form-select" id="spec-cat"><option>Mechanical</option><option>Electrical</option><option>Hydraulic</option><option>Pneumatic</option><option>Performance</option><option>Safety</option></select></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={(e) => { document.getElementById('specModal').classList.remove('open') }}>Cancel</button><button className="btn btn-primary" onClick={(e) => { saveSpec() }}>Save Specification</button></div>
          </div>
        </div>
      </div>

    </>
  );
}