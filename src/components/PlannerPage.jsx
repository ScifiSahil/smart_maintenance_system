import React, { useEffect } from 'react';

/* ---------------------------------------------------------------
   Module-scope helpers (verbatim logic from the original page's
   <script> block). These are intentionally kept as plain JS,
   driving the DOM directly exactly as in the original demo.
------------------------------------------------------------------ */
const WF = {
  KEY: 'smartpm_workflow',
  getAll(){ try{return JSON.parse(localStorage.getItem(this.KEY)||'[]');}catch(e){return [];} },
  save(items){ localStorage.setItem(this.KEY,JSON.stringify(items)); localStorage.setItem('smartpm_sync',Date.now()); },
  planWO(id, data){
    const items=this.getAll(), item=items.find(i=>i.id===id);
    if(!item)return;
    const now=new Date();
    const ct=items.filter(i=>i.woRef).length;
    const woNum='WO-'+now.getFullYear()+'-'+String(2040+ct).padStart(4,'0');
    item.woRef=woNum; item.assignedTo=data.executor; item.allExecutors=data.allExecutors||data.executor;
    item.scheduledDate=data.date; item.scheduledTime=data.scheduledTime||'09:00';
    item.sparesNeeded=data.spares; item.estimatedHours=data.hours; item.plannerNotes=data.notes;
    item.sopRef=data.sopRef||'SOP-PM-001'; item.plant=data.plant||'Plant A'; item.location=data.location||'Utility Block';
    item.status='pending_executor'; item.plannedAt=now.toISOString();
    item.history.push({stage:'WO Raised by Planner',by:'Vishwas Landage',at:now.toISOString(),note:`${woNum} assigned to ${data.allExecutors||data.executor} for ${data.date} ${data.scheduledTime||'09:00'}. Spares: ${data.spares||'—'}`,icon:'📋'});
    this.save(items); return item;
  }
};

const PRIORITY_ORDER = {critical:0,high:1,medium:2,low:3};

let activePlanId=null;

function priBadge(p){
  const m={critical:'badge-critical',high:'badge-high',medium:'badge-medium',low:'badge-low'};
  const icons={critical:'🔴',high:'🟠',medium:'🟡',low:'🟢'};
  return `<span class="badge ${m[p]||'badge-closed'}">${icons[p]||''} ${p}</span>`;
}

function statusPill(s){
  const m={pending_planner:{cls:'wf-pill pending-planner',label:'📨 Awaiting Planning'},pending_executor:{cls:'wf-pill pending-executor',label:'🔧 Assigned to Executor'},pending_audit:{cls:'wf-pill pending-audit',label:'🔍 Pending Audit'},rework:{cls:'wf-pill rework',label:'🔁 Rework'},closed:{cls:'wf-pill closed',label:'✅ Closed'}};
  return `<span class="${(m[s]||{cls:'badge badge-closed'}).cls}">${(m[s]||{label:s}).label}</span>`;
}

function flowTrack(item){
  const stages=[{key:'logged',label:'Logged',icon:'⚠️'},{key:'planner',label:'Planner',icon:'📋'},{key:'executor',label:'Executor',icon:'🔧'},{key:'audit',label:'Audit',icon:'🔍'},{key:'closed',label:'Closed',icon:'✅'}];
  const stateMap={pending_planner:1,pending_executor:2,pending_audit:3,rework:3,closed:4};
  const activeIdx=stateMap[item.status]??0;
  const fail=item.status==='rework';
  let html='<div class="flow-track">';
  stages.forEach((s,i)=>{
    const done=i<activeIdx,active=i===activeIdx,isFail=fail&&i===3;
    const dotCls=isFail?'fail':done?'done':active?'active':'';
    html+=`<div class="flow-node"><div class="flow-node-dot ${dotCls}">${done?'✓':s.icon}</div><div class="flow-node-label ${active?'active':''}">${s.label}</div></div>`;
    if(i<stages.length-1)html+=`<div class="flow-connector ${done?'done':''}"></div>`;
  });
  return html+'</div>';
}

function renderIncomingCard(item){
  const isNew=item.status==='pending_planner';
  return `<div class="wf-card ${item.priority} ${isNew?'new-incoming':''}" id="plcard-${item.id}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:8px">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--blue-900)">⚠️ ${item.checkPoint}</div>
        <div style="font-size:11px;color:var(--slate-500);margin-top:2px">${item.loggedDate} ${item.loggedTime} · Logged by: ${item.loggedBy} · Machine: <strong>${item.machine}</strong></div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${priBadge(item.priority)}${statusPill(item.status)}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:12px;margin-bottom:8px">
      <div style="background:var(--slate-50);border-radius:6px;padding:8px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:2px">Observed</div>${item.observed||'—'}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:8px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:2px">Probable Cause</div>${item.cause||'—'}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:8px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:2px">Remarks</div>${item.remarks||'—'}</div>
    </div>
    ${flowTrack(item)}
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
      ${item.status==='pending_planner'?`<button class="btn btn-primary btn-sm" onclick="openPlanModal('${item.id}')">📋 Plan WO & Assign</button>`:''}
      <button class="btn btn-secondary btn-sm" onclick="openPlDetail('${item.id}')">📄 View Full Detail</button>
      ${item.woRef?`<span style="font-size:11px;color:var(--slate-600);font-weight:600;padding:5px 8px;background:var(--blue-50);border-radius:6px">WO: <strong style="font-family:var(--font-mono)">${item.woRef}</strong></span>`:''}
    </div>
  </div>`;
}

function renderIncoming(){
  const items=WF.getAll().sort((a,b)=>(PRIORITY_ORDER[a.priority]||3)-(PRIORITY_ORDER[b.priority]||3));
  const pending=items.filter(i=>i.status==='pending_planner');
  const raised=items.filter(i=>i.status!=='pending_planner'&&i.status!=='closed');
  const list=document.getElementById('pl-incoming-list');
  const empty=document.getElementById('pl-incoming-empty');
  document.getElementById('pl-stat-crit').textContent=items.filter(i=>i.priority==='critical'&&i.status==='pending_planner').length;
  document.getElementById('pl-stat-high').textContent=items.filter(i=>i.priority==='high'&&i.status==='pending_planner').length;
  document.getElementById('pl-stat-pending').textContent=pending.length;
  document.getElementById('pl-stat-raised').textContent=items.filter(i=>i.woRef).length;
  const badge=document.getElementById('pl-incoming-badge');
  if(badge)badge.textContent=pending.length;
  if(!items.length){if(empty)empty.style.display='flex';list.innerHTML='';return;}
  if(empty)empty.style.display='none';
  let html='';
  if(pending.length){html+=`<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--slate-400);letter-spacing:.5px;margin-bottom:8px">⚠️ Awaiting Planning (${pending.length})</div>`;html+=pending.map(i=>renderIncomingCard(i)).join('');}
  if(raised.length){html+=`<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--slate-400);letter-spacing:.5px;margin:16px 0 8px">📋 In Progress (${raised.length})</div>`;html+=raised.map(i=>renderIncomingCard(i)).join('');}
  list.innerHTML=html;
  document.getElementById('pl-incoming-sub').textContent=`${items.length} total · ${pending.length} awaiting WO · Last sync: ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`;
}

