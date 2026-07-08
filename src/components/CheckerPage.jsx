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
  addAbn(data){
    const items=this.getAll();
    const now=new Date();
    const id='ABN-'+Date.now()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    const ct=items.filter(i=>i.woRef).length;
    const item={
      id, woRef:null, status:'pending_planner',
      priority:data.priority, machine:data.machine,
      checkPoint:data.checkPoint, observed:data.observed,
      cause:data.cause, remarks:data.remarks, photos:data.photos||0,
      loggedBy:'Sandeep Tapkir',
      loggedAt:now.toISOString(),
      loggedDate:now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),
      loggedTime:now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),
      assignedTo:null, scheduledDate:null, plannedAt:null,
      completedAt:null, completionNotes:null, completedBy:null,
      auditResult:null, auditedAt:null, reworkCount:0,
      history:[{stage:'Abnormality Logged',by:'Sandeep Tapkir',at:now.toISOString(),note:data.remarks||'Abnormality observed during PM inspection',icon:'⚠️'}]
    };
    items.unshift(item);
    this.save(items);
    return item;
  },
  complete(id,data){
    const items=this.getAll(), item=items.find(i=>i.id===id);
    if(!item)return;
    const now=new Date();
    item.status='pending_audit'; item.completedAt=now.toISOString();
    item.completionNotes=data.notes; item.completedBy=data.by;
    item.history.push({stage:'Work Completed by Executor',by:data.by,at:now.toISOString(),note:data.notes,icon:'🔧'});
    this.save(items); return item;
  },
  audit(id,pass,notes){
    const items=this.getAll(), item=items.find(i=>i.id===id);
    if(!item)return;
    const now=new Date();
    if(pass){ item.status='closed'; item.auditResult='pass'; }
    else { item.status='rework'; item.auditResult='fail'; item.reworkCount=(item.reworkCount||0)+1; item.assignedTo=null; item.scheduledDate=null; item.woRef=null; }
    item.auditedAt=now.toISOString();
    item.history.push({stage:pass?'Audit PASSED ✅ — WO Closed':'Audit FAILED ✗ — Sent for Rework',by:'Sandeep Tapkir',at:now.toISOString(),note:notes,icon:pass?'✅':'🔁'});
    this.save(items); return item;
  }
};

let checkState={}, activeCI=null, activeAuditId=null;

function statusPill(s){
  const m={
    pending_planner:{cls:'wf-pill pending-planner',label:'📨 Awaiting Planner'},
    pending_executor:{cls:'wf-pill pending-executor',label:'🔧 WO Assigned — Executor'},
    pending_audit:{cls:'wf-pill pending-audit',label:'🔍 Pending Audit'},
    rework:{cls:'wf-pill rework',label:'🔁 Rework'},
    closed:{cls:'wf-pill closed',label:'✅ Closed'}
  };
  return `<span class="${(m[s]||{cls:'badge badge-closed'}).cls}">${(m[s]||{label:s}).label}</span>`;
}

function priBadge(p){
  const m={critical:'badge-critical',high:'badge-high',medium:'badge-medium',low:'badge-low'};
  const icons={critical:'🔴',high:'🟠',medium:'🟡',low:'🟢'};
  return `<span class="badge ${m[p]||'badge-closed'}">${icons[p]||''} ${p}</span>`;
}

function flowTrack(item){
  const stages=[
    {key:'logged',label:'Logged',icon:'⚠️'},
    {key:'planner',label:'Planner',icon:'📋'},
    {key:'executor',label:'Executor',icon:'🔧'},
    {key:'audit',label:'Audit',icon:'🔍'},
    {key:'closed',label:'Closed',icon:'✅'}
  ];
  const stateMap={
    pending_planner:1, pending_executor:2, pending_audit:3, rework:3, closed:4
  };
  const activeIdx = stateMap[item.status] ?? 0;
  const fail = item.status==='rework';
  let html='<div class="flow-track">';
  stages.forEach((s,i)=>{
    const done=i<activeIdx, active=i===activeIdx, isFail=fail&&i===3;
    const dotCls=isFail?'fail':done?'done':active?'active':'';
    html+=`<div class="flow-node"><div class="flow-node-dot ${dotCls}">${done?'✓':s.icon}</div><div class="flow-node-label ${active?'active':''}">${s.label}</div></div>`;
    if(i<stages.length-1) html+=`<div class="flow-connector ${done?'done':''}"></div>`;
  });
  return html+'</div>';
}

