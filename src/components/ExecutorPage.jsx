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
  complete(id, data){
    const items=this.getAll(), item=items.find(i=>i.id===id);
    if(!item)return;
    const now=new Date();
    item.status='pending_audit'; item.completedAt=now.toISOString();
    item.completionNotes=data.notes; item.completedBy='Manoj Shinde';
    item.history.push({stage:'Work Completed by Executor',by:'Manoj Shinde',at:now.toISOString(),note:data.notes,icon:'🔧'});
    this.save(items); return item;
  }
};

const PRIO_ORDER={critical:0,high:1,medium:2,low:3};

let activeCompleteId=null;

function priBadge(p){
  const m={critical:'badge-critical',high:'badge-high',medium:'badge-medium',low:'badge-low'};
  const icons={critical:'🔴',high:'🟠',medium:'🟡',low:'🟢'};
  return `<span class="badge ${m[p]||'badge-closed'}">${icons[p]||''} ${p}</span>`;
}

function flowTrack(item){
  const stages=[{key:'logged',label:'Logged',icon:'⚠️'},{key:'planner',label:'Planner',icon:'📋'},{key:'executor',label:'Executor',icon:'🔧'},{key:'audit',label:'Audit',icon:'🔍'},{key:'closed',label:'Closed',icon:'✅'}];
  const stateMap={pending_planner:1,pending_executor:2,pending_audit:3,rework:3,closed:4};
  const activeIdx=stateMap[item.status]??0;
  let html='<div class="flow-track">';
  stages.forEach((s,i)=>{
    const done=i<activeIdx,active=i===activeIdx;
    html+=`<div class="flow-node"><div class="flow-node-dot ${done?'done':active?'active':''}">${done?'✓':s.icon}</div><div class="flow-node-label ${active?'active':''}">${s.label}</div></div>`;
    if(i<stages.length-1)html+=`<div class="flow-connector ${done?'done':''}"></div>`;
  });
  return html+'</div>';
}

function getSOPSteps(item) {
  const cp = (item.checkPoint||'').toLowerCase();
  const obs = (item.observed||'').toLowerCase();
  if(cp.includes('vibration')||obs.includes('mm/s')||cp.includes('bearing')) {
    return [
      'Perform LOTO — Isolate '+item.machine+' electrically at MCC Panel A-04',
      'Allow bearing to cool. Verify temp <40°C before touching',
      'Remove coupling guard. Photograph before removal',
      'Extract old bearing with puller. Check shaft for damage',
      'Clean housing, apply EP2 grease, press-fit new bearing',
      'Reassemble coupling, perform alignment, verify <0.05mm offset',
      'Remove LOTO. Run trial. Verify vibration reading <4.5 mm/s'
    ];
  }
  if(cp.includes('oil')||cp.includes('lube')||obs.includes('oil')) {
    return [
      'Check oil level at sight glass — note current reading',
      'Use ISO VG 68 oil only — verify correct grade',
      'Fill slowly to mid-mark. Do NOT overfill',
      'Photograph sight glass after top-up',
      'Check for leaks around drain plug and filler cap',
      'Record reading in logbook'
    ];
  }
  if(cp.includes('temp')||obs.includes('°c')) {
    return [
      'Verify current temperature reading on sensor display',
      'Check cooling water flow — valves open, no blockage',
      'Clean heat exchanger fins / cooling passages',
      'Check fan operation and direction',
      'Verify temperature drops to normal range <70°C',
      'Record temperature before and after'
    ];
  }
  if(cp.includes('current')||cp.includes('motor')) {
    return [
      'Measure running current with clamp meter — record value',
      'Check for mechanical overload — bearing drag, coupling alignment',
      'Check supply voltage — all 3 phases balanced',
      'Inspect MCC — overload relay setting, contactor condition',
      'Check motor body temperature',
      'Record all readings and report to Planner'
    ];
  }
  return [
    'Review WO and ensure correct SOP is selected',
    'Perform LOTO as required for the task',
    'Execute repair/maintenance as per SOP steps',
    'Photograph before and after conditions',
    'Test/verify repair — measure and confirm OK',
    'Remove LOTO, clean up, record completion'
  ];
}