function renderWOTab(){
  const mach=document.getElementById('wo-mach')?.value||'all';
  const prio=document.getElementById('wo-prio')?.value||'all';
  const stat=document.getElementById('wo-stat')?.value||'all';
  let items=WF.getAll().filter(i=>i.woRef);
  if(mach!=='all')items=items.filter(i=>i.machine===mach);
  if(prio!=='all')items=items.filter(i=>i.priority===prio);
  if(stat!=='all')items=items.filter(i=>i.status===stat);
  items.sort((a,b)=>(PRIORITY_ORDER[a.priority]||3)-(PRIORITY_ORDER[b.priority]||3));
  const list=document.getElementById('pl-wo-list');
  const badge=document.getElementById('pl-wo-badge');
  if(badge)badge.textContent=WF.getAll().filter(i=>i.woRef).length;
  if(!items.length){list.innerHTML='<div class="alert alert-info">No WOs match the current filters.</div>';return;}
  list.innerHTML=items.map(item=>`
    <div class="wf-card ${item.priority}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--blue-900)">${item.woRef} — ${item.checkPoint}</div>
          <div style="font-size:11px;color:var(--slate-500);margin-top:2px">${item.machine} · Assigned: <strong>${item.assignedTo||'—'}</strong> · Scheduled: <strong>${item.scheduledDate||'—'}</strong></div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${priBadge(item.priority)}${statusPill(item.status)}</div>
      </div>
      ${flowTrack(item)}
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-ghost btn-sm" onclick="openPlDetail('${item.id}')">📄 Detail</button>
        ${item.status==='rework'?`<button class="btn btn-primary btn-sm" onclick="openPlanModal('${item.id}')">🔁 Re-Plan</button>`:''}
      </div>
    </div>
  `).join('');
}

function renderReworkTab(){
  const items=WF.getAll().filter(i=>i.status==='rework');
  const list=document.getElementById('pl-rework-list');
  const empty=document.getElementById('pl-rework-empty');
  const badge=document.getElementById('pl-rework-badge');
  if(badge)badge.textContent=items.length;
  if(!items.length){if(empty)empty.style.display='block';list.innerHTML='';return;}
  if(empty)empty.style.display='none';
  list.innerHTML=items.map(item=>`
    <div class="wf-card ${item.priority}" style="border-color:var(--red-border);background:#FFF9F9">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--red)">🔁 Rework #${item.reworkCount}: ${item.checkPoint}</div>
          <div style="font-size:11px;color:var(--slate-500);margin-top:2px">${item.machine} · Previous WO: <strong style="font-family:var(--font-mono)">${item.woRef||'—'}</strong></div>
          <div style="font-size:11px;color:var(--red);margin-top:2px">Audit failed — needs re-planning and re-assignment</div>
        </div>
        ${priBadge(item.priority)}
      </div>
      ${flowTrack(item)}
      <div style="margin-top:8px"><button class="btn btn-primary btn-sm" onclick="openPlanModal('${item.id}')">📋 Plan Rework WO</button></div>
    </div>
  `).join('');
}

function filterWOTab(){renderWOTab();}

function clearWOFilter(){
  ['wo-mach','wo-prio','wo-stat'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='all';});
  renderWOTab();
}

function openPlanModal(id){
  activePlanId=id;
  const item=WF.getAll().find(i=>i.id===id);
  if(!item)return;
  document.getElementById('plan-modal-title').textContent=item.status==='rework'?'🔁 Plan Rework WO':'📋 Plan Work Order — '+item.machine;
  document.getElementById('plan-abn-summary').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
      <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase">Abnormality</div>${item.checkPoint}</div>
      <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase">Machine</div>${item.machine}</div>
      <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase">Observed</div>${item.observed||'—'}</div>
      <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase">Priority</div>${item.priority}</div>
    </div>
    ${item.reworkCount>0?`<div style="margin-top:8px;font-size:11px;color:var(--red);font-weight:600">⚠️ Rework #${item.reworkCount} — Audit failed: check executor notes carefully</div>`:''}
  `;
  const today=new Date();
  const dd=p=>String(today.getDate()+p).padStart(2,'0');
  const mm=String(today.getMonth()+1).padStart(2,'0');
  document.getElementById('plan-date').value=`${today.getFullYear()}-${mm}-${String(today.getDate()+1).padStart(2,'0')}`;
  document.getElementById('plan-hours').value='';
  document.getElementById('plan-spares').value='';
  document.getElementById('plan-notes').value='';
  document.getElementById('plan-modal-error').style.display='none';
  document.getElementById('planModal').classList.add('open');
}

function submitPlan(){
  const executor=document.getElementById('plan-executor').value;
  const date=document.getElementById('plan-date').value;
  const hours=document.getElementById('plan-hours').value;
  const spares=document.getElementById('plan-spares').value;
  const notes=document.getElementById('plan-notes').value;
  const errEl=document.getElementById('plan-modal-error');
  if(!date){errEl.textContent='Please select a scheduled date.';errEl.style.display='flex';return;}
  errEl.style.display='none';
  const item=WF.planWO(activePlanId,{executor,date,hours,spares,notes});
  document.getElementById('planModal').classList.remove('open');
  refreshAll();
  showToast(`📋 WO ${item.woRef} raised & assigned to ${executor}!`,'success');
}

function openPlDetail(id){
  const item=WF.getAll().find(i=>i.id===id);
  if(!item)return;
  document.getElementById('pl-detail-title').textContent='📄 '+item.checkPoint;
  document.getElementById('pl-detail-body').innerHTML=`
    <div style="margin-bottom:14px">${flowTrack(item)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;margin-bottom:14px">
      <div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Machine</div>${item.machine}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Priority</div>${item.priority}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Observed</div>${item.observed||'—'}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Cause</div>${item.cause||'—'}</div>
      ${item.woRef?`<div style="background:var(--blue-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">WO Reference</div><strong style="font-family:var(--font-mono)">${item.woRef}</strong></div>`:''}
      ${item.assignedTo?`<div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Assigned To</div>${item.assignedTo}</div>`:''}
      ${item.scheduledDate?`<div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Scheduled Date</div>${item.scheduledDate}</div>`:''}
      ${item.sparesNeeded?`<div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Spares Needed</div>${item.sparesNeeded}</div>`:''}
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--slate-500);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Workflow Timeline</div>
    <div>${item.history.map(h=>`<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--slate-100)">
      <div style="width:24px;height:24px;border-radius:50%;background:var(--blue-50);border:1.5px solid var(--blue-200);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">${h.icon||'📌'}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:700;color:var(--blue-900)">${h.stage}</div><div style="font-size:11px;color:var(--slate-400)">${h.by} · ${new Date(h.at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>${h.note?`<div style="font-size:11px;color:var(--slate-600);margin-top:2px">${h.note}</div>`:''}</div>
    </div>`).join('')}</div>
  `;
  document.getElementById('plDetailModal').classList.add('open');
}

function showTab(name,el){
  document.querySelectorAll('[id^="tab-"]').forEach(t=>t.style.display='none');
  document.getElementById('tab-'+name).style.display='block';
  document.querySelectorAll('.sidebar-link').forEach(l=>l.classList.remove('active'));
  if(el)el.classList.add('active');
  if(name==='consol')renderConsolTab();
  else if(name==='incoming')renderIncoming();
  else if(name==='workorders')renderWOTab();
  else if(name==='rework')renderReworkTab();
  else if(name==='checker-cal'){const n=new Date();plBuildCkCal(plCkYear||n.getFullYear(),plCkMonth!==undefined?plCkMonth:n.getMonth());}
  else if(name==='executor-cal')renderExCal();
}

function refreshAll(){
  const active=document.querySelector('[id^="tab-"]:not([style*="none"])');
  if(active){const n=active.id.replace('tab-','');showTab(n,null);}
}

const PL_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

const PL_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

let plCkYear,plCkMonth,plCkEvents={};

function plSeedCkEvents(year,month){
  plCkEvents={};
  const k=d=>`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const dim=new Date(year,month+1,0).getDate();
  for(let d=1;d<=dim;d++){
    const dow=new Date(year,month,d).getDay();
    if(dow===0||dow===6)continue;
    if(d%2===0){if(!plCkEvents[k(d)])plCkEvents[k(d)]=[];plCkEvents[k(d)].push({type:'insp',label:'CP-101 Daily PM',time:'08:00',icon:'⚙️'});}
    if(dow===1&&d<=22){if(!plCkEvents[k(d)])plCkEvents[k(d)]=[];plCkEvents[k(d)].push({type:'insp',label:'HX-204 Weekly PM',time:'14:00',icon:'🔥'});}
    if(d<=5){if(!plCkEvents[k(d)])plCkEvents[k(d)]=[];plCkEvents[k(d)].push({type:'overdue',label:'COM-302 PM — OVERDUE',time:'—',icon:'💨'});}
  }
  WF.getAll().forEach(item=>{
    if(item.loggedAt){
      const dt=new Date(item.loggedAt);
      if(dt.getFullYear()===year&&dt.getMonth()===month){
        const kk=k(dt.getDate());
        if(!plCkEvents[kk])plCkEvents[kk]=[];
        plCkEvents[kk].push({type:'wo',label:'ABN: '+item.checkPoint+(item.woRef?' · '+item.woRef:''),time:item.loggedTime,icon:'⚠️',status:item.status,id:item.id});
      }
    }
  });
}