function renderAbnCard(item, mode='checker'){
  const pCls={critical:'critical',high:'high',medium:'medium',low:'low'}[item.priority]||'';
  const ts=item.loggedDate+' '+item.loggedTime;
  return `<div class="wf-card ${pCls}" id="wfcard-${item.id}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px;margin-bottom:8px">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--blue-900)">⚠️ ${item.checkPoint}</div>
        <div style="font-size:11px;color:var(--slate-500);margin-top:2px">${ts} · ${item.loggedBy} · ${item.machine}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">${priBadge(item.priority)}${statusPill(item.status)}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;font-size:12px">
      <div style="background:var(--slate-50);border-radius:6px;padding:8px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--slate-400);margin-bottom:2px">Observed</div>${item.observed||'—'}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:8px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--slate-400);margin-bottom:2px">Probable Cause</div>${item.cause||'—'}</div>
    </div>
    ${item.woRef?`<div style="font-size:11px;color:var(--slate-600);margin-bottom:6px">📋 WO: <strong style="font-family:var(--font-mono)">${item.woRef}</strong>${item.assignedTo?' · Assigned to: <strong>'+item.assignedTo+'</strong>':''}</div>`:''}
    ${flowTrack(item)}
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="openDetail('${item.id}')">📄 View Full Detail</button>
      ${item.status==='pending_audit'?`<button class="btn btn-primary btn-sm" onclick="openAudit('${item.id}')">✅ Start Audit</button>`:''}
      ${item.status==='rework'?`<span style="font-size:11px;color:var(--red);font-weight:600;padding:5px 0">🔁 Rework #${item.reworkCount} — Re-planning in progress</span>`:''}
    </div>
  </div>`;
}

function renderAbnTab(){
  const items=WF.getAll().filter(i=>i.status!=='closed');
  const list=document.getElementById('abn-list');
  const empty=document.getElementById('abn-empty');
  const badge=document.getElementById('abn-count-badge');
  if(badge)badge.textContent=items.length;
  if(!items.length){ if(empty)empty.style.display='flex'; list.innerHTML=''; return; }
  if(empty)empty.style.display='none';
  list.innerHTML=items.map(i=>renderAbnCard(i)).join('');
  const subtitle=document.getElementById('abn-subtitle');
  if(subtitle)subtitle.textContent=`${items.length} active · Last updated: ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`;
}

function renderAuditTab(){
  const items=WF.getAll().filter(i=>i.status==='pending_audit');
  const list=document.getElementById('audit-list');
  const empty=document.getElementById('audit-empty');
  const badge=document.getElementById('audit-count-badge');
  if(badge)badge.textContent=items.length;
  if(!items.length){ if(empty)empty.style.display='block'; list.innerHTML=''; return; }
  if(empty)empty.style.display='none';
  list.innerHTML=items.map(item=>`
    <div class="audit-action-card ${item.priority}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--blue-900)">${item.checkPoint}</div>
          <div style="font-size:11px;color:var(--slate-500);margin-top:2px">WO: <strong style="font-family:var(--font-mono)">${item.woRef||'—'}</strong> · Completed by: <strong>${item.completedBy||'—'}</strong></div>
        </div>
        ${priBadge(item.priority)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:12px;margin-bottom:10px">
        <div style="background:var(--slate-50);border-radius:6px;padding:8px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);margin-bottom:2px">Machine</div>${item.machine}</div>
        <div style="background:var(--slate-50);border-radius:6px;padding:8px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);margin-bottom:2px">Completed</div>${item.completedAt?new Date(item.completedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</div>
        <div style="background:var(--slate-50);border-radius:6px;padding:8px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);margin-bottom:2px">Executor Notes</div>${item.completionNotes||'—'}</div>
      </div>
      ${item.reworkCount>0?`<div class="alert alert-warning" style="margin-bottom:8px;font-size:11px">⚠️ This is rework attempt #${item.reworkCount}</div>`:''}
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="openDetail('${item.id}')">📄 View Detail</button>
        <button class="btn btn-primary btn-sm" onclick="openAudit('${item.id}')">🔍 Perform Audit</button>
      </div>
    </div>
  `).join('');
}

function renderHistoryTab(){
  const items=WF.getAll();
  const list=document.getElementById('history-list');
  if(!items.length){ list.innerHTML='<div class="alert alert-info">No workflow items yet.</div>'; return; }
  list.innerHTML=items.map(item=>`
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--blue-900)">${item.checkPoint}</div>
          <div style="font-size:11px;color:var(--slate-500);margin-top:2px">${item.machine} · Logged: ${item.loggedDate} ${item.loggedTime}${item.woRef?' · WO: <strong style="font-family:var(--font-mono)">'+item.woRef+'</strong>':''}</div>
        </div>
        <div style="display:flex;gap:6px">${priBadge(item.priority)}${statusPill(item.status)}</div>
      </div>
      ${flowTrack(item)}
      <div style="margin-top:10px">
        <div style="font-size:11px;font-weight:700;color:var(--slate-500);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Timeline</div>
        <div class="timeline-wf">
          ${item.history.map((h,i)=>`
            <div class="tl-item">
              <div class="tl-dot">${h.icon||'📌'}</div>
              <div class="tl-content">
                <div class="tl-title">${h.stage}</div>
                <div class="tl-meta">${h.by} · ${new Date(h.at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                ${h.note?`<div style="font-size:11px;color:var(--slate-600);margin-top:2px">${h.note}</div>`:''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function renderConsolidated(){
  const items=WF.getAll();
  const list=document.getElementById('consol-list');
  const now=new Date();
  document.getElementById('consol-date').textContent=now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  document.getElementById('c-total').textContent=items.length;
  document.getElementById('c-crit').textContent=items.filter(i=>i.priority==='critical').length;
  document.getElementById('c-high').textContent=items.filter(i=>i.priority==='high').length;
  document.getElementById('c-fwd').textContent=items.filter(i=>i.status!=='pending_planner').length;
  if(!items.length){ list.innerHTML='<div class="alert alert-info">No items consolidated yet.</div>'; return; }
  list.innerHTML=`<div class="card"><div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Abnormality</th><th>Machine</th><th>Priority</th><th>Logged</th><th>WO Ref</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${items.map(item=>`<tr>
      <td style="font-family:var(--font-mono);font-size:11px">${item.id.slice(-8)}</td>
      <td><div style="font-size:12px;font-weight:600">${item.checkPoint}</div><div style="font-size:10px;color:var(--slate-400)">${item.observed||''}</div></td>
      <td>${item.machine}</td>
      <td>${priBadge(item.priority)}</td>
      <td style="font-size:11px;white-space:nowrap">${item.loggedDate}<br>${item.loggedTime}</td>
      <td style="font-family:var(--font-mono);font-size:11px">${item.woRef||'—'}</td>
      <td>${statusPill(item.status)}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openDetail('${item.id}')">Detail</button></td>
    </tr>`).join('')}</tbody>
  </table></div></div>`;
}

function showTab(name,el){
  document.querySelectorAll('[id^="tab-"]').forEach(t=>t.style.display='none');
  document.getElementById('tab-'+name).style.display='block';
  document.querySelectorAll('.sidebar-link').forEach(l=>l.classList.remove('active'));
  if(el)el.classList.add('active');
  if(name==='abnormalities') renderAbnTab();
  else if(name==='audit') renderAuditTab();
  else if(name==='history') renderHistoryTab();
  else if(name==='consolidated') renderConsolidated();
  else if(name==='calendar'){const n=new Date();ckBuildCalendar(ckCalYear||n.getFullYear(),ckCalMonth!==undefined?ckCalMonth:n.getMonth());}
}

function selEquip(btn,id,name){
  document.querySelectorAll('[id^="ebtn-"]').forEach(b=>{b.className='btn btn-secondary btn-sm';});
  btn.className='btn btn-primary btn-sm';
  document.getElementById('eid').textContent=id;
  document.getElementById('ename').textContent=name;
  checkState={};updateProg();
  document.querySelectorAll('.checklist-item').forEach(c=>c.classList.remove('ok','abnormal'));
  document.querySelectorAll('.check-btn').forEach(b=>b.classList.remove('active'));
}

function markOK(idx,btn){
  checkState[idx]='ok';
  const item=document.getElementById('ci-'+idx);
  item.classList.remove('ok','abnormal');item.classList.add('ok');
  item.querySelectorAll('.check-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); updateProg();
}

function updateProg(){
  const done=Object.keys(checkState).length,total=5;
  document.getElementById('prog-txt').textContent=done+' / '+total;
  document.getElementById('prog-fill').style.width=(done/total*100)+'%';
  const abn=Object.values(checkState).filter(s=>s==='abnormal').length;
  document.getElementById('prog-fill').className='progress-fill '+(abn>0?'amber':'green');
}

function submitInsp(){document.getElementById('insp-success').style.display='flex';}

function captureAbnPhoto(id){const el=document.getElementById(id);el.classList.add('captured');el.innerHTML='✅<br>Captured';}

function openQuickAbn(){
  document.getElementById('modal-cp-name').textContent='Quick Log (no checklist)';
  document.getElementById('obs-val').value='';
  document.getElementById('prob-cause').value='';
  document.getElementById('abn-remarks').value='';
  document.getElementById('abn-modal-error').style.display='none';
  ['abn-photo1','abn-photo2','abn-photo3'].forEach(id=>{
    const el=document.getElementById(id);
    el.classList.remove('captured');el.innerHTML=`📷<br>${id.slice(-6)}`;
  });
  document.getElementById('abnModal').classList.add('open');
}

function openAbnModal(idx,name,observed){
  activeCI=idx; checkState[idx]='abnormal';
  const item=document.getElementById('ci-'+idx);
  item.classList.remove('ok');item.classList.add('abnormal');
  item.querySelectorAll('.check-btn').forEach(b=>b.classList.remove('active'));
  item.querySelector('.check-btn-abn').classList.add('active');
  updateProg();
  document.getElementById('modal-cp-name').textContent=name;
  document.getElementById('obs-val').value=observed||'';
  document.getElementById('prob-cause').value='';
  document.getElementById('abn-remarks').value='';
  document.getElementById('abn-modal-error').style.display='none';
  ['abn-photo1','abn-photo2','abn-photo3'].forEach(id=>{
    const el=document.getElementById(id);
    el.classList.remove('captured');el.innerHTML=`📷<br>${id.slice(-6)}`;
  });
  document.getElementById('abnModal').classList.add('open');
}

function closeAbn(){document.getElementById('abnModal').classList.remove('open');}

function submitAbn(){
  const cp=document.getElementById('modal-cp-name').textContent;
  const obs=document.getElementById('obs-val').value.trim();
  const cause=document.getElementById('prob-cause').value.trim();
  const remarks=document.getElementById('abn-remarks').value.trim();
  const machine=document.getElementById('abn-machine').value;
  const prio=document.getElementById('abn-prio').value;
  const errEl=document.getElementById('abn-modal-error');
  if(!obs){errEl.textContent='Please enter observed value/condition.';errEl.style.display='flex';return;}
  errEl.style.display='none';
  const photos=['abn-photo1','abn-photo2','abn-photo3'].filter(id=>document.getElementById(id).classList.contains('captured')).length;
  const item=WF.addAbn({checkPoint:cp,observed:obs,cause,remarks,machine,priority:prio,photos});
  closeAbn();
  // Book on calendar
  const now=new Date();
  const key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  if(!ckEvents[key])ckEvents[key]=[];
  ckEvents[key].push({type:'wo',label:cp+' — '+machine,time:item.loggedTime,icon:'⚠️',status:'logged',woRef:null});
  // Inline confirmation
  if(activeCI){
    const ciEl=document.getElementById('ci-'+activeCI);
    if(ciEl){
      const old=ciEl.querySelector('.abn-confirm');
      if(old)old.remove();
      const pill=document.createElement('div');
      pill.className='abn-confirm';
      pill.style.cssText='display:flex;align-items:center;gap:8px;background:#ECFDF5;border:1px solid var(--green-border);border-radius:var(--radius);padding:7px 10px;margin-top:8px;font-size:11px;color:#065F46;font-weight:600;flex-wrap:wrap';
      pill.innerHTML=`✅ Logged · <strong>ID: ${item.id.slice(-8)}</strong> · Status: <span style="color:var(--blue-500)">Forwarded to Planner</span> · <a href="#" onclick="showTab('abnormalities',document.getElementById('sb-abn'));return false;" style="color:var(--blue-500)">View →</a>`;
      ciEl.appendChild(pill);
    }
    activeCI=null;
  }
  // Update badges
  const all=WF.getAll();
  const abn=document.getElementById('abn-count-badge');
  if(abn)abn.textContent=all.filter(i=>i.status!=='closed').length;
  // Show toast
  showToast('⚠️ Abnormality logged & forwarded to Planner!','success');
}

function logIIoTAlert(cp,obs,cause,machine,prio){
  document.getElementById('modal-cp-name').textContent=cp;
  document.getElementById('obs-val').value=obs;
  document.getElementById('prob-cause').value=cause;
  document.getElementById('abn-machine').value=machine;
  document.getElementById('abn-prio').value=prio;
  document.getElementById('abn-remarks').value='Auto-detected by IIoT sensor system';
  document.getElementById('abn-modal-error').style.display='none';
  document.getElementById('abnModal').classList.add('open');
}

function openAudit(id){
  activeAuditId=id;
  const items=WF.getAll(); const item=items.find(i=>i.id===id);
  if(!item)return;
  document.getElementById('audit-modal-title').textContent='🔍 Audit: '+item.checkPoint;
  document.getElementById('audit-notes').value='';
  document.getElementById('audit-modal-body').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div class="stat-card" style="--stat-color:#2563EB"><div class="stat-label">Machine</div><div class="stat-value" style="font-size:16px">${item.machine}</div></div>
      <div class="stat-card" style="--stat-color:#D97706"><div class="stat-label">WO Reference</div><div class="stat-value" style="font-size:14px;font-family:var(--font-mono)">${item.woRef||'—'}</div></div>
    </div>
    <div style="background:var(--slate-50);border-radius:var(--radius);padding:12px;margin-bottom:12px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">
        <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:2px">Original Abnormality</div>${item.checkPoint}</div>
        <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:2px">Observed</div>${item.observed||'—'}</div>
        <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:2px">Completed By</div>${item.completedBy||'—'}</div>
        <div><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:2px">Completion Notes</div>${item.completionNotes||'—'}</div>
      </div>
    </div>
    <div class="alert alert-info" style="font-size:12px">🔍 Verify: Is the issue fully resolved? Check physically at the machine before marking PASS.</div>
    ${item.reworkCount>0?`<div class="alert alert-warning" style="font-size:12px">⚠️ This is Rework Attempt #${item.reworkCount}. Verify extra carefully.</div>`:''}
  `;
  document.getElementById('auditModal').classList.add('open');
}

function submitAudit(pass){
  const notes=document.getElementById('audit-notes').value.trim();
  if(!notes){showToast('Please enter audit remarks before submitting.','error');return;}
  const item=WF.audit(activeAuditId,pass,notes);
  document.getElementById('auditModal').classList.remove('open');
  renderAuditTab();
  const badge=document.getElementById('audit-count-badge');
  if(badge)badge.textContent=WF.getAll().filter(i=>i.status==='pending_audit').length;
  showToast(pass?'✅ Audit PASSED — WO Closed!':'🔁 Audit FAILED — Sent for Rework to Planner','success');
}

function openDetail(id){
  const item=WF.getAll().find(i=>i.id===id);
  if(!item)return;
  document.getElementById('detail-modal-title').textContent='📄 '+item.checkPoint;
  document.getElementById('detail-modal-body').innerHTML=`
    <div style="margin-bottom:14px">${flowTrack(item)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;margin-bottom:14px">
      <div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Machine</div>${item.machine}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Priority</div>${item.priority}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Observed</div>${item.observed||'—'}</div>
      <div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Cause</div>${item.cause||'—'}</div>
      ${item.woRef?`<div style="background:var(--blue-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">WO Reference</div><strong style="font-family:var(--font-mono)">${item.woRef}</strong></div>`:''}
      ${item.assignedTo?`<div style="background:var(--slate-50);border-radius:6px;padding:10px"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:3px">Assigned To</div>${item.assignedTo}</div>`:''}
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--slate-500);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Workflow Timeline</div>
    <div class="timeline-wf">${item.history.map(h=>`
      <div class="tl-item">
        <div class="tl-dot">${h.icon||'📌'}</div>
        <div class="tl-content">
          <div class="tl-title">${h.stage}</div>
          <div class="tl-meta">${h.by} · ${new Date(h.at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
          ${h.note?`<div style="font-size:11px;color:var(--slate-600);margin-top:2px">${h.note}</div>`:''}
        </div>
      </div>`).join('')}
    </div>
  `;
  document.getElementById('detailModal').classList.add('open');
}

const CK_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

const CK_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

let ckCalYear,ckCalMonth;

let ckEvents={};

function ckSeed(year,month){
  const k=d=>`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const dim=new Date(year,month+1,0).getDate();
  for(let d=1;d<=dim;d++){
    const dow=new Date(year,month,d).getDay();
    if(dow===0||dow===6)continue;
    if(d%2===0){if(!ckEvents[k(d)])ckEvents[k(d)]=[];ckEvents[k(d)].push({type:'insp',label:'CP-101 Daily PM',time:'08:00',icon:'⚙️'});}
    if(dow===1&&d<=22){if(!ckEvents[k(d)])ckEvents[k(d)]=[];ckEvents[k(d)].push({type:'insp',label:'HX-204 Weekly PM',time:'14:00',icon:'🔥'});}
    if(d<=5){if(!ckEvents[k(d)])ckEvents[k(d)]=[];ckEvents[k(d)].push({type:'overdue',label:'COM-302 PM — OVERDUE',time:'—',icon:'💨'});}
  }
  // Add WO-booked events from workflow items
  WF.getAll().forEach(item=>{
    if(item.loggedAt){
      const dt=new Date(item.loggedAt);
      if(dt.getFullYear()===year&&dt.getMonth()===month){
        const kk=k(dt.getDate());
        if(!ckEvents[kk])ckEvents[kk]=[];
        ckEvents[kk].push({type:'wo',label:item.checkPoint,time:item.loggedTime,icon:'⚠️',status:item.status,id:item.id});
      }
    }
    if(item.auditedAt&&item.status==='pending_audit'){
      const dt=new Date(item.auditedAt);
      if(dt.getFullYear()===year&&dt.getMonth()===month){
        const kk=k(dt.getDate());
        if(!ckEvents[kk])ckEvents[kk]=[];
        ckEvents[kk].push({type:'audit',label:'Audit Due: '+item.checkPoint,time:'—',icon:'🔍',id:item.id});
      }
    }
  });
}

function ckBuildCalendar(year,month){
  ckCalYear=year;ckCalMonth=month;
  ckEvents={};ckSeed(year,month);
  const n=new Date(),ty=n.getFullYear(),tm=n.getMonth(),td=n.getDate();
  document.getElementById('ck-cal-month-label').textContent=CK_MONTHS[month]+' '+year;
  document.getElementById('ck-cal-subtitle').textContent='Scheduled by Planner — Vishwas Landage · '+CK_MONTHS[month]+' '+year;
  const grid=document.getElementById('ck-cal-grid');
  grid.innerHTML='';
  CK_DAYS.forEach(d=>{const h=document.createElement('div');h.className='cal-day-header';h.textContent=d;grid.appendChild(h);});
  const firstDow=new Date(year,month,1).getDay();
  const offset=firstDow===0?6:firstDow-1;
  const dimPrev=new Date(year,month,0).getDate();
  const dim=new Date(year,month+1,0).getDate();
  for(let i=offset-1;i>=0;i--){const c=document.createElement('div');c.className='cal-day';c.style.color='var(--slate-300)';c.textContent=dimPrev-i;grid.appendChild(c);}
  for(let d=1;d<=dim;d++){
    const dk=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const evs=ckEvents[dk]||[];
    const isToday=year===ty&&month===tm&&d===td;
    const hasOver=evs.some(e=>e.type==='overdue');
    const hasWO=evs.some(e=>e.type==='wo');
    const hasAudit=evs.some(e=>e.type==='audit');
    const hasInsp=evs.some(e=>e.type==='insp');
    let cls='cal-day';
    if(isToday)cls+=' today';
    if(hasOver)cls+=' has-overdue';
    else if(hasWO||hasAudit)cls+=' has-wo';
    else if(hasInsp)cls+=' has-task';
    const cell=document.createElement('div');cell.className=cls;
    cell.innerHTML=`<span>${d}</span>`;
    if(evs.length>0){
      const dot=document.createElement('span');dot.style.cssText='position:absolute;bottom:3px;left:50%;transform:translateX(-50%);display:flex;gap:2px';
      evs.slice(0,3).forEach(ev=>{const dd=document.createElement('span');dd.style.cssText=`width:4px;height:4px;border-radius:50%;background:${ev.type==='overdue'?'var(--red)':ev.type==='audit'?'#7C3AED':ev.type==='wo'?'var(--amber)':isToday?'white':'var(--green)'}`;dot.appendChild(dd);});
      cell.appendChild(dot);cell.style.cursor='pointer';
      cell.addEventListener('click',()=>ckShowDay(d,month,year,dk,evs,isToday));
    }
    grid.appendChild(cell);
  }
  const rem=(offset+dim)%7===0?0:7-(offset+dim)%7;
  for(let d=1;d<=rem;d++){const c=document.createElement('div');c.className='cal-day';c.style.color='var(--slate-300)';c.textContent=d;grid.appendChild(c);}
}

function ckShowDay(day,month,year,dk,evs,isToday){
  const dt=document.getElementById('ck-day-detail'),tl=document.getElementById('ck-day-title'),body=document.getElementById('ck-day-body');
  tl.textContent='📅 '+new Date(year,month,day).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})+(isToday?' — TODAY':'');
  let html='<div style="display:flex;flex-direction:column;gap:8px">';
  if(!evs.length)html+='<div style="color:var(--slate-400);font-size:13px">No tasks this day.</div>';
  else evs.forEach(ev=>{
    const border=ev.type==='overdue'?'var(--red-border)':ev.type==='audit'?'#DDD6FE':ev.type==='wo'?'var(--amber-border)':'var(--slate-200)';
    const badge=ev.type==='overdue'?'badge-abnormal':ev.type==='audit'?'badge-pending':ev.type==='wo'?'badge-progress':'badge-ok';
    const bLabel=ev.type==='overdue'?'Overdue':ev.type==='audit'?'Audit Due':ev.type==='wo'?'WO Logged':'PM Scheduled';
    html+=`<div style="display:flex;align-items:center;gap:10px;background:white;border-radius:var(--radius);padding:10px 12px;border:1px solid ${border}">
      <span style="font-size:18px">${ev.icon||'📋'}</span>
      <div style="flex:1"><div style="font-size:13px;font-weight:600">${ev.label}</div><div style="font-size:11px;color:var(--slate-500)">${ev.time}</div></div>
      <span class="badge ${badge}">${bLabel}</span>
      ${ev.id?`<button class="btn btn-ghost btn-sm" onclick="openDetail('${ev.id}');document.getElementById('ck-day-detail').style.display='none'">Detail</button>`:''}
    </div>`;
  });
  html+='</div>';body.innerHTML=html;dt.style.display='block';
}

function ckCalNav(dir){ckCalMonth+=dir;if(ckCalMonth>11){ckCalMonth=0;ckCalYear++;}if(ckCalMonth<0){ckCalMonth=11;ckCalYear--;}ckBuildCalendar(ckCalYear,ckCalMonth);}

function ckCalToday(){const n=new Date();ckBuildCalendar(n.getFullYear(),n.getMonth());}

function showToast(msg,type){
  let t=document.getElementById('wf-toast');
  if(!t){t=document.createElement('div');t.id='wf-toast';t.style.cssText='position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:var(--radius-lg);font-size:13px;font-weight:600;z-index:9999;box-shadow:var(--shadow-lg);max-width:360px;transition:opacity .3s';document.body.appendChild(t);}
  t.style.background=type==='error'?'var(--red-light)':type==='success'?'var(--green-light)':'var(--blue-50)';
  t.style.color=type==='error'?'#991B1B':type==='success'?'#065F46':'#1E40AF';
  t.style.border=`1px solid ${type==='error'?'var(--red-border)':type==='success'?'var(--green-border)':'#BFDBFE'}`;
  t.textContent=msg;t.style.opacity='1';
  clearTimeout(t._timer);t._timer=setTimeout(()=>t.style.opacity='0',3000);
}

export default function CheckerPage({ onNavigate }) {
  useEffect(() => {
    function t(){var n=new Date();document.getElementById('ck-clock').textContent=n.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}t();const _iv = setInterval(t, 1000);
        return () => clearInterval(_iv);
  }, []);

  useEffect(() => {
    const cleanups = [];
    const _storageHandler = e=>{
      if(e.key==='smartpm_sync'){
        const activeTab=document.querySelector('[id^="tab-"]:not([style*="none"])');
        if(activeTab){
          const name=activeTab.id.replace('tab-','');
          if(name==='abnormalities')renderAbnTab();
          else if(name==='audit')renderAuditTab();
          else if(name==='history')renderHistoryTab();
        }
        const badge=document.getElementById('audit-count-badge');
        if(badge)badge.textContent=WF.getAll().filter(i=>i.status==='pending_audit').length;
        const abadge=document.getElementById('abn-count-badge');
        if(abadge)abadge.textContent=WF.getAll().filter(i=>i.status!=='closed').length;
      }
    };
        window.addEventListener('storage', _storageHandler);
        cleanups.push(() => window.removeEventListener('storage', _storageHandler));
    (()=>{
      document.getElementById('insp-today-label').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
      document.getElementById('iiot-time').textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
      const n=new Date();
      ckCalYear=n.getFullYear();ckCalMonth=n.getMonth();
      const abad=document.getElementById('abn-count-badge');if(abad)abad.textContent=WF.getAll().filter(i=>i.status!=='closed').length;
      const aubd=document.getElementById('audit-count-badge');if(aubd)aubd.textContent=WF.getAll().filter(i=>i.status==='pending_audit').length;
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
.wf-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
.wf-pill.pending-planner{background:#EFF6FF;color:#1E40AF}
.wf-pill.pending-executor{background:#FFFBEB;color:#92400E}
.wf-pill.pending-audit{background:#ECFEFF;color:#155E75}
.wf-pill.rework{background:#FFF1F2;color:#9F1239}
.wf-pill.closed{background:#ECFDF5;color:#065F46}
.flow-track{display:flex;align-items:center;gap:0;margin:12px 0 4px;flex-wrap:nowrap;overflow-x:auto}
.flow-node{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:70px;flex-shrink:0}
.flow-node-dot{width:24px;height:24px;border-radius:50%;border:2px solid var(--slate-300);background:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--slate-400)}
.flow-node-dot.done{background:var(--green);border-color:var(--green);color:white}
.flow-node-dot.active{background:var(--blue-500);border-color:var(--blue-500);color:white;box-shadow:0 0 0 3px rgba(37,99,235,.2)}
.flow-node-dot.fail{background:var(--red);border-color:var(--red);color:white}
.flow-node-label{font-size:9px;color:var(--slate-400);text-align:center;line-height:1.3;font-weight:600;text-transform:uppercase;letter-spacing:.3px}
.flow-node-label.active{color:var(--blue-500)}
.flow-connector{flex:1;height:2px;background:var(--slate-200);min-width:16px}
.flow-connector.done{background:var(--green)}
.audit-action-card{background:white;border:1.5px solid var(--slate-200);border-radius:var(--radius-lg);padding:16px 18px;margin-bottom:12px}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-day-header{text-align:center;font-size:10px;font-weight:700;color:var(--slate-400);padding:4px}
.cal-day{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;position:relative;transition:all .15s}
.cal-day:hover{background:var(--blue-50)}
.cal-day.today{background:var(--blue-500);color:white;font-weight:700}
.cal-day.has-task::after{content:'';position:absolute;bottom:3px;width:4px;height:4px;border-radius:50%;background:var(--green)}
.cal-day.today.has-task::after{background:white}
.cal-day.has-overdue::after{background:var(--red)}
.cal-day.has-wo::after{background:var(--amber)}
.sop-inline{background:var(--blue-50);border:1px solid #BFDBFE;border-radius:var(--radius);padding:10px 12px;margin-top:6px;font-size:12px;display:none}
.sop-inline.open{display:block}
.sop-step-row{display:flex;gap:8px;margin-bottom:6px;align-items:flex-start}
.sop-step-num{width:18px;height:18px;background:var(--blue-500);color:white;border-radius:50%;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.photo-row{display:flex;gap:10px;margin:10px 0;flex-wrap:wrap}
.photo-thumb{width:80px;height:60px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;font-weight:600;text-align:center;line-height:1.3;border:2px dashed var(--slate-300);background:var(--slate-50);transition:all .2s;flex-shrink:0}
.photo-thumb:hover{border-color:var(--blue-400)}
.photo-thumb.captured{border-style:solid;border-color:var(--green);background:var(--green-light);color:var(--green)}
.timeline-wf{padding:0}
.tl-item{display:flex;gap:12px;padding:8px 0;position:relative}
.tl-item:not(:last-child)::after{content:'';position:absolute;left:11px;top:28px;bottom:0;width:2px;background:var(--slate-200)}
.tl-dot{width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;background:var(--blue-50);border:1.5px solid var(--blue-200)}
.tl-content{flex:1}
.tl-title{font-size:12px;font-weight:700;color:var(--blue-900)}
.tl-meta{font-size:11px;color:var(--slate-400);margin-top:1px}
.notif-dot{position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:var(--red);border-radius:50%;border:1.5px solid white}

`}</style>
      <div>
        <nav className="top-nav">
          <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}><div className="nav-logo-icon">🔍</div><div><div className="nav-logo-text">SmartPM</div><div className="nav-logo-sub">Checker Portal</div></div></a>
          <div className="nav-spacer" />
          <div className="nav-role-badge"><div className="nav-role-dot" style={{background: '#059669'}} /><span className="nav-role-name">Sandeep Tapkir · Checker</span></div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="nav-home-btn" style={{marginLeft: 12}}>← Home</a>
          <div id="ck-clock" style={{color: 'rgba(255,255,255,.5)', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 10}} />
        </nav>
        <div className="app-layout">
          <aside className="sidebar">
            <div className="sidebar-section-label">My Tasks</div>
            <a href="#" className="sidebar-link active" onClick={(e) => { showTab('inspection',e.currentTarget) }}><span className="link-icon">🔍</span>PM Inspection<span className="sidebar-badge amber">2</span></a>
            <a href="#" className="sidebar-link" id="sb-abn" onClick={(e) => { showTab('abnormalities',e.currentTarget) }}><span className="link-icon" style={{position: 'relative'}}>⚠️</span>Abnormalities<span className="sidebar-badge" id="abn-count-badge">0</span></a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('iiot',e.currentTarget) }}><span className="link-icon">📡</span>IIoT Alerts<span className="sidebar-badge">3</span></a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('consolidated',e.currentTarget) }}><span className="link-icon">📋</span>Consolidated List</a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Audit &amp; Schedule</div>
            <a href="#" className="sidebar-link" id="sb-audit" onClick={(e) => { showTab('audit',e.currentTarget) }}><span className="link-icon">✅</span>Audit Queue<span className="sidebar-badge blue" id="audit-count-badge">0</span></a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('calendar',e.currentTarget) }}><span className="link-icon">📅</span>My Calendar</a>
            <a href="#" className="sidebar-link" onClick={(e) => { showTab('history',e.currentTarget) }}><span className="link-icon">📜</span>History &amp; Status</a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Navigate</div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('planner'); }} className="sidebar-link"><span className="link-icon">📋</span>Planner View</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('executor'); }} className="sidebar-link"><span className="link-icon">🔧</span>Executor View</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className="sidebar-link"><span className="link-icon">📊</span>Mentor Dashboard</a>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Quick Actions</div>
            <div style={{padding: '4px 12px 12px'}}>
              <button className="quick-action-btn" onClick={(e) => { openQuickAbn() }}>⚠️ Log Abnormality</button>
              <button className="quick-action-btn" onClick={(e) => { showTab('audit',document.getElementById('sb-audit')) }}>✅ Pending Audits</button>
              <button className="quick-action-btn" onClick={(e) => { showTab('history',document.querySelector('[onclick*=history]')) }}>📜 View History</button>
            </div>
          </aside>
          <main className="main-content">
            {/* ══ INSPECTION TAB ══ */}
            <div id="tab-inspection">
              <div className="page-header">
                <div className="breadcrumb"><span>Checker</span><span className="breadcrumb-sep">›</span>PM Inspection</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8}}>
                  <div><div className="page-title">PM Inspection — <span id="insp-today-label" /></div><div className="page-subtitle">Sandeep Tapkir · Plant A &amp; B</div></div>
                  <div style={{display: 'flex', gap: 8}}>
                    <div id="insp-success" style={{display: 'none', alignItems: 'center', gap: 8, background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: 12, color: '#065F46', fontWeight: 600}}>✅ Inspection submitted — abnormalities forwarded to Planner</div>
                    <button className="btn btn-success btn-sm" onClick={(e) => { submitInsp() }}>✓ Submit Inspection</button>
                  </div>
                </div>
              </div>
              <div className="alert alert-warning">⚠️ COM-302 inspection overdue by 10 days. Prioritise immediately.</div>
              <div className="card" style={{marginBottom: 14}}>
                <div className="card-title" style={{marginBottom: 10}}>Select Equipment to Inspect</div>
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                  <button className="btn btn-primary btn-sm" id="ebtn-cp101" onClick={(e) => { selEquip(e.currentTarget,'CP-101','CP-101 Crusher') }}>⚙️ CP-101 Crusher</button>
                  <button className="btn btn-secondary btn-sm" id="ebtn-hx204" onClick={(e) => { selEquip(e.currentTarget,'HX-204','HX-204 Heat Exchanger') }}>🔥 HX-204 Heat Exch.</button>
                  <button className="btn btn-secondary btn-sm" id="ebtn-com302" onClick={(e) => { selEquip(e.currentTarget,'COM-302','COM-302 Compressor') }}>💨 COM-302 Compressor</button>
                  <button className="btn btn-secondary btn-sm" id="ebtn-mdu115" onClick={(e) => { selEquip(e.currentTarget,'MDU-115','MDU-115 Motor Drive') }}>⚡ MDU-115 Motor Drive</button>
                </div>
              </div>
              <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8}}>
                  <div><div className="card-title">Inspection Checklist — <span id="ename">CP-101 Crusher</span></div><div style={{fontSize: 11, color: 'var(--slate-400)', marginTop: 2}}>Equipment ID: <span id="eid" className="font-mono" style={{fontFamily: 'var(--font-mono)'}}>CP-101</span> · SOP-PM-001</div></div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}><span style={{fontSize: 12, color: 'var(--slate-500)'}}>Progress:</span><div className="progress-bar" style={{width: 160}}><div className="progress-fill green" id="prog-fill" style={{width: 0}} /></div><span style={{fontSize: 12, fontWeight: 700, color: 'var(--blue-900)'}} id="prog-txt">0 / 5</span></div>
                </div>
                <div id="ci-1" className="checklist-item"><div className="check-num">1</div><div className="check-content"><div className="check-title">Bearing Temperature Check</div><div className="check-detail">T1 · Limit: &lt;80°C · Current: 86.3°C ⚠</div></div><div className="check-actions"><button className="check-btn check-btn-ok" onClick={(e) => { markOK(1,e.currentTarget) }}>OK</button><button className="check-btn check-btn-abn" onClick={(e) => { openAbnModal(1,'Bearing Temperature Check — CP-101','86.3°C (limit 80°C)') }}>Abnormal</button></div></div>
                <div id="ci-2" className="checklist-item"><div className="check-num">2</div><div className="check-content"><div className="check-title">Vibration Level — Drive End</div><div className="check-detail">T2 · Limit: &lt;4.5 mm/s · Current: 8.2 mm/s 🔴</div></div><div className="check-actions"><button className="check-btn check-btn-ok" onClick={(e) => { markOK(2,e.currentTarget) }}>OK</button><button className="check-btn check-btn-abn" onClick={(e) => { openAbnModal(2,'Vibration Level — Drive End','8.2 mm/s (critical limit 4.5)') }}>Abnormal</button></div></div>
                <div id="ci-3" className="checklist-item"><div className="check-num">3</div><div className="check-content"><div className="check-title">Oil Level — Gearbox</div><div className="check-detail">T3 · Check sight glass — should be at mid mark</div></div><div className="check-actions"><button className="check-btn check-btn-ok" onClick={(e) => { markOK(3,e.currentTarget) }}>OK</button><button className="check-btn check-btn-abn" onClick={(e) => { openAbnModal(3,'Oil Level — Gearbox','Below minimum mark') }}>Abnormal</button></div></div>
                <div id="ci-4" className="checklist-item"><div className="check-num">4</div><div className="check-content"><div className="check-title">Coupling Guard Integrity</div><div className="check-detail">T5 · Visual — all bolts, no cracks, properly fitted</div></div><div className="check-actions"><button className="check-btn check-btn-ok" onClick={(e) => { markOK(4,e.currentTarget) }}>OK</button><button className="check-btn check-btn-abn" onClick={(e) => { openAbnModal(4,'Coupling Guard Integrity','Guard bolt missing') }}>Abnormal</button></div></div>
                <div id="ci-5" className="checklist-item"><div className="check-num">5</div><div className="check-content"><div className="check-title">Motor Current Draw</div><div className="check-detail">T3 · Rated: 48A · Max 55A · Check ammeter</div></div><div className="check-actions"><button className="check-btn check-btn-ok" onClick={(e) => { markOK(5,e.currentTarget) }}>OK</button><button className="check-btn check-btn-abn" onClick={(e) => { openAbnModal(5,'Motor Current Draw','54.1A — approaching limit') }}>Abnormal</button></div></div>
              </div>
            </div>
            {/* ══ ABNORMALITIES TAB ══ */}
            <div id="tab-abnormalities" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Checker</span><span className="breadcrumb-sep">›</span>Logged Abnormalities</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8}}>
                  <div><div className="page-title">Logged Abnormalities</div><div className="page-subtitle" id="abn-subtitle">Auto-forwarded to Planner in real time</div></div>
                  <button className="btn btn-primary btn-sm" onClick={(e) => { openQuickAbn() }}>+ Log Abnormality</button>
                </div>
              </div>
              <div id="abn-empty" className="alert alert-info" style={{display: 'none'}}>ℹ️ No abnormalities logged yet. Start an inspection to log findings.</div>
              <div id="abn-list" />
            </div>
            {/* ══ IIoT TAB ══ */}
            <div id="tab-iiot" style={{display: 'none'}}>
              <div className="page-header"><div className="page-title">IIoT Auto-Detected Alerts</div><div className="page-subtitle">Real-time sensor abnormalities · <span id="iiot-time" /></div></div>
              <div className="alert alert-info">ℹ️ IIoT alerts below threshold are auto-logged to Consolidated List. Click "Send to Planner" to escalate.</div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 20}}>
                <div className="sensor-card"><div className="sensor-icon" style={{background: '#FEF2F2'}}>🌡️</div><div className="sensor-info"><div className="sensor-name">Bearing Temp — CP-101</div><div className="sensor-value warning">86.3°C</div><div className="sensor-status" style={{color: 'var(--amber)'}}>⚠ Above 80°C</div></div></div>
                <div className="sensor-card"><div className="sensor-icon" style={{background: '#FEF2F2'}}>📳</div><div className="sensor-info"><div className="sensor-name">Vibration — CP-101 DE</div><div className="sensor-value critical">8.2 mm/s</div><div className="sensor-status" style={{color: 'var(--red)'}}>🔴 Critical</div></div></div>
                <div className="sensor-card"><div className="sensor-icon" style={{background: '#FFFBEB'}}>⚡</div><div className="sensor-info"><div className="sensor-name">Motor Current — MDU-115</div><div className="sensor-value warning">54.1A</div><div className="sensor-status" style={{color: 'var(--amber)'}}>⚠ Warning</div></div></div>
                <div className="sensor-card"><div className="sensor-icon" style={{background: '#ECFDF5'}}>🔵</div><div className="sensor-info"><div className="sensor-name">Pressure — HX-204</div><div className="sensor-value normal">5.8 Bar</div><div className="sensor-status" style={{color: 'var(--green)'}}>✓ Normal</div></div></div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Escalate IIoT Alert to Planner</div></div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--red-light)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', flexWrap: 'wrap', gap: 8}}>
                    <div><strong style={{fontSize: 13}}>CP-101 Vibration 8.2 mm/s</strong><div style={{fontSize: 11, color: 'var(--slate-500)'}}>Sensor ID: VIB-CP101-DE · Critical threshold breached</div></div>
                    <button className="btn btn-danger btn-sm" onClick={(e) => { logIIoTAlert('Vibration Critical — CP-101 DE','8.2 mm/s (limit 4.5)','Bearing wear','CP-101','critical') }}>🔴 Escalate to Planner</button>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: 'var(--radius)', flexWrap: 'wrap', gap: 8}}>
                    <div><strong style={{fontSize: 13}}>MDU-115 Motor Current 54.1A</strong><div style={{fontSize: 11, color: 'var(--slate-500)'}}>Sensor ID: AMP-MDU115 · Warning threshold reached</div></div>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { logIIoTAlert('Motor Current High — MDU-115','54.1A (rated 48A, max 55A)','Possible overload','MDU-115','medium') }}>⚠ Escalate to Planner</button>
                  </div>
                </div>
              </div>
            </div>
            {/* ══ CONSOLIDATED TAB ══ */}
            <div id="tab-consolidated" style={{display: 'none'}}>
              <div className="page-header"><div className="page-title">Consolidated Repair List</div><div className="page-subtitle">Manual + IIoT merged · Forwarded to Planner · <span id="consol-date" /></div></div>
              <div className="stat-grid">
                <div className="stat-card" style={{'--stat-color': '#DC2626'}}><div className="stat-label">Critical</div><div className="stat-value" id="c-crit">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#D97706'}}><div className="stat-label">High</div><div className="stat-value" id="c-high">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#2563EB'}}><div className="stat-label">Total Logged</div><div className="stat-value" id="c-total">0</div></div>
                <div className="stat-card" style={{'--stat-color': '#059669'}}><div className="stat-label">Forwarded to Planner</div><div className="stat-value" id="c-fwd">0</div></div>
              </div>
              <div id="consol-list" />
            </div>
            {/* ══ AUDIT TAB ══ */}
            <div id="tab-audit" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Checker</span><span className="breadcrumb-sep">›</span>Audit Queue</div>
                <div><div className="page-title">Work Order Audit Queue</div><div className="page-subtitle">WOs completed by Executor — awaiting your quality verification</div></div>
              </div>
              <div id="audit-empty" className="alert alert-success" style={{display: 'none'}}>✅ No WOs pending audit. All clear!</div>
              <div id="audit-list" />
            </div>
            {/* ══ CALENDAR TAB ══ */}
            <div id="tab-calendar" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Checker</span><span className="breadcrumb-sep">›</span>My Calendar</div>
                <div className="page-title">My Inspection Calendar</div>
                <div className="page-subtitle" id="ck-cal-subtitle">Scheduled by Planner — Vishwas Landage</div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div><div className="card-title" id="ck-cal-month-label">—</div><div style={{fontSize: 11, color: 'var(--slate-400)', marginTop: 2}}>Real-time · Click any day for details</div></div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'}}>
                    <div style={{display: 'flex', gap: 8, fontSize: 11, color: 'var(--slate-500)', alignItems: 'center'}}>
                      <span style={{display: 'flex', alignItems: 'center', gap: 4}}><span style={{width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', display: 'inline-block'}} />PM Due</span>
                      <span style={{display: 'flex', alignItems: 'center', gap: 4}}><span style={{width: 8, height: 8, background: 'var(--amber)', borderRadius: '50%', display: 'inline-block'}} />WO Booked</span>
                      <span style={{display: 'flex', alignItems: 'center', gap: 4}}><span style={{width: 8, height: 8, background: 'var(--red)', borderRadius: '50%', display: 'inline-block'}} />Overdue</span>
                      <span style={{display: 'flex', alignItems: 'center', gap: 4}}><span style={{width: 8, height: 8, background: '#7C3AED', borderRadius: '50%', display: 'inline-block'}} />Audit Due</span>
                    </div>
                    <div style={{display: 'flex', gap: 4}}>
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { ckCalNav(-1) }}>‹ Prev</button>
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { ckCalNav(1) }}>Next ›</button>
                      <button className="btn btn-primary btn-sm" onClick={(e) => { ckCalToday() }}>Today</button>
                    </div>
                  </div>
                </div>
                <div className="cal-grid" id="ck-cal-grid" />
                <div id="ck-day-detail" style={{display: 'none', marginTop: 14, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--slate-200)'}}>
                  <div style={{background: 'var(--blue-900)', color: 'white', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: 13, fontWeight: 700}} id="ck-day-title">—</span>
                    <button onClick={(e) => { document.getElementById('ck-day-detail').style.display='none' }} style={{background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 16}}>✕</button>
                  </div>
                  <div id="ck-day-body" style={{padding: 14, background: 'var(--slate-50)'}} />
                </div>
              </div>
            </div>
            {/* ══ HISTORY TAB ══ */}
            <div id="tab-history" style={{display: 'none'}}>
              <div className="page-header">
                <div className="breadcrumb"><span>Checker</span><span className="breadcrumb-sep">›</span>History &amp; Status</div>
                <div><div className="page-title">Full Workflow History</div><div className="page-subtitle">All abnormalities logged — track status end-to-end</div></div>
              </div>
              <div id="history-list" />
            </div>
          </main>
        </div>
        {/* ══ ABNORMALITY LOG MODAL ══ */}
        <div className="modal-overlay" id="abnModal">
          <div className="modal" style={{maxWidth: 580}}>
            <div className="modal-header"><div className="modal-title">⚠️ Log Abnormality</div><button className="modal-close" onClick={(e) => { closeAbn() }}>✕</button></div>
            <div className="modal-body">
              <div className="alert alert-warning" style={{marginBottom: 14}}>Check Point: <strong id="modal-cp-name">—</strong></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Equipment / Machine</label>
                  <select className="form-select" id="abn-machine">
                    <option value="CP-101">⚙️ CP-101 Crusher</option>
                    <option value="HX-204">🔥 HX-204 Heat Exchanger</option>
                    <option value="COM-302">💨 COM-302 Compressor</option>
                    <option value="MDU-115">⚡ MDU-115 Motor Drive</option>
                    <option value="Forging-Press">🔨 Forging Press</option>
                    <option value="Robotic-Arm">🤖 Robotic Arm</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Priority</label>
                  <select className="form-select" id="abn-prio">
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Observed Value / Condition</label><input className="form-input" id="obs-val" placeholder="e.g. 8.2 mm/s (limit 4.5 mm/s)" /></div>
              <div className="form-group"><label className="form-label">Probable Cause</label><input className="form-input" id="prob-cause" placeholder="e.g. Bearing wear / misalignment" /></div>
              <div className="form-group"><label className="form-label">Remarks / Description</label><textarea className="form-textarea" id="abn-remarks" placeholder="Describe in detail what you observed, when, and conditions…" defaultValue={""} /></div>
              <div className="form-group">
                <label className="form-label">Photo Evidence</label>
                <div className="photo-row">
                  <div className="photo-thumb" id="abn-photo1" onClick={(e) => { captureAbnPhoto('abn-photo1') }}>📷<br />Photo 1</div>
                  <div className="photo-thumb" id="abn-photo2" onClick={(e) => { captureAbnPhoto('abn-photo2') }}>📷<br />Photo 2</div>
                  <div className="photo-thumb" id="abn-photo3" onClick={(e) => { captureAbnPhoto('abn-photo3') }}>📷<br />Photo 3</div>
                </div>
              </div>
              <div id="abn-modal-error" className="alert alert-error" style={{display: 'none'}} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={(e) => { closeAbn() }}>Cancel</button>
              <button className="btn btn-danger" onClick={(e) => { submitAbn() }}>🚀 Log &amp; Forward to Planner</button>
            </div>
          </div>
        </div>
        {/* ══ AUDIT MODAL ══ */}
        <div className="modal-overlay" id="auditModal">
          <div className="modal" style={{maxWidth: 560}}>
            <div className="modal-header"><div className="modal-title" id="audit-modal-title">Audit Work Order</div><button className="modal-close" onClick={(e) => { document.getElementById('auditModal').classList.remove('open') }}>✕</button></div>
            <div className="modal-body" id="audit-modal-body" />
            <div className="modal-footer">
              <div className="form-group" style={{flex: 1, margin: 0}}><textarea className="form-textarea" id="audit-notes" placeholder="Audit remarks / findings…" style={{minHeight: 60}} defaultValue={""} /></div>
              <div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
                <button className="btn btn-danger" onClick={(e) => { submitAudit(false) }}>✗ Fail — Send Rework</button>
                <button className="btn btn-success" onClick={(e) => { submitAudit(true) }}>✓ Pass — Close WO</button>
              </div>
            </div>
          </div>
        </div>
        {/* ══ DETAIL MODAL ══ */}
        <div className="modal-overlay" id="detailModal">
          <div className="modal" style={{maxWidth: 600}}>
            <div className="modal-header"><div className="modal-title" id="detail-modal-title">Abnormality Detail</div><button className="modal-close" onClick={(e) => { document.getElementById('detailModal').classList.remove('open') }}>✕</button></div>
            <div className="modal-body" id="detail-modal-body" />
            <div className="modal-footer"><button className="btn btn-secondary" onClick={(e) => { document.getElementById('detailModal').classList.remove('open') }}>Close</button></div>
          </div>
        </div>
      </div>

    </>
  );
}