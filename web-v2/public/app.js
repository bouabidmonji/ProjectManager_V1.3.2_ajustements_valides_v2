'use strict';
const $=s=>document.querySelector(s);
let currentUser=null,activeProjectId=null,allProjects=[],dashboardSubset=[],trendSelected=null;
const palette=['#2676a5','#e59b45','#8b78bd','#d46c72','#8b9baa','#c06a9b','#7e9b42','#4b9aaf','#b17c4d','#6b78a8'];
const money=v=>new Intl.NumberFormat('fr-TN',{style:'decimal',maximumFractionDigits:0}).format(Number(v||0))+' DT';
const pct=v=>Number(v||0).toLocaleString('fr-TN',{maximumFractionDigits:1})+' %';
const statusLabel=s=>({not_started:'Non démarré',in_progress:'En cours',blocked:'Bloqué / suspendu',completed:'Achevé',cancelled:'Annulé'}[s]||s||'—');
const sum=(a,k)=>a.reduce((n,p)=>n+Number(p[k]||0),0);
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function dateFR(v){if(!v)return '—';const d=new Date(String(v).slice(0,10)+'T00:00:00');return isNaN(d)?'—':d.toLocaleDateString('fr-FR');}
async function api(url,options={}){const r=await fetch('/api'+url,{...options,credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Erreur API');return d;}
function showLogin(){$('#loginView').classList.remove('hidden');$('#appView').classList.add('hidden');}
function showApp(){$('#loginView').classList.add('hidden');$('#appView').classList.remove('hidden');$('#userLabel').textContent=currentUser.name+' · '+currentUser.role;$('#welcome').textContent='Connecté : '+currentUser.name;$('#usersNav').classList.toggle('hidden',currentUser.role!=='admin');}
function contractEnd(p){if(!p.start_date||!p.duration_months)return null;const d=new Date(String(p.start_date).slice(0,10)+'T00:00:00');if(isNaN(d))return null;d.setMonth(d.getMonth()+Number(p.duration_months));return d;}
function lateProjects(items){const now=new Date();now.setHours(0,0,0,0);return items.filter(p=>!['completed','cancelled'].includes(p.operational_status)).filter(p=>{const d=contractEnd(p);return d&&d<now;});}
function renderDashboard(){
 const year=$('#dashboardYear').value;
 dashboardSubset=allProjects.filter(p=>!year||String(p.initial_programming_year||'')===year);
 const rows=dashboardSubset, total=rows.length,done=rows.filter(p=>p.operational_status==='completed').length,blocked=rows.filter(p=>p.operational_status==='blocked').length,late=lateProjects(rows);
 const budget=sum(rows,'updated_cost'),spent=sum(rows,'consumed_credits'),rate=budget?Math.max(0,spent/budget*100):0;
 $('#kTotal').textContent=total;$('#kTotalSub').textContent=year?'Programmés en '+year:'Toutes années confondues';
 $('#kDone').textContent=done;$('#kDoneSub').textContent='Taux de réalisation '+pct(total?done/total*100:0);$('#kDoneProgress').style.width=Math.min(100,total?done/total*100:0)+'%';
 $('#kConsumption').textContent=pct(rate);$('#kConsumptionSub').textContent=money(spent)+' / '+money(budget);$('#kConsumptionProgress').style.width=Math.min(100,rate)+'%';
 $('#kBlocked').textContent=blocked;$('#kLate').textContent=late.length;$('#kBudget').textContent=money(budget);
 renderYearChart(rows);renderStatusChart(rows);renderFundingChart(rows);renderCategoryChart(rows);renderTrend();renderRecent(rows);renderAlerts(rows);
}
function renderYearChart(rows){
 const years=[...new Set(rows.map(p=>Number(p.initial_programming_year)).filter(Boolean))].sort((a,b)=>a-b);
 if(!years.length){$('#yearChart').innerHTML='<p class="muted">Aucune année de programmation renseignée.</p>';return;}
 const vals=years.map(y=>{const a=rows.filter(p=>Number(p.initial_programming_year)===y);return {year:y,count:a.length,budget:sum(a,'updated_cost')};});
 const max=Math.max(1,...vals.map(x=>x.count)),w=Math.max(440,years.length*78+80),h=205,left=38,right=18,top=18,bottom=38,pw=w-left-right,ph=h-top-bottom;
 const pts=vals.map((x,i)=>({...x,x:left+(vals.length===1?pw/2:i*pw/(vals.length-1)),y:top+ph-(x.count/max)*ph}));
 const poly=pts.map(p=>p.x+','+p.y).join(' ');
 const grid=[0,.5,1].map(t=>{let y=top+ph-t*ph;return '<line x1="'+left+'" y1="'+y+'" x2="'+(w-right)+'" y2="'+y+'" class="chart-grid"/><text x="'+(left-9)+'" y="'+(y+4)+'" text-anchor="end" class="axis-label">'+Math.round(max*t)+'</text>';}).join('');
 $('#yearChart').innerHTML='<div class="svg-scroll"><svg viewBox="0 0 '+w+' '+h+'" class="year-svg">'+grid+'<polyline points="'+poly+'" class="animated-line"/>'+pts.map(p=>'<g class="year-mark" data-year="'+p.year+'" tabindex="0"><circle cx="'+p.x+'" cy="'+p.y+'" r="6"/><text x="'+p.x+'" y="'+(p.y-12)+'" text-anchor="middle" class="point-label">'+p.count+'</text><text x="'+p.x+'" y="'+(h-12)+'" text-anchor="middle" class="axis-label">'+p.year+'</text><title>'+p.count+' projets · '+money(p.budget)+'</title></g>').join('')+'</svg></div><p class="chart-hint">Cliquez sur une année pour appliquer le filtre global. Le total de projets par année reste calculé sur les données du périmètre.</p>';
 document.querySelectorAll('[data-year]').forEach(el=>el.addEventListener('click',()=>{$('#dashboardYear').value=el.dataset.year;renderDashboard();}));
}
function donutMarkup(items,total,label){
 const valid=items.filter(x=>x.value>0);if(!valid.length)return '<p class="muted">Aucune donnée disponible.</p>';
 let offset=0;const circumference=2*Math.PI*43;
 const arcs=valid.map((x,i)=>{const length=x.value/total*circumference;const a='<circle class="donut-arc" data-key="'+esc(x.key)+'" data-value="'+esc(x.valueKey)+'" data-label="'+esc(x.label)+'" cx="60" cy="60" r="43" fill="none" stroke="'+palette[i%palette.length]+'" stroke-width="17" stroke-dasharray="'+length+' '+(circumference-length)+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 60 60)" tabindex="0"><title>'+esc(x.label)+' · '+x.count+' projet(s) · '+money(x.amount)+'</title></circle>';offset+=length;return a;}).join('');
 const legend=valid.map((x,i)=>'<button class="legend-row" data-key="'+esc(x.key)+'" data-value="'+esc(x.valueKey)+'" data-label="'+esc(x.label)+'"><i style="background:'+palette[i%palette.length]+'"></i><span>'+esc(x.label)+'</span><b>'+pct(x.value/total*100)+'</b></button>').join('');
 return '<div class="donut-layout"><svg viewBox="0 0 120 120" class="donut-svg" role="img" aria-label="'+esc(label)+'"><circle cx="60" cy="60" r="43" fill="none" stroke="#edf1f5" stroke-width="17"/>'+arcs+'<text x="60" y="57" text-anchor="middle" class="donut-number">'+valid.reduce((a,x)=>a+x.count,0)+'</text><text x="60" y="70" text-anchor="middle" class="donut-caption">'+(valid[0].key==='status'?'PROJETS':'SOURCES')+'</text></svg><div class="legend-list">'+legend+'</div></div>';
}
function renderStatusChart(rows){
 const defs=[['Non démarrés','not_started'],['En cours','in_progress'],['Bloqués','blocked'],['Achevés','completed'],['Annulés','cancelled']];
 const items=defs.map(([label,key])=>{const a=rows.filter(p=>(p.operational_status||'not_started')===key);return {label,key:'status',valueKey:key,value:a.length,count:a.length,amount:sum(a,'updated_cost')};});
 $('#statusChart').innerHTML=donutMarkup(items,rows.length,'État opérationnel');
 bindDonut('status');
}
function renderFundingChart(rows){
 const defs=[['Autofinancement','self_funding'],['Emprunt','loan'],['Aides exceptionnelles','exceptional_aid'],['Aides non affectées','unassigned_aid'],['Aides affectées','assigned_aid'],['Autres sources','other_funding']];
 const items=defs.map(([label,key])=>{const a=rows.filter(p=>Number(p[key])>0);return {label,key:'funding',valueKey:key,value:sum(rows,key),count:a.length,amount:sum(rows,key)};}).filter(x=>x.value>0);
 $('#fundingChart').innerHTML=donutMarkup(items,items.reduce((a,x)=>a+x.value,0),'Sources de financement');bindDonut('funding');
}
function bindDonut(panelKey){
 document.querySelectorAll('#'+panelKey+'Chart [data-key]').forEach(el=>el.addEventListener('click',()=>showChartDetail(panelKey,el.dataset.key,el.dataset.value,el.dataset.label)));
}
function renderCategoryChart(rows){
 const cats=[...new Set(rows.map(p=>p.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
 if(!cats.length){$('#categoryChart').innerHTML='<p class="muted">Aucune catégorie renseignée.</p>';return;}
 const max=Math.max(1,...cats.map(c=>sum(rows.filter(p=>p.category===c),'updated_cost')));
 $('#categoryChart').innerHTML=cats.map(c=>{const a=rows.filter(p=>p.category===c),alloc=sum(a,'updated_cost'),paid=sum(a,'consumed_credits');return '<button class="category-row" data-category="'+esc(c)+'"><span class="category-name">'+esc(c)+' <small>'+a.length+' projet(s)</small></span><span class="bar-pair"><span><i class="bar-allocated" style="width:'+alloc/max*100+'%"></i></span><span><i class="bar-consumed" style="width:'+Math.min(100,paid/max*100)+'%"></i></span></span><span class="category-values"><b>'+money(alloc)+'</b><small>'+money(paid)+' consommés</small></span></button>';}).join('');
 document.querySelectorAll('[data-category]').forEach(el=>el.addEventListener('click',()=>showChartDetail('category','category',el.dataset.category,el.dataset.category)));
}
function renderTrend(){
 const years=[...new Set(allProjects.map(p=>Number(p.initial_programming_year)).filter(Boolean))].sort((a,b)=>a-b);
 const cats=[...new Set(allProjects.map(p=>p.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
 if(trendSelected===null)trendSelected=[...cats];
 if(!trendSelected.length&&cats.length)trendSelected=[...cats];
 $('#trendCategoryFilter').innerHTML=cats.map((c,i)=>'<label class="trend-option '+(/infrastructure/i.test(c)?'infra':'')+'"><input type="checkbox" value="'+esc(c)+'" '+(trendSelected.includes(c)?'checked':'')+'><i style="background:'+( /infrastructure/i.test(c)?'#16877c':palette[i%palette.length])+'"></i>'+esc(c)+'</label>').join('');
 document.querySelectorAll('#trendCategoryFilter input').forEach(el=>el.addEventListener('change',()=>{trendSelected=[...document.querySelectorAll('#trendCategoryFilter input:checked')].map(x=>x.value);drawTrend(years,cats);}));
 drawTrend(years,cats);
}
function drawTrend(years,cats){
 const selected=cats.filter(c=>trendSelected.includes(c));
 if(!years.length||!selected.length){$('#allocationTrendChart').innerHTML='<p class="muted">Sélectionnez au moins une catégorie disposant de données.</p>';return;}
 const w=Math.max(560,years.length*105+110),h=280,l=82,r=22,t=24,b=48,pw=w-l-r,ph=h-t-b;
 const series=selected.map(c=>({category:c,values:years.map(y=>{const a=allProjects.filter(p=>p.category===c&&Number(p.initial_programming_year)===y);return {year:y,items:a,amount:sum(a,'updated_cost')};})}));
 const max=Math.max(1,...series.flatMap(s=>s.values.map(v=>v.amount)));
 const yPos=v=>t+ph-v/max*ph;
 const grid=[0,.25,.5,.75,1].map(x=>{const y=t+ph-x*ph;return '<line x1="'+l+'" y1="'+y+'" x2="'+(w-r)+'" y2="'+y+'" class="chart-grid"/><text x="'+(l-10)+'" y="'+(y+4)+'" text-anchor="end" class="axis-label">'+money(max*x).replace(' DT','')+'</text>';}).join('');
 const lines=series.map((s,i)=>{const color=/infrastructure/i.test(s.category)?'#16877c':palette[cats.indexOf(s.category)%palette.length];const points=s.values.map((v,j)=>({ ...v,x:l+(years.length===1?pw/2:j*pw/(years.length-1)),y:yPos(v.amount)}));const poly=points.map(p=>p.x+','+p.y).join(' ');return '<polyline points="'+poly+'" fill="none" stroke="'+color+'" stroke-width="'+(/infrastructure/i.test(s.category)?4:2.7)+'" stroke-linecap="round" stroke-linejoin="round" class="animated-line"/>'+points.map(p=>'<circle class="trend-point" cx="'+p.x+'" cy="'+p.y+'" r="5" fill="'+color+'" data-trend-year="'+p.year+'" data-trend-category="'+esc(s.category)+'" tabindex="0"><title>'+esc(s.category)+' · '+p.year+' · '+p.items.length+' projet(s) · '+money(p.amount)+'</title></circle>').join('');}).join('');
 const labels=years.map((y,i)=>'<text x="'+(l+(years.length===1?pw/2:i*pw/(years.length-1)))+'" y="'+(h-15)+'" text-anchor="middle" class="axis-label">'+y+'</text>').join('');
 const legend=series.map((s,i)=>'<span><i style="background:'+( /infrastructure/i.test(s.category)?'#16877c':palette[cats.indexOf(s.category)%palette.length])+'"></i>'+esc(s.category)+'</span>').join('');
 $('#allocationTrendChart').innerHTML='<div class="trend-legend">'+legend+'</div><div class="svg-scroll"><svg viewBox="0 0 '+w+' '+h+'" class="trend-svg">'+grid+lines+labels+'</svg></div>';
 document.querySelectorAll('[data-trend-year]').forEach(el=>el.addEventListener('click',()=>showChartDetail('trend','trendCategory',el.dataset.trendYear,el.dataset.trendCategory)));
}
function showChartDetail(panel,key,value,label){
 let items=key==='trendCategory'?allProjects.filter(p=>p.category===label&&Number(p.initial_programming_year)===Number(value)):dashboardSubset;
 if(key==='status')items=items.filter(p=>(p.operational_status||'not_started')===value);
 if(key==='funding')items=items.filter(p=>Number(p[value])>0);
 if(key==='category')items=items.filter(p=>p.category===value);
 const host=$('#'+(panel==='trend'?'trendDetail':panel==='category'?'categoryDetail':panel+'Detail'));
 if(!host)return;
 const title=key==='trendCategory'?label+' — '+value:label;
 host.innerHTML='<div class="detail-title"><div><b>'+esc(title)+'</b><small>'+items.length+' projet(s) · '+money(sum(items,'updated_cost'))+'</small></div><button class="detail-close" type="button">Fermer</button></div><div class="detail-items">'+(items.length?items.map(p=>'<button data-open-project="'+p.id+'"><b>'+esc(p.project_code)+'</b> · '+esc(p.title)+'<small>'+statusLabel(p.operational_status)+' · '+money(p.updated_cost)+'</small></button>').join(''):'<p class="muted">Aucun projet correspondant.</p>')+'</div>';
 host.classList.remove('hidden');host.querySelector('.detail-close').onclick=()=>host.classList.add('hidden');
 host.querySelectorAll('[data-open-project]').forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.openProject)));
}
function renderRecent(rows){
 const recent=[...rows].filter(p=>p.last_followup_date).sort((a,b)=>String(b.last_followup_date).localeCompare(String(a.last_followup_date))).slice(0,7);
 $('#recentRows').innerHTML=recent.length?recent.map(p=>'<tr><td><b>'+esc(p.project_code)+'</b></td><td>'+esc(p.title)+'</td><td>'+(p.initial_programming_year||'—')+'</td><td>'+Number(p.physical_progress||0).toFixed(1)+' %</td><td>'+dateFR(p.last_followup_date)+'</td></tr>').join(''):'<tr><td colspan="5" class="muted">Aucun suivi historisé disponible.</td></tr>';
}
function renderAlerts(rows){
 const alerts=[];rows.forEach(p=>{
 if(p.operational_status==='blocked')alerts.push({kind:'danger',title:p.title,label:'Projet bloqué',detail:p.blockage_reason||'Motif de blocage non renseigné'});
 const end=contractEnd(p);if(end&&!['completed','cancelled'].includes(p.operational_status)&&end<new Date(new Date().setHours(0,0,0,0)))alerts.push({kind:'danger',title:p.title,label:'Échéance contractuelle dépassée',detail:'Fin prévue : '+end.toLocaleDateString('fr-FR')});
 if(p.operational_status==='in_progress'&&!p.last_followup_date)alerts.push({kind:'warning',title:p.title,label:'Suivi à actualiser',detail:'Aucune date de suivi disponible.'});
 });
 $('#alertsList').innerHTML=alerts.length?alerts.slice(0,14).map(a=>'<div class="alert-item '+a.kind+'"><b>'+esc(a.title)+'</b><span>'+esc(a.label)+' — '+esc(a.detail)+'</span></div>').join(''):'<p class="muted">Aucun point de vigilance calculable à partir des dates et statuts renseignés.</p>';
}
async function loadDashboard(){const d=await api('/dashboard');allProjects=d.items||[];const years=[...new Set(allProjects.map(p=>p.initial_programming_year).filter(Boolean))].sort((a,b)=>a-b);const select=$('#dashboardYear'),old=select.value;select.innerHTML='<option value="">Toutes les années</option>'+years.map(y=>'<option value="'+y+'">'+y+'</option>').join('');select.value=years.includes(Number(old))?old:'';renderDashboard();}
async function loadProjects(){const q=new URLSearchParams();if($('#projectSearch').value)q.set('search',$('#projectSearch').value);if($('#yearSearch').value)q.set('year',$('#yearSearch').value);const d=await api('/projects?'+q);$('#projectRows').innerHTML=d.items.map(x=>'<tr><td><b>'+esc(x.project_code)+'</b></td><td>'+esc(x.title)+'</td><td>'+(x.initial_programming_year||'—')+'</td><td>'+esc(x.category||'—')+'</td><td>'+money(x.updated_cost)+'</td><td>'+Number(x.physical_progress||0).toFixed(1)+' %</td><td><span class="status '+esc(x.operational_status)+'">'+statusLabel(x.operational_status)+'</span></td><td><button class="secondary" data-project="'+x.id+'">Ouvrir</button></td></tr>').join('');document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.project)));}
async function openProject(id){try{activeProjectId=id;const p=await api('/projects/'+encodeURIComponent(id));$('#detailTitle').textContent=p.title;$('#detailCode').textContent=p.project_code+' · '+(p.initial_programming_year||'Année non renseignée');const roles={principal:'Responsable principal',technical:'Technique',finance:'Finances',procurement:'Marchés',gis:'SIG'};const resp=(p.responsibilities||[]).map(x=>'<tr><td>'+roles[x.responsibility_role]+'</td><td>'+esc(x.display_name)+'</td><td>'+dateFR(x.assigned_at)+'</td></tr>').join('');const hist=(p.history||[]).map(x=>'<tr><td>'+new Date(x.created_at).toLocaleString('fr-FR')+'</td><td>'+esc(x.display_name||'Système')+'</td><td>'+esc(x.summary)+'</td></tr>').join('');const assignees=await api('/assignees');const roleOptions=Object.entries(roles);const controls=roleOptions.map(([key,label])=>'<div class="assignment-row"><label>'+label+'<select data-role="'+key+'"><option value="">Choisir un agent</option>'+assignees.items.map(a=>'<option value="'+a.id+'">'+esc(a.display_name)+'</option>').join('')+'</select></label><button class="secondary" data-assign="'+key+'">Affecter</button></div>').join('');$('#detailContent').innerHTML='<div class="detail-grid"><div><small>Coût actualisé</small><b>'+money(p.updated_cost)+'</b></div><div><small>Crédits consommés</small><b>'+money(p.legacy_consumed_credits)+'</b></div><div><small>Avancement physique</small><b>'+Number(p.physical_progress||0).toFixed(1)+' %</b></div><div><small>État opérationnel</small><b>'+statusLabel(p.operational_status)+'</b></div></div><h3>Responsabilités</h3><div class="table-wrap"><table><thead><tr><th>Rôle</th><th>Agent</th><th>Depuis le</th></tr></thead><tbody>'+resp+'</tbody></table></div><h3>Modifier les responsabilités</h3><div class="assignment-grid">'+controls+'</div><h3>Historique</h3><div class="table-wrap"><table><thead><tr><th>Date</th><th>Utilisateur</th><th>Événement</th></tr></thead><tbody>'+hist+'</tbody></table></div><p class="muted">Les modules techniques, financiers, marchés, planning et SIG seront intégrés progressivement.</p>';$('#detailDialog').showModal();document.querySelectorAll('[data-assign]').forEach(btn=>btn.addEventListener('click',async()=>{const role=btn.dataset.assign,user_id=Number(document.querySelector('[data-role="'+role+'"]').value);if(!user_id){alert('Sélectionnez un agent.');return;}try{await api('/projects/'+activeProjectId+'/responsibilities',{method:'PUT',body:JSON.stringify({role,user_id})});await openProject(activeProjectId);}catch(e){alert(e.message);}}));}catch(e){alert(e.message);}}
async function loadAssignees(){const d=await api('/assignees');$('#principalSelect').innerHTML='<option value="">Sélectionner un responsable</option>'+d.items.map(x=>'<option value="'+x.id+'">'+esc(x.display_name)+' — '+esc(x.role)+'</option>').join('');}
async function loadUsers(){const d=await api('/users');$('#usersList').innerHTML='<div class="table-wrap"><table><thead><tr><th>Nom</th><th>Identifiant</th><th>Rôle</th><th>Actif</th></tr></thead><tbody>'+d.items.map(x=>'<tr><td>'+esc(x.display_name)+'</td><td>'+esc(x.username)+'</td><td>'+esc(x.role)+'</td><td>'+(x.is_active?'Oui':'Non')+'</td></tr>').join('')+'</tbody></table></div>';}
function nav(page){document.querySelectorAll('.page').forEach(x=>x.classList.add('hidden'));$('#'+page+'Page').classList.remove('hidden');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===page));$('#pageTitle').textContent=({dashboard:'Tableau de bord',projects:'Projets',users:'Utilisateurs'}[page]||page);if(page==='projects')loadProjects().catch(e=>alert(e.message));if(page==='users')loadUsers().catch(e=>alert(e.message));}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();$('#loginError').textContent='';const f=new FormData(e.currentTarget);try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({username:f.get('username'),password:f.get('password')})});currentUser=d.user;showApp();nav('dashboard');await loadDashboard();}catch(x){$('#loginError').textContent=x.message;}});
$('#logoutBtn').addEventListener('click',async()=>{await api('/auth/logout',{method:'POST'}).catch(()=>{});currentUser=null;showLogin();});
document.querySelectorAll('.nav').forEach(x=>x.addEventListener('click',()=>nav(x.dataset.page)));document.querySelectorAll('[data-goto]').forEach(x=>x.addEventListener('click',()=>nav(x.dataset.goto)));
$('#searchBtn').addEventListener('click',()=>loadProjects().catch(e=>alert(e.message)));$('#newProjectBtn').addEventListener('click',()=>{loadAssignees().then(()=>$('#projectDialog').showModal()).catch(e=>alert(e.message));});$('#cancelProject').addEventListener('click',()=>$('#projectDialog').close());$('#closeDetail').addEventListener('click',()=>$('#detailDialog').close());$('#dashboardYear').addEventListener('change',renderDashboard);
$('#projectForm').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{const d=await api('/projects',{method:'POST',body:JSON.stringify({title:f.get('title'),year:Number(f.get('year'))||null,category:f.get('category'),updated_cost:Number(f.get('updated_cost'))||0,status:f.get('status'),principal_user_id:Number(f.get('principal_user_id'))})});$('#projectDialog').close();e.currentTarget.reset();await loadProjects();alert('Projet créé : '+d.project_code);}catch(x){$('#projectError').textContent=x.message;}});
(async()=>{try{const d=await api('/auth/me');currentUser=d.user;showApp();nav('dashboard');await loadDashboard();}catch{showLogin();}})();