function plBuildCkCal(year,month){
  plCkYear=year;plCkMonth=month;
  plSeedCkEvents(year,month);
  const n=new Date(),ty=n.getFullYear(),tm=n.getMonth(),td=n.getDate();
  document.getElementById('pl-ck-label').textContent=PL_MONTHS[month]+' '+year;
  document.getElementById('pl-ck-sub').textContent='Sandeep Tapkir · '+PL_MONTHS[month]+' '+year;
  const grid=document.getElementById('pl-ck-grid');
  grid.innerHTML='';
  PL_DAYS.forEach(d=>{const h=document.createElement('div');h.className='cal-day-header';h.textContent=d;grid.appendChild(h);});
  const firstDow=new Date(year,month,1).getDay();
  const offset=firstDow===0?6:firstDow-1;
  const dimPrev=new Date(year,month,0).getDate();
  const dim=new Date(year,month+1,0).getDate();
  for(let i=offset-1;i>=0;i--){const c=document.createElement('div');c.className='cal-day';c.style.color='var(--slate-300)';c.textContent=dimPrev-i;grid.appendChild(c);}
  for(let d=1;d<=dim;d++){
    const dk=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const evs=plCkEvents[dk]||[];
    const isToday=year===ty&&month===tm&&d===td;
    const hasOver=evs.some(e=>e.type==='overdue'),hasWO=evs.some(e=>e.type==='wo'),hasInsp=evs.some(e=>e.type==='insp');
    let cls='cal-day';if(isToday)cls+=' today';if(hasOver)cls+=' has-overdue';else if(hasWO)cls+=' has-wo';else if(hasInsp)cls+=' has-task';
    const cell=document.createElement('div');cell.className=cls;cell.innerHTML=`<span>${d}</span>`;
    if(evs.length>0){
      const dot=document.createElement('span');dot.style.cssText='position:absolute;bottom:3px;left:50%;transform:translateX(-50%);display:flex;gap:2px';
      evs.slice(0,3).forEach(ev=>{const dd=document.createElement('span');dd.style.cssText=`width:4px;height:4px;border-radius:50%;background:${ev.type==='overdue'?'var(--red)':ev.type==='wo'?'var(--amber)':isToday?'white':'var(--green)'}`;dot.appendChild(dd);});
      cell.appendChild(dot);cell.style.cursor='pointer';
      cell.addEventListener('click',()=>plShowCkDay(d,month,year,dk,evs,isToday));
    }
    grid.appendChild(cell);
  }
  const rem=(offset+dim)%7===0?0:7-(offset+dim)%7;
  for(let d=1;d<=rem;d++){const c=document.createElement('div');c.className='cal-day';c.style.color='var(--slate-300)';c.textContent=d;grid.appendChild(c);}
}

function plShowCkDay(day,month,year,dk,evs,isToday){
  const dt=document.getElementById('pl-ck-detail'),tl=document.getElementById('pl-ck-detail-title'),body=document.getElementById('pl-ck-detail-body');
  tl.textContent='📅 '+new Date(year,month,day).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})+(isToday?' — TODAY':'');
  let html='<div style="display:flex;flex-direction:column;gap:8px">';
  if(!evs.length)html+='<div style="color:var(--slate-400);font-size:13px">No tasks this day.</div>';
  else evs.forEach(ev=>{
    const b=ev.type==='overdue'?'badge-abnormal':ev.type==='wo'?'badge-pending':'badge-ok';
    const bl=ev.type==='overdue'?'Overdue':ev.type==='wo'?'WO Logged':'Inspection';
    html+=`<div style="display:flex;align-items:center;gap:10px;background:white;border-radius:var(--radius);padding:10px 12px;border:1px solid var(--slate-200)">
      <span style="font-size:18px">${ev.icon||'📋'}</span>
      <div style="flex:1"><div style="font-size:13px;font-weight:600">${ev.label}</div><div style="font-size:11px;color:var(--slate-500)">${ev.time}</div></div>
      <span class="badge ${b}">${bl}</span>
      ${ev.id?`<button class="btn btn-ghost btn-sm" onclick="openPlDetail('${ev.id}')">Detail</button>`:''}
    </div>`;
  });
  html+='</div>';body.innerHTML=html;dt.style.display='block';
}

function plCkNav(dir){plCkMonth+=dir;if(plCkMonth>11){plCkMonth=0;plCkYear++;}if(plCkMonth<0){plCkMonth=11;plCkYear--;}plBuildCkCal(plCkYear,plCkMonth);}

function plCkToday(){const n=new Date();plBuildCkCal(n.getFullYear(),n.getMonth());}

function renderExCal(){
  const now=new Date();
  document.getElementById('pl-ex-date').textContent=now.toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  const items=WF.getAll().filter(i=>i.assignedTo);
  const exMap={};
  items.forEach(item=>{const ex=item.assignedTo;if(!exMap[ex])exMap[ex]=[];exMap[ex].push(item);});
  const all=['Manoj Shinde','Pradeep Jadhav','Rakesh Patil','Suresh Kulkarni','Dinesh Wagh','Amol Deshmukh','Nilesh More'];
  let html='<div class="table-wrap"><table><thead><tr><th>Executor</th><th>Role</th><th>Assigned WOs</th><th>Status</th></tr></thead><tbody>';
  all.forEach(ex=>{
    const wos=exMap[ex]||[];
    const roles={Manoj:'Mech L3',Pradeep:'Mech L2',Rakesh:'Mech L2',Suresh:'Elect L2',Dinesh:'Mech L2',Amol:'Mech L1',Nilesh:'Mech L1'};
    const role=Object.entries(roles).find(([k])=>ex.startsWith(k))?.[1]||'Mech';
    const woHtml=wos.length?wos.map(w=>`<span class="badge badge-${w.priority==='critical'?'critical':w.priority==='high'?'high':'medium'}" style="margin:2px">${w.woRef||'—'} ${w.machine}</span>`).join(' '):'<span style="color:var(--slate-400);font-size:12px">Free</span>';
    html+=`<tr><td><strong>${ex}</strong></td><td><span style="font-size:11px;color:var(--slate-400)">${role}</span></td><td>${woHtml}</td><td>${wos.length?`<span class="badge badge-progress">${wos.length} Active</span>`:'<span class="badge badge-closed">Available</span>'}</td></tr>`;
  });
  html+='</tbody></table></div>';
  document.getElementById('pl-ex-schedule').innerHTML=html;
}