function renderTaskCard(item){
  const isRework=item.status==='rework';
  const steps = getSOPSteps(item);
  const sopRef = item.sopRef || 'SOP-PM-001';
  const plant = item.plant || 'Plant A';
  const location = item.location || 'Utility Block';
  const team = item.allExecutors || item.assignedTo || 'Manoj Shinde';
  const timeStr = item.scheduledTime ? item.scheduledTime : '09:00';
  const looting = (item.plannerNotes||'').toLowerCase().includes('loto')||getSOPSteps(item)[0].includes('LOTO');
  const priLabel = item.priority==='critical'?'● Critical':item.priority==='high'?'● High':item.priority==='medium'?'● Medium':'● Low';
  const priClass = item.priority==='critical'?'badge-critical':item.priority==='high'?'badge-high':item.priority==='medium'?'badge-medium':'badge-low';

  return `<div class="wo-task-card">
    <div class="wo-task-header ${item.priority}" style="padding-left:20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
            <span class="wo-badge">${item.woRef||'WO-PENDING'}</span>
            ${isRework?'<span class="wf-pill rework" style="font-size:11px">🔁 Rework #'+item.reworkCount+'</span>':''}
          </div>
          <div style="font-size:16px;font-weight:700;color:var(--blue-900)">${item.machine} — ${item.checkPoint}</div>
          <div style="font-size:12px;color:var(--slate-500);margin-top:3px">${plant} · ${location} · Assigned ${timeStr} by Vishwas Landage</div>
        </div>
        <span class="badge ${priClass}" style="font-size:12px">${priLabel}</span>
      </div>
      <!-- Info row -->
      <div class="wo-info-row">
        <div class="wo-info-item"><div class="wo-info-label">EST. DURATION</div><div class="wo-info-value">${item.estimatedHours||'2–3 hours'}</div></div>
        <div class="wo-info-item"><div class="wo-info-label">ROLE</div><div class="wo-info-value">${team.includes(',')?'Lead · '+team.split(', ').slice(1).map(e=>e.split(' (')[0]).join(', '):'Lead'}</div></div>
        <div class="wo-info-item"><div class="wo-info-label">SPARES READY</div><div class="wo-info-value"><span class="spares-tag">✓ ${item.sparesNeeded||'Check with Planner'}</span></div></div>
        <div class="wo-info-item"><div class="wo-info-label">LOTO</div><div class="wo-info-value">${looting?'<span class="loto-tag">⚠ Required</span>':'<span style="color:var(--green);font-weight:600">Not required</span>'}</div></div>
      </div>
    </div>

    <!-- SOP Steps -->
    <div style="padding:14px 18px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <div style="font-size:12px;font-weight:700;color:var(--slate-500);text-transform:uppercase;letter-spacing:.5px">SOP Steps</div>
        <button class="btn btn-ghost btn-sm" style="font-size:12px;color:var(--blue-500)" onclick="alert('Opening ${sopRef} full document')">📖 View ${sopRef}</button>
      </div>
      <div id="sop-steps-${item.id}">
        ${steps.map((s,i)=>`<div class="wo-sop-step" id="step-${item.id}-${i}">
          <div class="wo-step-num" id="stepnum-${item.id}-${i}">${i+1}</div>
          <span style="flex:1">${s}</span>
          <button style="background:none;border:none;cursor:pointer;color:var(--slate-300);font-size:16px;padding:0 4px" onclick="markStep('${item.id}',${i})" title="Mark done">✓</button>
        </div>`).join('')}
      </div>
      ${isRework?`<div class="alert alert-error" style="margin-top:10px;font-size:12px">🔁 Rework #${item.reworkCount} — Previous audit failed. Be thorough and re-verify all steps.</div>`:''}
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-primary start-btn-anim" onclick="openComplete('${item.id}')" style="display:flex;align-items:center;gap:8px;font-size:14px;padding:10px 20px">
          ▶ Start Task &amp; Submit for Audit
        </button>
        <button class="btn btn-ghost btn-sm" onclick="alert('Opening SOP ${sopRef}')">📖 Open ${sopRef}</button>
      </div>
    </div>
  </div>`;
}

function markStep(itemId, stepIdx) {
  const numEl = document.getElementById('stepnum-'+itemId+'-'+stepIdx);
  const rowEl = document.getElementById('step-'+itemId+'-'+stepIdx);
  if(!numEl||!rowEl) return;
  if(numEl.classList.contains('done')) {
    numEl.classList.remove('done'); numEl.textContent=stepIdx+1;
    rowEl.style.opacity='1'; rowEl.querySelector('span').style.textDecoration='none';
  } else {
    numEl.classList.add('done'); numEl.textContent='✓';
    rowEl.style.opacity='.6'; rowEl.querySelector('span').style.textDecoration='line-through';
  }
}

function renderTasks(){
  const all=WF.getAll();
  const my=all.filter(i=>(i.status==='pending_executor'||i.status==='rework')&&(i.allExecutors||i.assignedTo||'Manoj Shinde').includes(exCurrentUser));
  const list=document.getElementById('ex-task-list');
  const empty=document.getElementById('ex-task-empty');
  const badge=document.getElementById('ex-task-badge');
  if(badge)badge.textContent=my.length;
  document.getElementById('ex-s-crit').textContent=my.filter(i=>i.priority==='critical').length;
  document.getElementById('ex-s-high').textContent=my.filter(i=>i.priority==='high').length;
  document.getElementById('ex-s-total').textContent=my.length;
  document.getElementById('ex-s-done').textContent=all.filter(i=>i.completedBy&&(i.status==='pending_audit'||i.status==='closed')).length;
  if(!my.length){if(empty)empty.style.display='flex';list.innerHTML='';return;}
  if(empty)empty.style.display='none';
  const sorted=my.slice().sort((a,b)=>(PRIO_ORDER[a.priority]||3)-(PRIO_ORDER[b.priority]||3));
  list.innerHTML=sorted.map(i=>renderTaskCard(i)).join('');
  document.getElementById('ex-task-sub').textContent=`${my.length} task${my.length>1?'s':''} assigned · Last sync: ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`;
}

function renderCompleted(){
  const items=WF.getAll().filter(i=>i.completedBy&&(i.status==='pending_audit'||i.status==='closed'));
  const list=document.getElementById('ex-completed-list');
  const empty=document.getElementById('ex-completed-empty');
  const badge=document.getElementById('ex-done-badge');
  if(badge)badge.textContent=items.length;
  if(!items.length){if(empty)empty.style.display='block';list.innerHTML='';return;}
  if(empty)empty.style.display='none';
  list.innerHTML=items.map(item=>`
    <div class="card" style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <div><div style="font-size:13px;font-weight:700;color:var(--blue-900)">${item.woRef} — ${item.checkPoint}</div><div style="font-size:11px;color:var(--slate-500);margin-top:2px">${item.machine} · Completed: ${item.completedAt?new Date(item.completedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):''}</div></div>
        <div style="display:flex;gap:6px">${priBadge(item.priority)}<span class="badge ${item.status==='closed'?'badge-ok':'badge-progress'}">${item.status==='closed'?'✅ Closed':'🔍 Pending Audit'}</span></div>
      </div>
      ${flowTrack(item)}
      ${item.completionNotes?`<div style="margin-top:8px;font-size:12px;color:var(--slate-600);background:var(--slate-50);padding:8px;border-radius:6px">${item.completionNotes}</div>`:''}
      ${item.auditResult==='fail'?`<div class="alert alert-error" style="margin-top:8px;font-size:12px">Audit failed — rework raised</div>`:''}
    </div>
  `).join('');
}

function renderRework(){
  const items=WF.getAll().filter(i=>i.status==='rework'&&(i.assignedTo==='Manoj Shinde'||!i.assignedTo));
  const list=document.getElementById('ex-rework-list');
  const empty=document.getElementById('ex-rework-empty');
  const badge=document.getElementById('ex-rework-badge');
  if(badge)badge.textContent=items.length;
  if(!items.length){if(empty)empty.style.display='block';list.innerHTML='';return;}
  if(empty)empty.style.display='none';
  list.innerHTML=items.map(item=>`
    <div class="card" style="border-color:var(--red-border);margin-bottom:10px">
      <div style="font-size:13px;font-weight:700;color:var(--red);margin-bottom:6px">🔁 Rework #${item.reworkCount}: ${item.checkPoint}</div>
      <div style="font-size:12px;color:var(--slate-600);margin-bottom:8px">${item.machine} · Previous: ${item.woRef||'—'} · Awaiting re-planning by Planner</div>
      ${flowTrack(item)}
    </div>
  `).join('');
}

function openComplete(id){
  activeCompleteId=id;
  const item=WF.getAll().find(i=>i.id===id);
  if(!item)return;
  document.getElementById('complete-modal-title').textContent=(item.status==='rework'?'🔁 Rework Completion: ':'✅ Complete: ')+item.woRef;
  document.getElementById('complete-summary').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
      <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase">Task</div>${item.checkPoint}</div>
      <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase">Machine</div>${item.machine}</div>
      <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase">WO Reference</div><strong style="font-family:var(--font-mono)">${item.woRef||'—'}</strong></div>
      <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase">Planner Notes</div>${item.plannerNotes||'—'}</div>
    </div>
    ${item.reworkCount>0?`<div style="margin-top:8px;font-size:11px;color:var(--red);font-weight:600">⚠️ Rework #${item.reworkCount} — Be thorough. Ensure root cause addressed.</div>`:''}
  `;
  document.getElementById('complete-notes').value='';
  ['comp-photo1','comp-photo2','comp-photo3'].forEach(id=>{const el=document.getElementById(id);el.classList.remove('captured');el.innerHTML=id.includes('1')?'📷<br>Before':id.includes('2')?'📷<br>After':'📷<br>Reading';});
  document.getElementById('complete-error').style.display='none';
  document.getElementById('completeModal').classList.add('open');
}

function capPhotoComp(id){const el=document.getElementById(id);el.classList.add('captured');el.innerHTML='✅<br>Captured';}

function submitComplete(){
  const notes=document.getElementById('complete-notes').value.trim();
  const errEl=document.getElementById('complete-error');
  if(!notes){errEl.textContent='Please enter completion notes before submitting.';errEl.style.display='flex';return;}
  errEl.style.display='none';
  const item=WF.complete(activeCompleteId,{notes});
  document.getElementById('completeModal').classList.remove('open');
  renderTasks();
  showToast('🚀 WO submitted for audit to Checker!','success');
  // Update calendar
  const n=new Date(),year=n.getFullYear(),month=n.getMonth();
  if(exCalYear===year&&exCalMonth===month)exBuildCalendar(year,month);
}

let exCurrentUser = 'Manoj Shinde';

function switchExecutor(name) {
  exCurrentUser = name;
  const badge = document.getElementById('ex-role-badge');
  if(badge) badge.textContent = name + ' · Executor';
  renderTasks();
  const rB=document.getElementById('ex-task-badge');
  if(rB) rB.textContent=WF.getAll().filter(i=>(i.status==='pending_executor'||i.status==='rework')&&(i.allExecutors||i.assignedTo||'Manoj Shinde').includes(exCurrentUser)).length;
}

function showTab(name,el){
  document.querySelectorAll('[id^="tab-"]').forEach(t=>t.style.display='none');
  document.getElementById('tab-'+name).style.display='block';
  document.querySelectorAll('.sidebar-link').forEach(l=>l.classList.remove('active'));
  if(el)el.classList.add('active');
  if(name==='tasks')renderTasks();
  else if(name==='completed')renderCompleted();
  else if(name==='rework')renderRework();
  else if(name==='calendar'){const n=new Date();exBuildCalendar(exCalYear||n.getFullYear(),exCalMonth!==undefined?exCalMonth:n.getMonth());}
}

function refreshAll(){
  const active=document.querySelector('[id^="tab-"]:not([style*="none"])');
  if(active){const n=active.id.replace('tab-','');showTab(n,null);}
}

const EX_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

const EX_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

let exCalYear,exCalMonth;

function exBuildCalendar(year,month){
  exCalYear=year;exCalMonth=month;
  const n=new Date(),ty=n.getFullYear(),tm=n.getMonth(),td=n.getDate();
  document.getElementById('ex-cal-label').textContent=EX_MONTHS[month]+' '+year;
  document.getElementById('ex-cal-sub').textContent='Assigned WOs · '+EX_MONTHS[month]+' '+year;
  const evMap={};
  WF.getAll().filter(i=>i.assignedTo==='Manoj Shinde'||!i.assignedTo).forEach(item=>{
    let dt=null;
    if(item.scheduledDate){try{dt=new Date(item.scheduledDate);}catch(e){}}
    else if(item.loggedAt){dt=new Date(item.loggedAt);}
    if(!dt||dt.getFullYear()!==year||dt.getMonth()!==month)return;
    const k=`${year}-${String(month+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    if(!evMap[k])evMap[k]=[];
    evMap[k].push({label:item.woRef+' — '+item.checkPoint,icon:item.status==='pending_audit'?'✅':'🔧',status:item.status,id:item.id});
  });
  const grid=document.getElementById('ex-cal-grid');
  grid.innerHTML='';
  EX_DAYS.forEach(d=>{const h=document.createElement('div');h.className='cal-day-header';h.textContent=d;grid.appendChild(h);});
  const firstDow=new Date(year,month,1).getDay();
  const offset=firstDow===0?6:firstDow-1;
  const dimPrev=new Date(year,month,0).getDate();
  const dim=new Date(year,month+1,0).getDate();
  for(let i=offset-1;i>=0;i--){const c=document.createElement('div');c.className='cal-day';c.style.color='var(--slate-300)';c.textContent=dimPrev-i;grid.appendChild(c);}
  for(let d=1;d<=dim;d++){
    const dk=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const evs=evMap[dk]||[];
    const isToday=year===ty&&month===tm&&d===td;
    const hasDone=evs.some(e=>e.status==='pending_audit'||e.status==='closed');
    let cls='cal-day';if(isToday)cls+=' today';if(evs.length>0)cls+=(hasDone?' has-done':' has-task');
    const cell=document.createElement('div');cell.className=cls;cell.innerHTML=`<span>${d}</span>`;
    if(evs.length){
      const dot=document.createElement('span');dot.style.cssText='position:absolute;bottom:3px;left:50%;transform:translateX(-50%);display:flex;gap:2px';
      evs.slice(0,3).forEach(ev=>{const dd=document.createElement('span');dd.style.cssText=`width:4px;height:4px;border-radius:50%;background:${ev.status==='pending_audit'||ev.status==='closed'?'var(--green)':isToday?'white':'var(--amber)'}`;dot.appendChild(dd);});
      cell.appendChild(dot);cell.style.cursor='pointer';
      cell.addEventListener('click',()=>{
        const dt2=document.getElementById('ex-cal-detail'),tl=document.getElementById('ex-cal-detail-title'),body=document.getElementById('ex-cal-detail-body');
        tl.textContent='📅 '+new Date(year,month,d).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})+(isToday?' — TODAY':'');
        body.innerHTML='<div style="display:flex;flex-direction:column;gap:8px">'+evs.map(ev=>`<div style="display:flex;align-items:center;gap:10px;background:white;border-radius:var(--radius);padding:10px 12px;border:1px solid var(--slate-200)"><span style="font-size:18px">${ev.icon}</span><div style="flex:1"><div style="font-size:13px;font-weight:600">${ev.label}</div></div><span class="badge ${ev.status==='pending_audit'?'badge-ok':ev.status==='closed'?'badge-closed':'badge-progress'}">${ev.status==='pending_audit'?'Pending Audit':ev.status==='closed'?'Closed':'Assigned'}</span></div>`).join('')+'</div>';
        dt2.style.display='block';
      });
    }
    grid.appendChild(cell);
  }
  const rem=(offset+dim)%7===0?0:7-(offset+dim)%7;
  for(let d=1;d<=rem;d++){const c=document.createElement('div');c.className='cal-day';c.style.color='var(--slate-300)';c.textContent=d;grid.appendChild(c);}
}

