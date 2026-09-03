(() => {
  'use strict';
  const data = window.LOGIFRESH_DATA || [];
  const META = [
    ['mes','Mes'],['origen','Origen'],['destino','Destino'],['producto','Producto'],
    ['transportista','Transportista'],['tipo_ruta','Tipo de ruta'],['sla_entrega','SLA'],['tipo_incidente','Incidente']
  ];
  const state = Object.fromEntries(META.map(([k]) => [k,'']));
  const fmtInt = new Intl.NumberFormat('es-MX',{maximumFractionDigits:0});
  const fmtMoney = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
  const fmtDate = new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
  const monthName = {'2026-04':'Abril 2026','2026-05':'Mayo 2026','2026-06':'Junio 2026'};
  const el = id => document.getElementById(id);
  const safe = value => String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function fieldValue(row,key){ return key === 'mes' ? row.fecha_salida.slice(0,7) : row[key]; }
  function filteredData(){ return data.filter(row => META.every(([key]) => !state[key] || String(fieldValue(row,key)) === state[key])); }

  function buildFilters(){
    const grid = el('filterGrid');
    META.forEach(([key,label]) => {
      const wrap=document.createElement('div'); wrap.className='filter-control';
      const lab=document.createElement('label'); lab.htmlFor=`filter-${key}`; lab.textContent=label;
      const select=document.createElement('select'); select.id=`filter-${key}`; select.dataset.key=key;
      const all=document.createElement('option'); all.value=''; all.textContent=`Todos — ${label.toLowerCase()}`; select.appendChild(all);
      const values=[...new Set(data.map(r=>fieldValue(r,key)))].sort((a,b)=>String(a).localeCompare(String(b),'es'));
      values.forEach(v=>{const o=document.createElement('option');o.value=String(v);o.textContent=key==='mes'?(monthName[v]||v):v;select.appendChild(o)});
      select.addEventListener('change',()=>{state[key]=select.value;render()}); wrap.append(lab,select);grid.appendChild(wrap);
    });
  }
  function reset(){ META.forEach(([k])=>{state[k]='';el(`filter-${k}`).value=''}); render(); }

  function metrics(rows){
    const late=rows.filter(r=>r.retraso_min>0), incidents=rows.filter(r=>r.tipo_incidente!=='Sin incidente');
    return {count:rows.length,sla:rows.length?rows.filter(r=>r.sla_entrega==='Cumple').length/rows.length:0,
      lateAvg:late.length?late.reduce((s,r)=>s+r.retraso_min,0)/late.length:0,lateCount:late.length,
      incidents:incidents.length,excursions:rows.filter(r=>r.excursion_temp_mayor_8c==='Sí').length,
      claims:rows.reduce((s,r)=>s+r.reclamacion_mxn,0),sat:rows.length?rows.reduce((s,r)=>s+r.satisfaccion_1_10,0)/rows.length:0};
  }
  function renderKpis(rows){
    const m=metrics(rows), gap=(m.sla-.9)*100;
    const cards=[
      ['Embarques',fmtInt.format(m.count),'registros seleccionados',''],
      ['SLA',`${(m.sla*100).toFixed(1)}%`,'meta claramente definida: 90%',m.sla>=.9?'good':'alert'],
      ['Brecha contra meta',`${gap>=0?'+':''}${gap.toFixed(1)} pp`,'puntos porcentuales vs. 90%',gap>=0?'good':'alert'],
      ['Retraso tardíos',`${m.lateAvg.toFixed(1)} min`,`${fmtInt.format(m.lateCount)} embarques con retraso`,m.lateAvg?'alert':'good'],
      ['Incidentes',fmtInt.format(m.incidents),'distintos de “Sin incidente”',m.incidents?'alert':'good'],
      ['Excursiones >8 °C',fmtInt.format(m.excursions),'alertas de cadena fría',m.excursions?'alert':'good'],
      ['Reclamaciones',fmtMoney.format(m.claims),'suma de montos asociados',m.claims?'alert':'good'],
      ['Satisfacción',`${m.sat.toFixed(1)}/10`,'promedio simple','']
    ];
    el('kpiGrid').innerHTML=cards.map(([label,value,note,cls],i)=>`<article class="kpi ${cls}"><span class="kpi__label">${safe(label)}</span><strong class="kpi__value">${safe(value)}</strong><span class="kpi__note">${safe(note)}</span>${i===1?`<div class="gapbar" aria-hidden="true"><span style="width:${Math.min(m.sla/0.9*100,100)}%"></span></div>`:''}</article>`).join('');
  }

  function aggregate(rows,key,measure='count',includeNoIncident=true){
    const map=new Map(); rows.forEach(r=>{if(!includeNoIncident&&r[key]==='Sin incidente')return;const k=r[key];if(!map.has(k))map.set(k,{n:0,ok:0,sum:0});const x=map.get(k);x.n++;x.ok+=r.sla_entrega==='Cumple'?1:0;x.sum+=measure==='claims'?r.reclamacion_mxn:0});
    return [...map].map(([label,x])=>({label,value:measure==='sla'?(x.ok/x.n*100):measure==='claims'?x.sum:x.n,n:x.n}));
  }
  function barChart(target,items,{max=0,suffix='',currency=false,targetLine=null,color='primary'}={}){
    items=items.slice().sort((a,b)=>b.value-a.value); const W=620,H=Math.max(230,items.length*45+45),L=155,R=55,T=18,B=25; const usable=W-L-R; max=max||Math.max(...items.map(d=>d.value),1); let svg=`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
    [0,.25,.5,.75,1].forEach(p=>{const x=L+usable*p;svg+=`<line class="grid-line" x1="${x}" y1="${T}" x2="${x}" y2="${H-B}"/><text class="axis-label" x="${x}" y="${H-5}" text-anchor="middle">${currency?fmtInt.format(max*p):Math.round(max*p)+suffix}</text>`});
    if(targetLine!==null){const x=L+usable*targetLine/max;svg+=`<line class="target-line" x1="${x}" y1="${T-3}" x2="${x}" y2="${H-B}"/><text class="axis-label" x="${Math.min(x+5,W-45)}" y="12">Meta ${targetLine}${suffix}</text>`}
    items.forEach((d,i)=>{const y=T+i*45+7,w=Math.max(d.value/max*usable,1);const val=currency?fmtMoney.format(d.value):`${d.value.toFixed(d.value%1?1:0)}${suffix}`;const estimated=val.length*7.2;const placeInside=L+w+estimated+8>W;const valueX=placeInside?L+w-8:L+w+6;const anchor=placeInside?'end':'start';const valueClass=placeInside&&w>estimated+18?'value-label value-label--inside':'value-label';svg+=`<text class="axis-label" x="${L-8}" y="${y+16}" text-anchor="end">${safe(d.label)}</text><rect class="bar-${color==='secondary'?'secondary':'primary'}" x="${L}" y="${y}" width="${w}" height="22" rx="5"/><text class="${valueClass}" x="${valueX}" y="${y+16}" text-anchor="${anchor}">${safe(val)}</text>`});
    el(target).innerHTML=svg+'</svg>'; el(target).setAttribute('aria-label',`${items.map(d=>`${d.label}: ${d.value.toFixed(1)}${suffix}`).join('; ')}`);
  }
  function weekly(rows){
    const groups=new Map();rows.forEach(r=>{const d=new Date(r.fecha_salida+'T00:00:00Z'),start=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-((d.getUTCDay()+6)%7)));const k=start.toISOString().slice(0,10);if(!groups.has(k))groups.set(k,{n:0,ok:0});const x=groups.get(k);x.n++;x.ok+=r.sla_entrega==='Cumple'?1:0});return [...groups].sort().map(([label,x])=>({label,value:x.ok/x.n*100,n:x.n}));
  }
  function lineChart(rows){
    const items=weekly(rows),W=760,H=290,L=45,R=22,T=25,B=48,uw=W-L-R,uh=H-T-B,min=0,max=100;let svg=`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
    [0,25,50,75,100].forEach(v=>{const y=T+uh-(v-min)/(max-min)*uh;svg+=`<line class="grid-line" x1="${L}" y1="${y}" x2="${W-R}" y2="${y}"/><text class="axis-label" x="${L-8}" y="${y+4}" text-anchor="end">${v}%</text>`});const ty=T+uh-.9*uh;svg+=`<line class="target-line" x1="${L}" y1="${ty}" x2="${W-R}" y2="${ty}"/><text class="axis-label" x="${W-R}" y="${ty-5}" text-anchor="end">Meta 90%</text>`;
    const pts=items.map((d,i)=>({x:L+(items.length===1?uw/2:i*uw/(items.length-1)),y:T+uh-d.value/100*uh,...d})); if(pts.length>1)svg+=`<path class="line-primary" d="M${pts.map(p=>`${p.x},${p.y}`).join(' L')}"/>`;
    pts.forEach((p,i)=>{svg+=`<circle class="point" cx="${p.x}" cy="${p.y}" r="5"/><text class="value-label" x="${p.x}" y="${p.y-10}" text-anchor="middle">${p.value.toFixed(0)}%</text>`;if(i%2===0||items.length<8)svg+=`<text class="axis-label" x="${p.x}" y="${H-16}" text-anchor="middle">${p.label.slice(5)}</text>`});el('trendChart').innerHTML=svg+'</svg>';el('trendChart').setAttribute('aria-label',items.map(d=>`Semana ${d.label}: ${d.value.toFixed(1)}%`).join('; '));
  }
  function renderCharts(rows){lineChart(rows);barChart('slaChart',aggregate(rows,'transportista','sla'),{max:100,suffix:'%',targetLine:90});barChart('incidentChart',aggregate(rows,'tipo_incidente','count',false),{color:'secondary'});barChart('claimsChart',aggregate(rows,'producto','claims'),{currency:true});}
  function renderFacts(rows){const m=metrics(rows),seg=aggregate(rows,'transportista','sla').sort((a,b)=>a.value-b.value)[0];el('factsList').innerHTML=`<li>El SLA de la selección es <strong>${(m.sla*100).toFixed(1)}%</strong>, frente a una meta de 90%.</li><li>Se observan <strong>${m.incidents} incidentes</strong>, ${m.excursions} excursiones y ${fmtMoney.format(m.claims)} en reclamaciones.</li><li>${seg?`El menor SLA por transportista en esta selección es <strong>${safe(seg.label)} (${seg.value.toFixed(1)}%, n=${seg.n})</strong>.`:'No hay segmento comparable.'}</li>`}
  function renderTable(rows){el('tableCount').textContent=`${fmtInt.format(rows.length)} registros`;el('detailBody').innerHTML=rows.slice(0,50).map(r=>`<tr><td>${safe(r.id_embarque)}</td><td>${fmtDate.format(new Date(r.fecha_salida+'T00:00:00Z'))}</td><td>${safe(r.origen)} → ${safe(r.destino)}</td><td>${safe(r.producto)}</td><td>${safe(r.transportista)}</td><td><span class="status ${r.sla_entrega==='Cumple'?'ok':'bad'}">${safe(r.sla_entrega)}</span></td><td>${r.retraso_min} min</td><td>${safe(r.tipo_incidente)}</td><td>${r.temperatura_max_c.toFixed(1)} °C</td><td>${fmtMoney.format(r.reclamacion_mxn)}</td></tr>`).join('')}
  function render(){const rows=filteredData(),active=META.filter(([k])=>state[k]).map(([k,l])=>`${l}: ${k==='mes'?(monthName[state[k]]||state[k]):state[k]}`);el('filterSummary').textContent=active.length?`${rows.length} embarques · ${active.join(' · ')}`:'Vista completa · 240 embarques';renderKpis(rows);const empty=!rows.length;el('emptyState').hidden=!empty;document.body.classList.toggle('no-results',empty);if(!empty){renderCharts(rows);renderFacts(rows);renderTable(rows)}}
  buildFilters(); el('resetFilters').addEventListener('click',reset); document.querySelector('[data-reset]').addEventListener('click',reset); render();
  window.dashboardAPI={metrics,filteredData,setFilter:(k,v)=>{if(!(k in state))throw new Error('Filtro desconocido');state[k]=String(v);el(`filter-${k}`).value=String(v);render()},reset,getState:()=>({...state})};
})();