const SOP_MAP = {
  'bearing': {sop:'SOP-MR-014', title:'Bearing Replacement', man:'Mech Tech L3 × 2 persons', machine_note:'LOTO required', material:'Bearing 6308 ZZ × 2', matStatus:'ok', method:'SOP-MR-014 · Bearing Replacement', hours:'3–4h'},
  'vibration': {sop:'SOP-MR-014', title:'Bearing Replacement', man:'Mech Tech L3 × 2 persons', machine_note:'LOTO required', material:'Bearing 6308 ZZ × 2', matStatus:'ok', method:'SOP-MR-014 · Bearing Replacement', hours:'3–4h'},
  'temp': {sop:'SOP-LUB-003', title:'Oil Top-Up / Cooling Check', man:'Mech Tech L2 × 1 person', machine_note:'Running check — no isolation', material:'ISO VG 68 Oil × 1 can', matStatus:'ok', method:'SOP-LUB-003 · Oil Top-Up', hours:'1–2h'},
  'oil': {sop:'SOP-LUB-003', title:'Oil Top-Up', man:'Mech Tech L2 × 1 person', machine_note:'Running check — no isolation', material:'ISO VG 68 Oil × 2 cans', matStatus:'ok', method:'SOP-LUB-003 · Oil Top-Up Protocol', hours:'30 min'},
  'seal': {sop:'SOP-PM-003', title:'Mechanical Seal Inspection', man:'Mech Tech L3 × 2 persons', machine_note:'LOTO required', material:'Mech Seal Kit × 1', matStatus:'low', method:'SOP-PM-003 · Seal Inspection', hours:'4–5h'},
  'motor': {sop:'SOP-EL-007', title:'Motor Overload Investigation', man:'Elect Tech L2 × 1 person', machine_note:'MCC isolation required', material:'Contactor 63A × 1', matStatus:'oos', method:'SOP-EL-007 · Motor Investigation', hours:'2–3h'},
  'current': {sop:'SOP-EL-007', title:'Motor Current Investigation', man:'Elect Tech L2 × 1 person', machine_note:'MCC check — partial isolation', material:'Clamp meter + test leads', matStatus:'ok', method:'SOP-EL-007 · Motor Overload', hours:'1–2h'},
  'coupling': {sop:'SOP-PM-001', title:'Guard & Coupling Check', man:'Mech Tech L2 × 1 person', machine_note:'Visual only — guard bolts', material:'M12 bolts × 4, Lock washers', matStatus:'ok', method:'SOP-PM-001-T5 · Guard Integrity', hours:'1h'},
  'default': {sop:'SOP-PM-001', title:'General PM Inspection', man:'Mech Tech L2 × 1 person', machine_note:'Refer WO for isolation', material:'General consumables', matStatus:'ok', method:'SOP-PM-001 · PM Inspection', hours:'2–3h'},
};

function getSOP(item) {
  const cp = (item.checkPoint||'').toLowerCase();
  const obs = (item.observed||'').toLowerCase();
  if(cp.includes('vibration')||obs.includes('vibration')||obs.includes('mm/s')) return SOP_MAP.vibration;
  if(cp.includes('bearing')||obs.includes('bearing')) return SOP_MAP.bearing;
  if(cp.includes('temp')||obs.includes('°c')||obs.includes('temperature')) return SOP_MAP.temp;
  if(cp.includes('oil')||obs.includes('oil')||obs.includes('lube')) return SOP_MAP.oil;
  if(cp.includes('seal')) return SOP_MAP.seal;
  if(cp.includes('motor')||cp.includes('current')||obs.includes('current')) return SOP_MAP.current;
  if(cp.includes('guard')||cp.includes('coupling')) return SOP_MAP.coupling;
  return SOP_MAP.default;
}

let consolExecRows = {};

function getConsolExecRows(id) {
  if(!consolExecRows[id]) {
    consolExecRows[id] = [{executor:'Manoj Shinde', datetime:'', role:'Lead'}];
  }
  return consolExecRows[id];
}

function matStatusHtml(s) {
  if(s==='ok') return '<span class="avail-ok">✓ Available</span>';
  if(s==='low') return '<span class="avail-low">⚠ Low Stock</span>';
  if(s==='oos') return '<span class="avail-oos">✗ Out of Stock</span>';
  return '';
}

function priColor(p) {
  return p==='critical'?'var(--red)':p==='high'?'var(--amber)':p==='medium'?'#FBBF24':'var(--green)';
}

function renderConsolCard(item) {
  const sop = getSOP(item);
  const rows = getConsolExecRows(item.id);
  const today = new Date();
  const defDate = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()+1).padStart(2,'0')+'T09:00';

  const execRowsHtml = rows.map((r,idx) => `
    <div class="exec-assign-row" id="execrow-${item.id}-${idx}">
      <div class="exec-num">${idx+1}</div>
      <select class="form-select" style="flex:2;min-width:180px;font-size:12px" onchange="updExecRow('${item.id}',${idx},'executor',this.value)">
        ${['Manoj Shinde (Mech L3)','Pradeep Jadhav (Mech L2)','Rakesh Patil (Mech L2)','Suresh Kulkarni (Elect L2)','Dinesh Wagh (Mech L2)','Amol Deshmukh (Mech L1)','Nilesh More (Mech L1)'].map(e=>`<option ${r.executor===e.split(' (')[0]?'selected':''}>${e}</option>`).join('')}
      </select>
      <input type="datetime-local" class="form-input" style="width:180px;font-size:12px" value="${r.datetime||defDate}" onchange="updExecRow('${item.id}',${idx},'datetime',this.value)"/>
      <select class="form-select" style="width:110px;font-size:12px" onchange="updExecRow('${item.id}',${idx},'role',this.value)">
        ${['Lead','Support','Observe'].map(rl=>`<option ${r.role===rl?'selected':''}>${rl}</option>`).join('')}
      </select>
      ${idx>0?`<button style="background:none;border:none;color:var(--red);cursor:pointer;font-size:18px;line-height:1;padding:0 4px" onclick="removeExecRow('${item.id}',${idx})">×</button>`:'<span style="width:24px"></span>'}
    </div>
  `).join('');

  const isAlreadyWO = item.status !== 'pending_planner';

  return `<div class="consol-card" style="position:relative" id="consol-card-${item.id}">
    <div style="position:absolute;left:0;top:0;bottom:0;width:5px;background:${priColor(item.priority)};border-radius:var(--radius-lg) 0 0 var(--radius-lg)"></div>
    <div class="consol-card-header" style="padding-left:22px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="width:10px;height:10px;border-radius:50%;background:${priColor(item.priority)};flex-shrink:0"></span>
        <span class="badge ${item.priority==='critical'?'badge-critical':item.priority==='high'?'badge-high':'badge-medium'}">${item.priority.charAt(0).toUpperCase()+item.priority.slice(1)}</span>
        <span style="font-size:15px;font-weight:700;color:var(--blue-900)">${item.machine} — ${item.checkPoint}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        ${isAlreadyWO ? `<span class="wf-pill pending-executor">WO: ${item.woRef}</span>` : ''}
        <span style="font-size:11px;color:var(--slate-500)">• Manual + IIoT</span>
        <a class="sop-link" href="#" onclick="alert('Opening ${sop.sop}')">📖 ${sop.sop}</a>
      </div>
    </div>

    <!-- 4M Grid -->
    <div class="consol-4m">
      <div class="consol-4m-cell">
        <div class="consol-4m-label">👤 MAN</div>
        <div class="consol-4m-value">${sop.man}</div>
      </div>
      <div class="consol-4m-cell">
        <div class="consol-4m-label">⚙️ MACHINE</div>
        <div class="consol-4m-value">${item.machine} — ${sop.machine_note}</div>
      </div>
      <div class="consol-4m-cell">
        <div class="consol-4m-label">🔩 MATERIAL</div>
        <div class="consol-4m-value">${sop.material} · ${matStatusHtml(sop.matStatus)}</div>
      </div>
      <div class="consol-4m-cell">
        <div class="consol-4m-label">📖 METHOD</div>
        <div class="consol-4m-value">${sop.method}</div>
      </div>
    </div>

    <!-- Assign Executors -->
    ${!isAlreadyWO ? `
    <div style="padding:14px 18px 6px 22px">
      <div style="font-size:13px;font-weight:700;color:var(--blue-900);margin-bottom:10px">Assign Executors</div>
      <div id="exec-rows-${item.id}">${execRowsHtml}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:6px;color:var(--blue-500)" onclick="addExecRow('${item.id}')">+ Add Executor</button>
    </div>
    <div style="padding:12px 18px 16px 22px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="generateWO('${item.id}')">⚡ Generate WO &amp; Assign</button>
      <button class="btn btn-secondary btn-sm" onclick="openPlDetail('${item.id}')">📄 View Detail</button>
      <span style="font-size:11px;color:var(--slate-400)">Est. ${sop.hours}</span>
    </div>
    ` : `
    <div style="padding:12px 18px 14px 22px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid var(--slate-100)">
      <span class="badge badge-progress">WO Generated — ${item.assignedTo||'—'}</span>
      <span style="font-size:11px;color:var(--slate-500)">Scheduled: ${item.scheduledDate||'—'}</span>
      <button class="btn btn-ghost btn-sm" onclick="openPlDetail('${item.id}')">📄 Detail</button>
    </div>
    `}
  </div>`;
}