function exCalNav(dir){exCalMonth+=dir;if(exCalMonth>11){exCalMonth=0;exCalYear++;}if(exCalMonth<0){exCalMonth=11;exCalYear--;}exBuildCalendar(exCalYear,exCalMonth);document.getElementById('ex-cal-detail').style.display='none';}

function exCalToday(){const n=new Date();exBuildCalendar(n.getFullYear(),n.getMonth());document.getElementById('ex-cal-detail').style.display='none';}

function showToast(msg,type){
  let t=document.getElementById('wf-toast');
  if(!t){t=document.createElement('div');t.id='wf-toast';t.style.cssText='position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:var(--radius-lg);font-size:13px;font-weight:600;z-index:9999;box-shadow:var(--shadow-lg);max-width:360px;transition:opacity .3s';document.body.appendChild(t);}
  t.style.background=type==='error'?'var(--red-light)':type==='success'?'var(--green-light)':'var(--blue-50)';
  t.style.color=type==='error'?'#991B1B':type==='success'?'#065F46':'#1E40AF';
  t.style.border=`1px solid ${type==='error'?'var(--red-border)':type==='success'?'var(--green-border)':'#BFDBFE'}`;
  t.textContent=msg;t.style.opacity='1';
  clearTimeout(t._timer);t._timer=setTimeout(()=>t.style.opacity='0',3000);
}