function renderConsolTab() {
  const items = WF.getAll().sort((a,b)=>(PRIORITY_ORDER[a.priority]||3)-(PRIORITY_ORDER[b.priority]||3));
  const list = document.getElementById('consol-list');
  const empty = document.getElementById('consol-empty');
  const now = new Date();
  document.getElementById('consol-sub').textContent = 'Vishwas Landage · ' + now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) + ' · Manual + IIoT Merged';
  document.getElementById('cs-crit').textContent = items.filter(i=>i.priority==='critical').length;
  document.getElementById('cs-high').textContent = items.filter(i=>i.priority==='high').length;
  document.getElementById('cs-med').textContent = items.filter(i=>i.priority==='medium').length;
  document.getElementById('cs-wo').textContent = items.filter(i=>i.woRef).length;
  const cb = document.getElementById('pl-consol-badge');
  if(cb) cb.textContent = items.filter(i=>i.status==='pending_planner').length;
  if(!items.length) { if(empty)empty.style.display='flex'; list.innerHTML=''; return; }
  if(empty) empty.style.display='none';
  list.innerHTML = items.map(i=>renderConsolCard(i)).join('');
}

function updExecRow(id, idx, field, val) {
  if(!consolExecRows[id]) consolExecRows[id]=[{executor:'Manoj Shinde',datetime:'',role:'Lead'}];
  consolExecRows[id][idx][field] = val;
}

function addExecRow(id) {
  if(!consolExecRows[id]) consolExecRows[id]=[];
  consolExecRows[id].push({executor:'Pradeep Jadhav',datetime:'',role:'Support'});
  renderConsolTab();
}

function removeExecRow(id, idx) {
  if(consolExecRows[id]) consolExecRows[id].splice(idx,1);
  renderConsolTab();
}

function generateWO(id) {
  const rows = consolExecRows[id] || [{executor:'Manoj Shinde', datetime:'', role:'Lead'}];
  const lead = rows.find(r=>r.role==='Lead') || rows[0];
  if(!lead) { showToast('Please assign at least one executor.','error'); return; }
  const execName = lead.executor.split(' (')[0];
  const dtVal = lead.datetime;
  // Extract date part from datetime-local value
  const datePart = dtVal ? dtVal.split('T')[0] : new Date().toISOString().split('T')[0];
  const timePart = dtVal ? dtVal.split('T')[1]||'09:00' : '09:00';
  const sop = getSOP(WF.getAll().find(i=>i.id===id)||{});
  const allExecs = rows.map(r=>`${r.executor.split(' (')[0]} (${r.role})`).join(', ');

  const item = WF.planWO(id, {
    executor: execName,
    allExecutors: allExecs,
    date: datePart,
    scheduledTime: timePart,
    hours: sop.hours,
    spares: sop.material,
    notes: `SOP: ${sop.sop} · ${sop.method} · Team: ${allExecs}`,
    sopRef: sop.sop,
    plant: 'Plant A',
    location: 'Utility Block'
  });
  renderConsolTab();
  updateBadges();
  showToast(`⚡ WO ${item.woRef} generated & assigned to ${allExecs}!`, 'success');
}

function showToast(msg,type){
  let t=document.getElementById('wf-toast');
  if(!t){t=document.createElement('div');t.id='wf-toast';t.style.cssText='position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:var(--radius-lg);font-size:13px;font-weight:600;z-index:9999;box-shadow:var(--shadow-lg);max-width:360px;transition:opacity .3s';document.body.appendChild(t);}
  t.style.background=type==='error'?'var(--red-light)':type==='success'?'var(--green-light)':'var(--blue-50)';
  t.style.color=type==='error'?'#991B1B':type==='success'?'#065F46':'#1E40AF';
  t.style.border=`1px solid ${type==='error'?'var(--red-border)':type==='success'?'var(--green-border)':'#BFDBFE'}`;
  t.textContent=msg;t.style.opacity='1';
  clearTimeout(t._timer);t._timer=setTimeout(()=>t.style.opacity='0',3000);
}

function updateBadges(){
  const items=WF.getAll();
  const ib=document.getElementById('pl-incoming-badge');if(ib)ib.textContent=items.filter(i=>i.status==='pending_planner').length;
  const wb=document.getElementById('pl-wo-badge');if(wb)wb.textContent=items.filter(i=>i.woRef).length;
  const rb=document.getElementById('pl-rework-badge');if(rb)rb.textContent=items.filter(i=>i.status==='rework').length;
}

export default function PlannerPage({ onNavigate }) {
  useEffect(() => {
    function t(){var n=new Date();document.getElementById('pl-clock').textContent=n.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}t();const _iv = setInterval(t, 1000);
        return () => clearInterval(_iv);
  }, []);

  useEffect(() => {
    const cleanups = [];
    const _storageHandler = e=>{if(e.key==='smartpm_sync'){refreshAll();updateBadges();}};
        window.addEventListener('storage', _storageHandler);
        cleanups.push(() => window.removeEventListener('storage', _storageHandler));
    (()=>{
      const n=new Date();plCkYear=n.getFullYear();plCkMonth=n.getMonth();
      renderConsolTab();updateBadges();
      setInterval(()=>{const active=document.querySelector('[id^="tab-"]:not([style*="none"])');if(active&&active.id==='tab-incoming')renderIncoming();updateBadges();},5000);
    })();
    return () => { cleanups.forEach(fn => fn()); };
  }, []);

  return (
    <>
      <style>{`

.wf-card{background:white;border-radius:var(--radius-lg);border:1.5px solid var(--slate-200);padding:16px 18px;margin-bottom:10px;transition:all .2s;position:relative;overflow:hidden}
.wf-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px}
.wf-card.critical::before{background:var(--red)}
.wf-card.high::before{background:var(--amber)}
.wf-card.medium::before{background:#FBBF24}
.wf-card.low::before{background:var(--green)}
.wf-new{animation:highlightNew .8s ease}
@keyframes highlightNew{0%{background:#ECFDF5;transform:translateX(-6px)}100%{background:white;transform:translateX(0)}}
.wf-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
.wf-pill.pending-planner{background:#EFF6FF;color:#1E40AF}
.wf-pill.pending-executor{background:#FFFBEB;color:#92400E}
.wf-pill.pending-audit{background:#ECFEFF;color:#155E75}
.wf-pill.rework{background:#FFF1F2;color:#9F1239}
.wf-pill.closed{background:#ECFDF5;color:#065F46}
.flow-track{display:flex;align-items:center;gap:0;margin:10px 0 4px;flex-wrap:nowrap;overflow-x:auto}
.flow-node{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:70px;flex-shrink:0}
.flow-node-dot{width:24px;height:24px;border-radius:50%;border:2px solid var(--slate-300);background:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--slate-400)}
.flow-node-dot.done{background:var(--green);border-color:var(--green);color:white}
.flow-node-dot.active{background:var(--blue-500);border-color:var(--blue-500);color:white;box-shadow:0 0 0 3px rgba(37,99,235,.2)}
.flow-node-dot.fail{background:var(--red);border-color:var(--red);color:white}
.flow-node-label{font-size:9px;color:var(--slate-400);text-align:center;line-height:1.3;font-weight:600;text-transform:uppercase;letter-spacing:.3px}
.flow-node-label.active{color:var(--blue-500)}
.flow-connector{flex:1;height:2px;background:var(--slate-200);min-width:16px}
.flow-connector.done{background:var(--green)}
.wo-filter-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:white;border:1px solid var(--slate-200);border-radius:var(--radius-lg);padding:12px 16px;margin-bottom:14px}
.wo-filter-bar label{font-size:11px;font-weight:700;color:var(--slate-500);white-space:nowrap;text-transform:uppercase;letter-spacing:.5px}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-day-header{text-align:center;font-size:10px;font-weight:700;color:var(--slate-400);padding:4px}
.cal-day{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;position:relative;transition:all .15s}
.cal-day:hover{background:var(--blue-50)}
.cal-day.today{background:var(--blue-500);color:white;font-weight:700}
.cal-day.has-task::after{content:'';position:absolute;bottom:3px;width:4px;height:4px;border-radius:50%;background:var(--green)}
.cal-day.today.has-task::after{background:white}
.cal-day.has-wo::after{background:var(--amber)}
.cal-day.has-overdue::after{background:var(--red)}
.new-incoming{border-color:var(--blue-400);box-shadow:0 0 0 2px rgba(37,99,235,.15)}

/* Consolidated Action Card — Screenshot format */
.consol-card{background:white;border-radius:var(--radius-lg);border:1.5px solid var(--slate-200);margin-bottom:16px;overflow:hidden;box-shadow:var(--shadow)}
.consol-card-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px 12px;flex-wrap:wrap;gap:8px}
.consol-pri-bar{position:absolute;left:0;top:0;bottom:0;width:5px}
.consol-4m{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--slate-200);border-top:1px solid var(--slate-200)}
.consol-4m-cell{background:white;padding:12px 16px}
.consol-4m-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--slate-400);margin-bottom:4px;display:flex;align-items:center;gap:5px}
.consol-4m-value{font-size:13px;color:var(--blue-900);font-weight:500}
.avail-ok{color:var(--green);font-weight:600}
.avail-low{color:var(--amber);font-weight:600}
.avail-oos{color:var(--red);font-weight:600}
.exec-assign-row{display:flex;align-items:center;gap:8px;padding:8px 0;flex-wrap:wrap}
.exec-assign-row:not(:last-child){border-bottom:1px solid var(--slate-100)}
.exec-num{width:22px;height:22px;border-radius:50%;background:var(--blue-50);border:1.5px solid #BFDBFE;font-size:11px;font-weight:700;color:var(--blue-500);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sop-link{color:var(--blue-500);font-size:12px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px}
.sop-link:hover{text-decoration:underline}


`}</style>
      <div>
        <nav className="top-nav">
          <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}><div className="nav-logo-icon">📋</div><div><div className="nav-logo-text">SmartPM</div><div className="nav-logo-sub">Planner Portal</div></div></a>
          <div className="nav-spacer" />
          <select className="form-select" style={{width: 100, fontSize: 12, padding: '5px 8px'}}><option>All Plants</option><option>Plant A</option><option>Plant B</option></select>
          <select className="form-select" style={{width: 90, fontSize: 12, padding: '5px 8px', marginLeft: 6}}><option>All Lines</option><option>Line 1</option><option>Line 2</option></select>
          <div className="nav-role-badge" style={{marginLeft: 8}}><div className="nav-role-dot" style={{background: '#2563EB'}} /><span className="nav-role-name">Vishwas Landage · Planner</span></div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="nav-home-btn" style={{marginLeft: 8}}>← Home</a>
          <div id="pl-clock" style={{color: 'rgba(255,255,255,.5)', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 10}} />
        </nav>
        <div className="app-layout">
          <aside className="sidebar">
            <div className="sidebar-section-label">Workflow</div>
            <a href="#" className="sidebar-link" id="sb-incoming" onClick={(e) => { showTab('incoming',e.currentTarget) }}><span className="link-icon">📨</span>Incoming Abnormalities<span className="sidebar-badge" id="pl-incoming-badge">0</span></a>
            <a href="#" className="sidebar-link active" id="sb-consol" onClick={(e) => { showTab('consol',e.currentTarget) }}><span className="link-icon">📑</span>Consolidated List<span className="sidebar-badge" id="pl-consol-badge">0</span></a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('workorders',e.currentTarget) }}><span className="link-icon">📋</span>Work Orders<span className="sidebar-badge blue" id="pl-wo-badge">0</span></a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('rework',e.currentTarget) }}><span className="link-icon">🔁</span>Rework Queue<span className="sidebar-badge" id="pl-rework-badge">0</span></a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Calendars</div>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('checker-cal',e.currentTarget) }}><span className="link-icon">🔍</span>Checker Calendar</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('executor-cal',e.currentTarget) }}><span className="link-icon">🔧</span>Executor Calendar</a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Reference</div>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('spares',e.currentTarget) }}><span className="link-icon">🔩</span>Spare Parts</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('soplibrary',e.currentTarget) }}><span className="link-icon">📖</span>SOP Library</a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Navigate</div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('checker'); }} className="sidebar-link"><span className="link-icon">🔍</span>Checker View</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('executor'); }} className="sidebar-link"><span className="link-icon">🔧</span>Executor View</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className="sidebar-link"><span className="link-icon">📊</span>Mentor Dashboard</a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Quick Actions</div>
            <div style={{padding: '4px 12px 12px'}}>
              <button className="quick-action-btn" onClick={(e) => { showTab('incoming',document.getElementById('sb-incoming')) }}>📨 Review Incoming</button>
              <button className="quick-action-btn" onClick={(e) => { showTab('workorders',document.querySelector('[onclick*=workorders]')) }}>+ New Work Order</button>
              <button className="quick-action-btn" onClick={(e) => { showTab('rework',document.querySelector('[onclick*=rework]')) }}>🔁 Rework Queue</button>
            </div>
          </aside>
          <main className="main-content">
            {/* ══ CONSOLIDATED LIST TAB ══ */}
            <div id="tab-consol">
              <div className="page-header">
                <div className="breadcrumb"><span>Planner</span><span className="breadcrumb-sep">›</span>Consolidated List</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8}}>
                  <div>
                    <div className="page-title">Consolidated Repair / Action List</div>
                    <div className="page-subtitle" id="consol-sub">Vishwas Landage · Manual + IIoT Merged</div>
                  </div>
                  <div style={{display: 'flex', gap: 8}}>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { refreshAll() }}>⟳ Refresh</button>
                    <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--green)', fontWeight: 600}}><span style={{width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block'}} />Live</div>
                  </div>
                </div>
              </div>
              <div className="stat-grid" style={{marginBottom: 20}}>
                <div className="stat-card" style={{'--stat-color': '#DC2626'}}><div className="stat-label">CRITICAL</div><div className="stat-value" id="cs-crit">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#D97706'}}><div className="stat-label">HIGH</div><div className="stat-value" id="cs-high">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#FBBF24'}}><div className="stat-label">MEDIUM</div><div className="stat-value" id="cs-med">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#059669'}}><div className="stat-label">WOS GENERATED</div><div className="stat-value" id="cs-wo">0</div></div>
              </div>
              <div id="consol-empty" className="alert alert-info" style={{display: 'none'}}>ℹ️ No abnormalities from Checker yet.</div>
              <div id="consol-list" />
            </div>
            {/* ══ INCOMING TAB ══ */}
            <div id="tab-incoming">
              <div className="page-header">
                <div className="breadcrumb"><span>Planner</span><span className="breadcrumb-sep">›</span>Incoming Abnormalities</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8}}>
                  <div><div className="page-title">Incoming Abnormalities</div><div className="page-subtitle" id="pl-incoming-sub">Logged by Checker in real time — review and raise WOs</div></div>
                  <div style={{display: 'flex', gap: 8}}>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { refreshAll() }}>⟳ Refresh</button>
                    <div id="pl-live-pulse" style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--green)', fontWeight: 600}}><span style={{width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block'}} />Live</div>
                  </div>
                </div>
              </div>
              <div className="stat-grid" style={{marginBottom: 14}}>
                <div className="stat-card" style={{'--stat-color': '#DC2626'}}><div className="stat-label">🔴 Critical</div><div className="stat-value" id="pl-stat-crit">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#D97706'}}><div className="stat-label">🟠 High</div><div className="stat-value" id="pl-stat-high">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#2563EB'}}><div className="stat-label">Awaiting WO</div><div className="stat-value" id="pl-stat-pending">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#059669'}}><div className="stat-label">WOs Raised</div><div className="stat-value" id="pl-stat-raised">0</div></div>
              </div>
              <div id="pl-incoming-empty" className="alert alert-info" style={{display: 'none'}}>ℹ️ No new abnormalities from Checker yet. Check back or ask Checker to run inspection.</div>
              <div id="pl-incoming-list" />
            </div>
            {/* ══ WORK ORDERS TAB ══ */}
            <div id="tab-workorders" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Planner</span><span className="breadcrumb-sep">›</span>Work Orders</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8}}>
                  <div><div className="page-title">Work Orders</div><div className="page-subtitle">All WOs raised · Filter by plant/line/machine/priority/status</div></div>
                  <div style={{display: 'flex', gap: 8}}><button className="btn btn-secondary btn-sm" onClick={(e) => { refreshAll() }}>⟳ Refresh</button></div>
                </div>
              </div>
              <div className="wo-filter-bar">
                <label>Plant</label><select className="form-select" style={{width: 95, fontSize: 12}} onChange={(e) => { filterWOTab() }}><option value="all">All</option><option>Plant A</option><option>Plant B</option></select>
                <label>Line</label><select className="form-select" style={{width: 90, fontSize: 12}} onChange={(e) => { filterWOTab() }}><option value="all">All</option><option>Line 1</option><option>Line 2</option><option>Line 3</option></select>
                <label>Machine</label><select className="form-select" id="wo-mach" style={{width: 130, fontSize: 12}} onChange={(e) => { filterWOTab() }}><option value="all">All</option><option>CP-101</option><option>HX-204</option><option>COM-302</option><option>MDU-115</option><option>Forging-Press</option><option>Robotic-Arm</option></select>
                <label>Priority</label><select className="form-select" id="wo-prio" style={{width: 100, fontSize: 12}} onChange={(e) => { filterWOTab() }}><option value="all">All</option><option value="critical">🔴 Critical</option><option value="high">🟠 High</option><option value="medium">🟡 Medium</option></select>
                <label>Status</label><select className="form-select" id="wo-stat" style={{width: 150, fontSize: 12}} onChange={(e) => { filterWOTab() }}><option value="all">All</option><option value="pending_executor">Pending Executor</option><option value="pending_audit">Pending Audit</option><option value="rework">Rework</option><option value="closed">Closed</option></select>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { clearWOFilter() }}>↺ Reset</button>
              </div>
              <div id="pl-wo-list" />
            </div>
            {/* ══ REWORK TAB ══ */}
            <div id="tab-rework" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Planner</span><span className="breadcrumb-sep">›</span>Rework Queue</div>
                <div><div className="page-title">🔁 Rework Queue</div><div className="page-subtitle">Failed audit — needs re-planning and re-assignment</div></div>
              </div>
              <div id="pl-rework-empty" className="alert alert-success" style={{display: 'none'}}>✅ No rework items!</div>
              <div id="pl-rework-list" />
            </div>
            {/* ══ CHECKER CALENDAR TAB ══ */}
            <div id="tab-checker-cal" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Planner</span><span className="breadcrumb-sep">›</span>Checker Calendar</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8}}>
                  <div><div className="page-title">Checker Inspection Calendar</div><div className="page-subtitle" id="pl-ck-sub">Sandeep Tapkir — Real-time</div></div>
                  <div style={{display: 'flex', gap: 4}}>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { plCkNav(-1) }}>‹ Prev</button>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { plCkNav(1) }}>Next ›</button>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { plCkToday() }}>Today</button>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title" id="pl-ck-label">—</div>
                  <div style={{display: 'flex', gap: 8, fontSize: 11, color: 'var(--slate-500)', alignItems: 'center'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: 3}}><span style={{width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', display: 'inline-block'}} />Inspection</span>
                    <span style={{display: 'flex', alignItems: 'center', gap: 3}}><span style={{width: 8, height: 8, background: 'var(--amber)', borderRadius: '50%', display: 'inline-block'}} />ABN Logged</span>
                    <span style={{display: 'flex', alignItems: 'center', gap: 3}}><span style={{width: 8, height: 8, background: 'var(--red)', borderRadius: '50%', display: 'inline-block'}} />Overdue</span>
                  </div>
                </div>
                <div className="cal-grid" id="pl-ck-grid" />
                <div id="pl-ck-detail" style={{display: 'none', marginTop: 14, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--slate-200)'}}>
                  <div style={{background: 'var(--blue-900)', color: 'white', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span id="pl-ck-detail-title" style={{fontSize: 13, fontWeight: 700}}>—</span><button onClick={(e) => { document.getElementById('pl-ck-detail').style.display='none' }} style={{background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 16}}>✕</button></div>
                  <div id="pl-ck-detail-body" style={{padding: 14, background: 'var(--slate-50)'}} />
                </div>
              </div>
            </div>
            {/* ══ EXECUTOR CALENDAR TAB ══ */}
            <div id="tab-executor-cal" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Planner</span><span className="breadcrumb-sep">›</span>Executor Calendar</div>
                <div><div className="page-title">Executor Work Calendar</div><div className="page-subtitle">All executors — assigned WOs by date</div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Executor Schedule — <span id="pl-ex-date" /></div>
                  <select className="form-select" style={{width: 180, fontSize: 12}}>
                    <option>All Executors</option><option>Manoj Shinde</option><option>Pradeep Jadhav</option><option>Rakesh Patil</option><option>Suresh Kulkarni</option><option>Dinesh Wagh</option>
                  </select>
                </div>
                <div id="pl-ex-schedule" />
              </div>
            </div>
            {/* ══ SPARES TAB ══ */}
            <div id="tab-spares" style={{display: 'none'}}>
              <div className="page-header"><div className="page-title">Spare Parts Availability</div><div className="page-subtitle">Sorted by criticality — Red first · Jun 2026</div></div>
              <div className="stat-grid">
                <div className="stat-card" style={{'--stat-color': '#DC2626'}}><div className="stat-label">🔴 Out of Stock</div><div className="stat-value">2</div></div>
                <div className="stat-card" style={{'--stat-color': '#D97706'}}><div className="stat-label">🟡 Below Reorder</div><div className="stat-value">4</div></div>
                <div className="stat-card" style={{'--stat-color': '#059669'}}><div className="stat-label">🟢 Available</div><div className="stat-value">18</div></div>
                <div className="stat-card" style={{'--stat-color': '#2563EB'}}><div className="stat-label">Inventory Value</div><div className="stat-value">₹8.4L</div></div>
              </div>
              <div className="alert alert-warning">🚨 RLY-CTR-63A (Contactor Relay 63A) — OOS · SEAL-CP101-MK — Below Reorder</div>
              <div className="card"><div className="table-wrap"><table>
                    <thead><tr><th>Status</th><th>Part No.</th><th>Description</th><th>Stock</th><th>Reorder</th><th>Machine</th><th>Category</th><th>Action</th></tr></thead>
                    <tbody>
                      <tr style={{background: '#FEF2F2'}}><td><span className="badge badge-critical">🔴 OOS</span></td><td style={{fontFamily: 'var(--font-mono)'}}>RLY-CTR-63A</td><td>Contactor Relay 63A</td><td><strong style={{color: 'var(--red)'}}>0</strong></td><td>1</td><td>COM-302</td><td>Electrical</td><td><button className="btn btn-danger btn-sm" onClick={(e) => { alert('PR raised for RLY-CTR-63A') }}>Raise PR</button></td></tr>
                      <tr style={{background: '#FEF2F2'}}><td><span className="badge badge-critical">🔴 OOS</span></td><td style={{fontFamily: 'var(--font-mono)'}}>MOT-COM302-37KW</td><td>Motor 37kW</td><td><strong style={{color: 'var(--red)'}}>0</strong></td><td>1</td><td>COM-302</td><td>Motor</td><td><button className="btn btn-danger btn-sm" onClick={(e) => { alert('PR raised for Motor 37kW') }}>Raise PR</button></td></tr>
                      <tr style={{background: '#FFFBEB'}}><td><span className="badge badge-pending">🟡 Low</span></td><td style={{fontFamily: 'var(--font-mono)'}}>BRG-22212C</td><td>Bearing 22212C Spherical</td><td><strong style={{color: 'var(--amber)'}}>2</strong></td><td>3</td><td>CP-101</td><td>Bearing</td><td><button className="btn btn-secondary btn-sm" onClick={(e) => { alert('PR raised for BRG-22212C') }}>Raise PR</button></td></tr>
                      <tr style={{background: '#FFFBEB'}}><td><span className="badge badge-pending">🟡 Low</span></td><td style={{fontFamily: 'var(--font-mono)'}}>SEAL-CP101-MK</td><td>Mech Seal CP-101</td><td><strong style={{color: 'var(--amber)'}}>1</strong></td><td>2</td><td>CP-101</td><td>Seal</td><td><button className="btn btn-secondary btn-sm" onClick={(e) => { alert('PR raised for SEAL-CP101-MK') }}>Raise PR</button></td></tr>
                      <tr><td><span className="badge badge-ok">🟢 OK</span></td><td style={{fontFamily: 'var(--font-mono)'}}>BRG-6308ZZ</td><td>Bearing 6308 ZZ</td><td>4</td><td>2</td><td>MDU-115</td><td>Bearing</td><td>—</td></tr>
                      <tr><td><span className="badge badge-ok">🟢 OK</span></td><td style={{fontFamily: 'var(--font-mono)'}}>GRS-EP2-1KG</td><td>EP2 Grease 1kg</td><td>6</td><td>3</td><td>Multi</td><td>Lubricant</td><td>—</td></tr>
                    </tbody>
                  </table></div></div>
            </div>
            {/* ══ SOP LIBRARY TAB ══ */}
            <div id="tab-soplibrary" style={{display: 'none'}}>
              <div className="page-header"><div className="page-title">SOP Library</div><div className="page-subtitle">Standard Operating Procedures — Planner reference</div></div>
              <div className="card"><div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--slate-50)', borderRadius: 'var(--radius)', border: '1px solid var(--slate-200)'}}><span className="badge badge-progress">SOP-PM-001</span><span style={{flex: 1, fontSize: 13, fontWeight: 500}}>Rotating Equipment — Daily Inspection</span><span style={{fontSize: 11, color: 'var(--slate-500)'}}>Rev 4 · 7 sub-SOPs</span></div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--slate-50)', borderRadius: 'var(--radius)', border: '1px solid var(--slate-200)'}}><span className="badge badge-progress">SOP-MR-014</span><span style={{flex: 1, fontSize: 13, fontWeight: 500}}>Bearing Replacement Procedure</span><span style={{fontSize: 11, color: 'var(--slate-500)'}}>Rev 3 · LOTO required</span></div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--slate-50)', borderRadius: 'var(--radius)', border: '1px solid var(--slate-200)'}}><span className="badge badge-progress">SOP-LUB-003</span><span style={{flex: 1, fontSize: 13, fontWeight: 500}}>Running Oil Top-Up Protocol</span><span style={{fontSize: 11, color: 'var(--slate-500)'}}>Rev 2 · No isolation</span></div>
                </div></div>
            </div>
          </main>
        </div>
        {/* ══ PLAN WO MODAL ══ */}
        <div className="modal-overlay" id="planModal">
          <div className="modal" style={{maxWidth: 580}}>
            <div className="modal-header"><div className="modal-title" id="plan-modal-title">📋 Plan Work Order</div><button className="modal-close" onClick={(e) => { document.getElementById('planModal').classList.remove('open') }}>✕</button></div>
            <div className="modal-body">
              <div id="plan-abn-summary" style={{background: 'var(--slate-50)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 14, fontSize: 12, border: '1px solid var(--slate-200)'}} />
              <div className="form-row">
                <div className="form-group"><label className="form-label">Assign Executor</label>
                  <select className="form-select" id="plan-executor">
                    <option value="Manoj Shinde">Manoj Shinde (Mech L3)</option>
                    <option value="Pradeep Jadhav">Pradeep Jadhav (Mech L2)</option>
                    <option value="Rakesh Patil">Rakesh Patil (Mech L2)</option>
                    <option value="Suresh Kulkarni">Suresh Kulkarni (Elect L2)</option>
                    <option value="Dinesh Wagh">Dinesh Wagh (Mech L2)</option>
                    <option value="Amol Deshmukh">Amol Deshmukh (Mech L1)</option>
                    <option value="Nilesh More">Nilesh More (Mech L1)</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Scheduled Date</label>
                  <input type="date" className="form-input" id="plan-date" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Estimated Hours</label><input className="form-input" id="plan-hours" placeholder="e.g. 3-4h" /></div>
                <div className="form-group"><label className="form-label">Spares Needed</label><input className="form-input" id="plan-spares" placeholder="e.g. BRG-6308ZZ x2" /></div>
              </div>
              <div className="form-group"><label className="form-label">Planner Notes</label><textarea className="form-textarea" id="plan-notes" placeholder="Safety precautions, SOP reference, tools needed…" defaultValue={""} /></div>
              <div id="plan-modal-error" className="alert alert-error" style={{display: 'none'}} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={(e) => { document.getElementById('planModal').classList.remove('open') }}>Cancel</button>
              <button className="btn btn-primary" onClick={(e) => { submitPlan() }}>🚀 Raise WO &amp; Assign Executor</button>
            </div>
          </div>
        </div>
        {/* ══ DETAIL MODAL ══ */}
        <div className="modal-overlay" id="plDetailModal">
          <div className="modal" style={{maxWidth: 600}}>
            <div className="modal-header"><div className="modal-title" id="pl-detail-title">Detail</div><button className="modal-close" onClick={(e) => { document.getElementById('plDetailModal').classList.remove('open') }}>✕</button></div>
            <div className="modal-body" id="pl-detail-body" />
            <div className="modal-footer"><button className="btn btn-secondary" onClick={(e) => { document.getElementById('plDetailModal').classList.remove('open') }}>Close</button></div>
          </div>
        </div>
      </div>

    </>
  );
}