export default function ExecutorPage({ onNavigate }) {
  useEffect(() => {
    function t(){var n=new Date();document.getElementById('ex-clock').textContent=n.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}t();const _iv = setInterval(t, 1000);
        return () => clearInterval(_iv);
  }, []);

  useEffect(() => {
    const cleanups = [];
    const _storageHandler = e=>{if(e.key==='smartpm_sync'){refreshAll();}};
        window.addEventListener('storage', _storageHandler);
        cleanups.push(() => window.removeEventListener('storage', _storageHandler));
    (()=>{
      const n=new Date();exCalYear=n.getFullYear();exCalMonth=n.getMonth();
      renderTasks();
      setInterval(()=>{
        const active=document.querySelector('[id^="tab-"]:not([style*="none"])');
        if(active&&active.id==='tab-tasks')renderTasks();
        const rb=document.getElementById('ex-rework-badge');if(rb)rb.textContent=WF.getAll().filter(i=>i.status==='rework').length;
      },4000);
    })();
    return () => { cleanups.forEach(fn => fn()); };
  }, []);

  return (
    <>
      <style>{`

.task-card{background:white;border:1.5px solid var(--slate-200);border-radius:var(--radius-lg);padding:0;margin-bottom:14px;overflow:hidden}
.task-top{padding:14px 16px;border-bottom:1px solid var(--slate-100)}
.task-top.critical{background:linear-gradient(135deg,#FFF1F2,#FFF5F5);border-bottom-color:#FECACA}
.task-top.high{background:linear-gradient(135deg,#FFFBEB,#FFFEF5);border-bottom-color:#FDE68A}
.task-top.medium{background:linear-gradient(135deg,#FFFBEB,white);border-bottom-color:#FDE68A}
.task-body{padding:14px 16px}
.task-step{display:flex;gap:10px;margin-bottom:10px;align-items:flex-start}
.task-step-num{width:22px;height:22px;border-radius:50%;background:var(--blue-500);color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.task-step-num.done{background:var(--green)}
.timer-bar{background:var(--slate-100);border-radius:100px;height:6px;overflow:hidden;margin:6px 0}
.timer-fill{height:100%;background:var(--blue-500);border-radius:100px;transition:width .5s}
.wf-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
.wf-pill.pending-executor{background:#FFFBEB;color:#92400E}
.wf-pill.pending-audit{background:#ECFEFF;color:#155E75}
.wf-pill.rework{background:#FFF1F2;color:#9F1239}
.flow-track{display:flex;align-items:center;gap:0;margin:10px 0 4px;flex-wrap:nowrap;overflow-x:auto}
.flow-node{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:70px;flex-shrink:0}
.flow-node-dot{width:24px;height:24px;border-radius:50%;border:2px solid var(--slate-300);background:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--slate-400)}
.flow-node-dot.done{background:var(--green);border-color:var(--green);color:white}
.flow-node-dot.active{background:var(--blue-500);border-color:var(--blue-500);color:white;box-shadow:0 0 0 3px rgba(37,99,235,.2)}
.flow-node-label{font-size:9px;color:var(--slate-400);text-align:center;line-height:1.3;font-weight:600;text-transform:uppercase;letter-spacing:.3px}
.flow-node-label.active{color:var(--blue-500)}
.flow-connector{flex:1;height:2px;background:var(--slate-200);min-width:16px}
.flow-connector.done{background:var(--green)}
.photo-thumb{width:80px;height:60px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;font-weight:600;text-align:center;line-height:1.3;border:2px dashed var(--slate-300);background:var(--slate-50);transition:all .2s;flex-shrink:0}
.photo-thumb:hover{border-color:var(--blue-400)}
.photo-thumb.captured{border-style:solid;border-color:var(--green);background:var(--green-light);color:var(--green)}
.wo-task-card{background:white;border-radius:var(--radius-lg);border:1.5px solid var(--slate-200);margin-bottom:18px;overflow:hidden;box-shadow:var(--shadow)}
.wo-task-header{padding:14px 18px 12px;border-left:5px solid var(--slate-300);position:relative}
.wo-task-header.critical{border-left-color:var(--red)}
.wo-task-header.high{border-left-color:var(--amber)}
.wo-task-header.medium{border-left-color:#FBBF24}
.wo-task-header.low{border-left-color:var(--green)}
.wo-badge{display:inline-flex;align-items:center;background:var(--blue-900);color:white;font-family:var(--font-mono);font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px;letter-spacing:.5px}
.wo-info-row{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-top:10px;padding:10px 14px;background:var(--slate-50);border-radius:var(--radius);font-size:12px}
.wo-info-item{display:flex;flex-direction:column;gap:2px}
.wo-info-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--slate-400)}
.wo-info-value{font-size:12px;font-weight:600;color:var(--blue-900)}
.wo-sop-step{display:flex;align-items:flex-start;gap:10px;padding:7px 0;border-bottom:1px solid var(--slate-100);font-size:13px;color:var(--slate-700)}
.wo-sop-step:last-child{border-bottom:none}
.wo-step-num{width:22px;height:22px;border-radius:50%;background:var(--blue-50);border:1.5px solid #BFDBFE;color:var(--blue-600);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.wo-step-num.done{background:var(--green);border-color:var(--green);color:white}
.spares-tag{display:inline-flex;align-items:center;gap:5px;background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;font-size:11px;font-weight:600;padding:3px 8px;border-radius:100px}
.loto-tag{display:inline-flex;align-items:center;gap:5px;background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;font-size:11px;font-weight:600;padding:3px 8px;border-radius:100px}
.start-btn-anim:active{transform:scale(.97)}

.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-day-header{text-align:center;font-size:10px;font-weight:700;color:var(--slate-400);padding:4px}
.cal-day{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;position:relative;transition:all .15s}
.cal-day:hover{background:var(--blue-50)}
.cal-day.today{background:var(--blue-500);color:white;font-weight:700}
.cal-day.has-task::after{content:'';position:absolute;bottom:3px;width:4px;height:4px;border-radius:50%;background:var(--amber)}
.cal-day.today.has-task::after{background:white}
.cal-day.has-done::after{background:var(--green)}

`}</style>
      <div>
        <nav className="top-nav">
          <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}><div className="nav-logo-icon">🔧</div><div><div className="nav-logo-text">SmartPM</div><div className="nav-logo-sub">Executor Portal</div></div></a>
          <div className="nav-spacer" />
          <select className="form-select" id="executor-selector" style={{width: 190, fontSize: 12, padding: '5px 10px', background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.2)', color: 'white'}} onChange={(e) => { switchExecutor(e.currentTarget.value) }}>
            <option value="Manoj Shinde">Manoj Shinde (Mech L3)</option>
            <option value="Pradeep Jadhav">Pradeep Jadhav (Mech L2)</option>
            <option value="Rakesh Patil">Rakesh Patil (Mech L2)</option>
            <option value="Suresh Kulkarni">Suresh Kulkarni (Elect L2)</option>
            <option value="Dinesh Wagh">Dinesh Wagh (Mech L2)</option>
            <option value="Amol Deshmukh">Amol Deshmukh (Mech L1)</option>
            <option value="Nilesh More">Nilesh More (Mech L1)</option>
          </select>
          <div className="nav-role-badge" style={{marginLeft: 8}}><div className="nav-role-dot" style={{background: '#D97706'}} /><span className="nav-role-name" id="ex-role-badge">Executor</span></div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="nav-home-btn" style={{marginLeft: 8}}>← Home</a>
          <div id="ex-clock" style={{color: 'rgba(255,255,255,.5)', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 10}} />
        </nav>
        <div className="app-layout">
          <aside className="sidebar">
            <div className="sidebar-section-label">My Work</div>
            <a href="#" className="sidebar-link active" id="sb-tasks" onClick={(e) => { showTab('tasks',e.currentTarget) }}><span className="link-icon">🔧</span>My Tasks<span className="sidebar-badge" id="ex-task-badge">0</span></a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('completed',e.currentTarget) }}><span className="link-icon">✅</span>Completed<span className="sidebar-badge blue" id="ex-done-badge">0</span></a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('rework',e.currentTarget) }}><span className="link-icon">🔁</span>Rework Tasks<span className="sidebar-badge" id="ex-rework-badge">0</span></a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Schedule &amp; Reference</div>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('calendar',e.currentTarget) }}><span className="link-icon">📅</span>My Calendar</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('sop',e.currentTarget) }}><span className="link-icon">📖</span>SOP Reference</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('spares',e.currentTarget) }}><span className="link-icon">🔩</span>Spare Lookup</a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Navigate</div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('checker'); }} className="sidebar-link"><span className="link-icon">🔍</span>Checker View</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('planner'); }} className="sidebar-link"><span className="link-icon">📋</span>Planner View</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className="sidebar-link"><span className="link-icon">📊</span>Mentor Dashboard</a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Quick Actions</div>
            <div style={{padding: '4px 12px 12px'}}>
              <button className="quick-action-btn" onClick={(e) => { showTab('tasks',document.getElementById('sb-tasks')) }}>🔧 My Open Tasks</button>
              <button className="quick-action-btn" onClick={(e) => { refreshAll() }}>⟳ Refresh Tasks</button>
              <button className="quick-action-btn" onClick={(e) => { showTab('sop',document.querySelector('[onclick*=sop]')) }}>📖 SOP Reference</button>
            </div>
          </aside>
          <main className="main-content">
            {/* ══ MY TASKS TAB ══ */}
            <div id="tab-tasks">
              <div className="page-header">
                <div className="breadcrumb"><span>Executor</span><span className="breadcrumb-sep">›</span>My Tasks</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8}}>
                  <div><div className="page-title">My PM Tasks</div><div className="page-subtitle" id="ex-task-sub">Assigned by Vishwas Landage (Planner)</div></div>
                  <div style={{display: 'flex', gap: 8}}>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { refreshAll() }}>⟳ Refresh</button>
                    <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--green)', fontWeight: 600}}><span style={{width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block'}} />Live</div>
                  </div>
                </div>
              </div>
              <div className="stat-grid" style={{marginBottom: 14}}>
                <div className="stat-card" style={{'--stat-color': '#DC2626'}}><div className="stat-label">🔴 Critical</div><div className="stat-value" id="ex-s-crit">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#D97706'}}><div className="stat-label">🟠 High</div><div className="stat-value" id="ex-s-high">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#2563EB'}}><div className="stat-label">Total Assigned</div><div className="stat-value" id="ex-s-total">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#059669'}}><div className="stat-label">Completed</div><div className="stat-value" id="ex-s-done">0</div></div>
              </div>
              <div id="ex-task-empty" className="alert alert-info" style={{display: 'none'}}>ℹ️ No tasks assigned yet. Planner will assign work orders from abnormality reports.</div>
              <div id="ex-task-list" />
            </div>
            {/* ══ COMPLETED TAB ══ */}
            <div id="tab-completed" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Executor</span><span className="breadcrumb-sep">›</span>Completed Tasks</div>
                <div><div className="page-title">Completed Work Orders</div><div className="page-subtitle">Submitted for audit to Checker</div></div>
              </div>
              <div id="ex-completed-empty" className="alert alert-info" style={{display: 'none'}}>ℹ️ No completed tasks yet.</div>
              <div id="ex-completed-list" />
            </div>
            {/* ══ REWORK TAB ══ */}
            <div id="tab-rework" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Executor</span><span className="breadcrumb-sep">›</span>Rework Tasks</div>
                <div><div className="page-title">🔁 Rework Tasks</div><div className="page-subtitle">Audit failed — redo the work and resubmit</div></div>
              </div>
              <div id="ex-rework-empty" className="alert alert-success" style={{display: 'none'}}>✅ No rework tasks!</div>
              <div id="ex-rework-list" />
            </div>
            {/* ══ CALENDAR TAB ══ */}
            <div id="tab-calendar" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Executor</span><span className="breadcrumb-sep">›</span>My Calendar</div>
                <div className="page-title">My Work Calendar</div>
                <div className="page-subtitle" id="ex-cal-sub">Assigned WOs by date · Real-time</div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div><div className="card-title" id="ex-cal-label">—</div><div style={{fontSize: 11, color: 'var(--slate-400)', marginTop: 2}}>Click any day to see assigned WOs</div></div>
                  <div style={{display: 'flex', gap: 4}}>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { exCalNav(-1) }}>‹ Prev</button>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { exCalNav(1) }}>Next ›</button>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { exCalToday() }}>Today</button>
                  </div>
                </div>
                <div className="cal-grid" id="ex-cal-grid" />
                <div id="ex-cal-detail" style={{display: 'none', marginTop: 14, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--slate-200)'}}>
                  <div style={{background: 'var(--blue-900)', color: 'white', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span id="ex-cal-detail-title" style={{fontSize: 13, fontWeight: 700}}>—</span><button onClick={(e) => { document.getElementById('ex-cal-detail').style.display='none' }} style={{background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 16}}>✕</button></div>
                  <div id="ex-cal-detail-body" style={{padding: 14, background: 'var(--slate-50)'}} />
                </div>
              </div>
            </div>
            {/* ══ SOP TAB ══ */}
            <div id="tab-sop" style={{display: 'none'}}>
              <div className="page-header"><div className="page-title">SOP Quick Reference</div></div>
              <div className="card"><div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  <div style={{border: '1px solid var(--slate-200)', borderRadius: 'var(--radius)', overflow: 'hidden'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', background: 'var(--slate-50)'}} onClick={(e) => { e.currentTarget.nextElementSibling.style.display=e.currentTarget.nextElementSibling.style.display==='none'?'block':'none' }}><span style={{fontSize: 18}}>📄</span><div style={{flex: 1}}><div style={{fontSize: 13, fontWeight: 600, color: 'var(--blue-900)'}}>SOP-MR-014 — Bearing Replacement</div><div style={{fontSize: 11, color: 'var(--slate-500)'}}>7 steps · LOTO required · 3-4h</div></div><span style={{color: 'var(--blue-500)'}}>▼</span></div>
                    <div style={{display: 'none', padding: '12px 14px', fontSize: 12}}>
                      <div style={{display: 'flex', gap: 8, marginBottom: 6}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>1</div><span>LOTO at MCC Panel A-04</span></div>
                      <div style={{display: 'flex', gap: 8, marginBottom: 6}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>2</div><span>Cool bearing to &lt;40°C</span></div>
                      <div style={{display: 'flex', gap: 8, marginBottom: 6}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>3</div><span>Remove guard, photograph before state</span></div>
                      <div style={{display: 'flex', gap: 8, marginBottom: 6}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>4</div><span>Extract bearing, check shaft for scoring</span></div>
                      <div style={{display: 'flex', gap: 8, marginBottom: 6}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>5</div><span>Grease, fit new 6308 ZZ bearing</span></div>
                      <div style={{display: 'flex', gap: 8, marginBottom: 6}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>6</div><span>Align (&lt;0.05mm runout), remove LOTO</span></div>
                      <div style={{display: 'flex', gap: 8}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>7</div><span>Trial run — verify &lt;4.5 mm/s vibration</span></div>
                    </div>
                  </div>
                  <div style={{border: '1px solid var(--slate-200)', borderRadius: 'var(--radius)', overflow: 'hidden'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', background: 'var(--slate-50)'}} onClick={(e) => { e.currentTarget.nextElementSibling.style.display=e.currentTarget.nextElementSibling.style.display==='none'?'block':'none' }}><span style={{fontSize: 18}}>📄</span><div style={{flex: 1}}><div style={{fontSize: 13, fontWeight: 600, color: 'var(--blue-900)'}}>SOP-LUB-003 — Oil Top-Up</div><div style={{fontSize: 11, color: 'var(--slate-500)'}}>3 steps · No isolation · 30 min</div></div><span style={{color: 'var(--blue-500)'}}>▼</span></div>
                    <div style={{display: 'none', padding: '12px 14px', fontSize: 12}}>
                      <div style={{display: 'flex', gap: 8, marginBottom: 6}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>1</div><span>No isolation needed — running top-up permitted</span></div>
                      <div style={{display: 'flex', gap: 8, marginBottom: 6}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>2</div><span>Use ISO VG 68 only. Fill slowly to mid mark</span></div>
                      <div style={{display: 'flex', gap: 8}}><div style={{width: 20, height: 20, background: 'var(--blue-500)', color: 'white', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>3</div><span>Verify at sight glass. Photograph after.</span></div>
                    </div>
                  </div>
                </div></div>
            </div>
            {/* ══ SPARES TAB ══ */}
            <div id="tab-spares" style={{display: 'none'}}>
              <div className="page-header"><div className="page-title">Spare Parts Lookup</div><div className="page-subtitle">Search available spares · Sorted by criticality</div></div>
              <div className="card"><div className="table-wrap"><table>
                    <thead><tr><th>Status</th><th>Part No.</th><th>Description</th><th>Stock</th><th>Location</th><th>Machine</th></tr></thead>
                    <tbody>
                      <tr style={{background: '#FEF2F2'}}><td><span className="badge badge-critical">🔴 OOS</span></td><td style={{fontFamily: 'var(--font-mono)'}}>RLY-CTR-63A</td><td>Contactor Relay 63A</td><td><strong style={{color: 'var(--red)'}}>0</strong></td><td>—</td><td>COM-302</td></tr>
                      <tr style={{background: '#FFFBEB'}}><td><span className="badge badge-pending">🟡 Low</span></td><td style={{fontFamily: 'var(--font-mono)'}}>SEAL-CP101-MK</td><td>Mech Seal CP-101</td><td><strong style={{color: 'var(--amber)'}}>1</strong></td><td>Bin S-04</td><td>CP-101</td></tr>
                      <tr><td><span className="badge badge-ok">🟢 OK</span></td><td style={{fontFamily: 'var(--font-mono)'}}>BRG-6308ZZ</td><td>Bearing 6308 ZZ</td><td>4</td><td>Bin B-14</td><td>MDU-115</td></tr>
                      <tr><td><span className="badge badge-ok">🟢 OK</span></td><td style={{fontFamily: 'var(--font-mono)'}}>GRS-EP2-1KG</td><td>EP2 Grease 1kg</td><td>6</td><td>Bin G-02</td><td>Multi</td></tr>
                      <tr><td><span className="badge badge-ok">🟢 OK</span></td><td style={{fontFamily: 'var(--font-mono)'}}>OIL-VG68-5L</td><td>ISO VG 68 Oil 5L</td><td>8</td><td>Oil Room R3</td><td>Multi</td></tr>
                    </tbody>
                  </table></div></div>
            </div>
          </main>
        </div>
        {/* ══ COMPLETE WO MODAL ══ */}
        <div className="modal-overlay" id="completeModal">
          <div className="modal" style={{maxWidth: 560}}>
            <div className="modal-header"><div className="modal-title" id="complete-modal-title">✅ Submit Work Completion</div><button className="modal-close" onClick={(e) => { document.getElementById('completeModal').classList.remove('open') }}>✕</button></div>
            <div className="modal-body">
              <div id="complete-summary" style={{background: 'var(--slate-50)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 14, fontSize: 12, border: '1px solid var(--slate-200)'}} />
              <div className="form-group">
                <label className="form-label">Work Completion Notes <span style={{color: 'var(--red)'}}>*</span></label>
                <textarea className="form-textarea" id="complete-notes" placeholder="Describe what was done, parts replaced, readings after repair, test results…" style={{minHeight: 100}} defaultValue={""} />
              </div>
              <div className="form-group">
                <label className="form-label">Post-Repair Photos (Evidence)</label>
                <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
                  <div className="photo-thumb" id="comp-photo1" onClick={(e) => { capPhotoComp('comp-photo1') }}>📷<br />Before</div>
                  <div className="photo-thumb" id="comp-photo2" onClick={(e) => { capPhotoComp('comp-photo2') }}>📷<br />After</div>
                  <div className="photo-thumb" id="comp-photo3" onClick={(e) => { capPhotoComp('comp-photo3') }}>📷<br />Reading</div>
                </div>
              </div>
              <div className="alert alert-info" style={{fontSize: 12}}>ℹ️ After submission, this WO goes to <strong>Checker (Sandeep Tapkir)</strong> for quality audit.</div>
              <div id="complete-error" className="alert alert-error" style={{display: 'none'}} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={(e) => { document.getElementById('completeModal').classList.remove('open') }}>Cancel</button>
              <button className="btn btn-success" onClick={(e) => { submitComplete() }}>🚀 Submit for Audit</button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}