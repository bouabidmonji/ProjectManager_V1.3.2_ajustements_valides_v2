const $=s=>document.querySelector(s);
let projects=[];
let lang='fr';
let chartSelection=null;
let dashboardSubset=[];
let allocationTrendSelectedCategories=null;
const tr={fr:{dashboard:'Tableau de bord',projects:'Projets',settings:'Paramètres & sauvegarde',local:'Données stockées localement',subtitle:'Suivi des investissements communaux',totalProjects:'Projets enregistrés',allYears:'Toutes années confondues',budget:'Budget actualisé',budgetSub:'Somme des coûts actualisés',spent:'Crédits consommés',spentSub:'Dépenses enregistrées',yearAnalysis:'Répartition par année',status:'État des projets',recent:'Projets récemment suivis',seeAll:'Voir tous les projets →',project:'Projet',year:'Année',category:'Catégorie',cost:'Coût actualisé',physical:'Avancement',stage:'Étape',dataManagement:'Gestion des données',dataInfo:'La base de données est conservée sur cet ordinateur. Créez régulièrement une sauvegarde sur un autre support.',backup:'Sauvegarde manuelle',backupDesc:'Créer une copie complète de la base SQLite.',createBackup:'Créer une sauvegarde',restore:'Restaurer une sauvegarde',restoreDesc:'Remplacer la base actuelle par une sauvegarde existante.',restoreBtn:'Restaurer',excel:'Échange Excel',excelDesc:'Importer des lignes ou exporter tous les projets.',backupWarning:'Conservez les sauvegardes sur un disque externe ou un espace sécurisé. Une sauvegarde automatique quotidienne est créée au démarrage.',formHint:'Les modifications sont enregistrées dans la base locale.',projectName:'Intitulé du projet *',subcategory:'Sous-catégorie',initialCost:'Coût initial (DT)',updatedCost:'Coût actualisé (DT)',ownFunding:'Autofinancement',loan:'Emprunt',exceptionalAid:'Aide exceptionnelle',unassignedAid:'Aide non affectée',assignedAid:'Aide affectée',otherSources:'Autres sources',resources:'Ressources réalisées',consumed:'Crédits consommés',startDate:'Date début travaux',duration:'Durée contractuelle (mois)',physicalRate:'Taux de réalisation (%)',observations:'Observations',cancel:'Annuler',save:'Enregistrer'},ar:{dashboard:'لوحة القيادة',projects:'المشاريع',settings:'الإعدادات والنسخ الاحتياطي',local:'البيانات محفوظة محلياً',subtitle:'متابعة الاستثمارات البلدية',totalProjects:'عدد المشاريع',allYears:'كل السنوات',budget:'الكلفة المحينة',budgetSub:'مجموع الكلفة المحينة',spent:'الاعتمادات المستهلكة',spentSub:'المصاريف المسجلة',yearAnalysis:'التوزيع حسب السنة',status:'حالة المشاريع',recent:'آخر المشاريع متابعة',seeAll:'عرض كل المشاريع ←',project:'المشروع',year:'السنة',category:'الصنف',cost:'الكلفة المحينة',physical:'التقدم',stage:'المرحلة',dataManagement:'إدارة البيانات',dataInfo:'يتم حفظ قاعدة البيانات على هذا الحاسوب. يرجى إنشاء نسخ احتياطية بانتظام.',backup:'نسخ احتياطي يدوي',backupDesc:'إنشاء نسخة كاملة من قاعدة البيانات.',createBackup:'إنشاء نسخة',restore:'استعادة نسخة',restoreDesc:'تعويض قاعدة البيانات الحالية بنسخة محفوظة.',restoreBtn:'استعادة',excel:'ملفات Excel',excelDesc:'استيراد بيانات أو تصدير جميع المشاريع.',backupWarning:'يتم إنشاء نسخة احتياطية يومية عند تشغيل التطبيق. احتفظ بنسخ إضافية على وسيط خارجي.',formHint:'يتم حفظ التغييرات في قاعدة البيانات المحلية.',projectName:'عنوان المشروع *',subcategory:'الصنف الفرعي',initialCost:'الكلفة الأولية (د.ت)',updatedCost:'الكلفة المحينة (د.ت)',ownFunding:'تمويل ذاتي',loan:'قرض',exceptionalAid:'مساعدة استثنائية',unassignedAid:'مساعدة غير موظفة',assignedAid:'مساعدة موظفة',otherSources:'مصادر أخرى',resources:'الموارد المحققة',consumed:'الاعتمادات المستهلكة',startDate:'بداية الأشغال',duration:'مدة الأشغال (بالأشهر)',physicalRate:'نسبة التقدم المادي (%)',observations:'ملاحظات',cancel:'إلغاء',save:'حفظ'}};
const money=n=>new Intl.NumberFormat(lang==='ar'?'ar-TN':'fr-TN',{maximumFractionDigits:0}).format(Number(n)||0)+' DT';const pct=n=>(Number(n)||0).toFixed(1)+' %';
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function statusLabel(s){return ({non_demarre:'Non démarré',en_cours:'En cours',suspendu:'Bloqué / suspendu',acheve:'Achevé',annule:'Annulé'}[s]||'Non démarré');}
function applyLang(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.dataset.i18n;if(tr[lang][k])e.textContent=tr[lang][k]});$('#pageTitle').textContent=tr[lang][$('.nav.active').dataset.view]||tr[lang].dashboard;$('#addBtn').textContent=lang==='ar'?'＋ مشروع جديد':'＋ Nouveau projet';render();}
function nav(view){document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===view));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!==view));$('#pageTitle').textContent=tr[lang][view]||tr[lang].dashboard;}
function calc(p){
 const total=[
  'autofinancement',
  'emprunt',
  'aide_exceptionnelle',
  'aide_non_affectee',
  'aide_affectee',
  'autres_sources'
 ].reduce((a,k)=>a+(+p[k]||0),0);

 const cout=+p.cout_actualise||0;
 const ressources=+p.ressources_realisees||0;
 const consomme=+p.credits_consommes||0;

 return {
  ...p,
  total_financement_fonds:total,

  // Indicateurs historiques : ressources réalisées
  reliquat:ressources-consomme,
  taux_financier:ressources>0?consomme/ressources*100:0,

  // Nouveaux indicateurs : coût actualisé
  reliquat_credit_actualise:cout-consomme,
  taux_consommation:cout>0?consomme/cout*100:0
 };
}async function load(){projects=(await window.api.list()).map(calc);render();$('#saveState').textContent=lang==='ar'?'● محفوظ':'● Enregistré';}

const chartColors=['#2676a5','#e59b45','#42a58a','#8b78bd','#d46c72','#8b9baa'];

function donutMarkup(items,total,label){
 const valid=items.filter(x=>x.value>0);
 if(!valid.length)return '<p class="muted">Aucune donnée disponible.</p>';
 let offset=0;
 const circles=valid.map((x,i)=>{
  const value=x.value/total*100;
  const hoverInfo=`${Number(x.count??x.value)} projet(s) · ${money(x.amount??x.value)}`;
  const dash=value*2.702;
  const gap=270.2-dash;
  const circle=`<circle class="donut-segment" data-chart-key="${esc(x.key)}" data-chart-value="${esc(x.valueKey||x.label)}" data-chart-label="${esc(x.label)}" cx="60" cy="60" r="43" fill="none" stroke="${chartColors[i%chartColors.length]}" stroke-width="19" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset*2.702}" transform="rotate(-90 60 60)" tabindex="0" role="button" data-tooltip="${esc(hoverInfo)}" aria-label="${esc(x.label)} : ${esc(hoverInfo)}"><animate attributeName="stroke-dasharray" from="0 270.2" to="${dash} ${gap}" dur="1.8s" begin="${(i*0.14).toFixed(2)}s" fill="freeze"/></circle>`;
  offset+=value;
  return circle;
 }).join('');
 const legend=valid.map((x,i)=>{
  const hoverInfo=`${Number(x.count??x.value)} projet(s) · ${money(x.amount??x.value)}`;
  return `<button class="chart-legend-row" data-tooltip="${esc(hoverInfo)}" data-chart-key="${esc(x.key)}" data-chart-value="${esc(x.valueKey||x.label)}" data-chart-label="${esc(x.label)}"><i style="background:${chartColors[i%chartColors.length]}"></i><span>${esc(x.label)}</span><b>${pct(x.value/total*100)}</b></button>`;
 }).join('');
 const centerValue=items[0]?.key==='status'?items.reduce((sum,x)=>sum+(Number(x.value)||0),0):valid.length;
 const centerLabel=items[0]?.key==='status'?'PROJETS':'SOURCES';
 return `<div class="chart-donut-layout"><svg class="chart-donut" viewBox="0 0 120 120" role="img" aria-label="${esc(label)}"><circle cx="60" cy="60" r="43" fill="none" stroke="#e9eef2" stroke-width="19"/>${circles}<text x="60" y="57" text-anchor="middle" class="donut-center-value">${centerValue}</text><text x="60" y="69" text-anchor="middle" class="donut-center-label">${centerLabel}</text></svg><div class="chart-legend">${legend}</div></div>`;
}

function showChartDetails(title,items,key){
 const panel=$(`#${key}Detail`);
 if(!panel)return;
 const totalCost=items.reduce((s,p)=>s+(+p.cout_actualise||0),0);
 const paid=items.reduce((s,p)=>s+(+p.credits_consommes||0),0);
 const cards=[['Projets',items.length],['Coût actualisé',money(totalCost)],['Crédits consommés',money(paid)]];
 const rows=items.slice().sort((a,b)=>(a.intitule||'').localeCompare(b.intitule||'')).map(p=>`
  <button type="button" data-open="${p.id}">
   <b>${esc(p.intitule||'Projet sans intitulé')}</b>
   <span> · ${p.annee||'Année n.r.'} · ${statusLabel(p.statut_operationnel)} · ${money(p.cout_actualise)}</span>
  </button>`).join('');
 panel.innerHTML=`<button class="detail-close" type="button" aria-label="Fermer">✕ Fermer</button>
  <h3>${esc(title)}</h3>
  <div class="detail-grid">${cards.map(([a,b])=>`<div class="detail-field"><small>${a}</small><b>${b}</b></div>`).join('')}</div>
  <div class="detail-project-list">${rows||'<p class="muted">Aucun projet correspondant.</p>'}</div>`;
 panel.classList.remove('hidden');
 panel.querySelector('.detail-close').onclick=()=>panel.classList.add('hidden');
 panel.querySelectorAll('[data-open]').forEach(btn=>btn.onclick=()=>openDetails(Number(btn.dataset.open)));
 chartSelection={title,items};
}
function selectChartItems(key,value,label){
 let items=key==='trendCategory'?projects:dashboardSubset;
 if(key==='status'){
  items=items.filter(p=>(p.statut_operationnel||'non_demarre')===value);
 }else if(key==='funding'){
  items=items.filter(p=>(+p[value]||0)>0);
 }else if(key==='category'){
  items=items.filter(p=>p.categorie===value);
 }else if(key==='trendCategory'){
  const year=Number(value);
  items=items.filter(p=>p.categorie===label&&Number(p.annee)===year);
 }
 const detailTitle=key==='trendCategory'?`${label} — ${value}`:label;
 showChartDetails(detailTitle,items,key==='trendCategory'?'allocationTrend':key);
}
function yearChartMarkup(){
 const years=[...new Set(dashboardSubset.map(p=>Number(p.annee)).filter(Boolean))].sort((a,b)=>a-b);
 if(!years.length)return '<p class="muted">Aucune donnée annuelle.</p>';
 const counts=years.map(y=>dashboardSubset.filter(p=>Number(p.annee)===y).length);
 const max=Math.max(1,...counts);
 const points=counts.map((n,i)=>({x:35+i*(270/Math.max(1,years.length-1)),y:135-n/max*95,n,year:years[i]}));
 const line=points.map(p=>`${p.x},${p.y}`).join(' ');
 const area=`35,145 ${line} ${points[points.length-1].x},145`;
 const chosen=$('#dashboardYear').value;
 return `<div class="year-chart-wrap"><svg class="year-chart-svg" viewBox="0 0 340 165" role="img" aria-label="Nombre de projets par année">
 <defs><linearGradient id="yearFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#2676a5" stop-opacity=".34"/><stop offset="100%" stop-color="#2676a5" stop-opacity=".02"/></linearGradient></defs>
 <polygon class="year-area" points="${area}"/>
 <polyline class="year-line-animated" pathLength="1" points="${line}" fill="none" stroke="#2676a5" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
 ${points.map(p=>{const amount=dashboardSubset.filter(x=>Number(x.annee)===p.year).reduce((sum,x)=>sum+(+x.cout_actualise||0),0);const hoverInfo=`${p.n} projet(s) · ${money(amount)}`;return `<g class="year-point ${String(p.year)===chosen?'selected':''}" data-tooltip="${esc(hoverInfo)}" aria-label="${p.year}: ${esc(hoverInfo)}"><circle cx="${p.x}" cy="${p.y}" r="6"/><text x="${p.x}" y="${p.y-12}" text-anchor="middle" class="year-value">${p.n}</text><text x="${p.x}" y="157" text-anchor="middle" class="year-label">${p.year}</text></g>`;}).join('')}
 </svg></div><p class="chart-hint">Survolez un point pour voir le nombre de projets et le coût global. Le filtre annuel global pilote les indicateurs et graphiques associés.</p>`;
}

function allocationTrendMarkup(){
 const years=[...new Set(projects.map(p=>Number(p.annee)).filter(Boolean))].sort((a,b)=>a-b);
 const categories=[...new Set(projects.map(p=>p.categorie).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
 const filter=$('#allocationTrendCategoryFilter');
 if(!years.length||!categories.length){
  if(filter)filter.innerHTML='<span class="muted">Aucune catégorie disponible</span>';
  return '<p class="muted">Aucune donnée annuelle par catégorie.</p>';
 }
 if(allocationTrendSelectedCategories===null){
  allocationTrendSelectedCategories=[...categories];
 }else{
  allocationTrendSelectedCategories=allocationTrendSelectedCategories.filter(c=>categories.includes(c));
 }
 if(filter){
  filter.innerHTML=categories.map((c,i)=>`<label class="trend-category-option ${/infrastructure/i.test(c)?'is-infrastructure':''}">
   <input type="checkbox" value="${esc(c)}" ${allocationTrendSelectedCategories.includes(c)?'checked':''}>
   <i style="--trend-color:${chartColors[i%chartColors.length]}"></i><span>${esc(c)}</span>
  </label>`).join('');
 }
 const selected=categories.filter(c=>allocationTrendSelectedCategories.includes(c));
 if(!selected.length)return '<p class="muted">Sélectionnez au moins un type de projet pour afficher les courbes.</p>';
 const width=Math.max(540,years.length*115+70),height=270,left=75,right=20,top=22,bottom=48;
 const plotW=width-left-right,plotH=height-top-bottom;
 const seriesData=selected.map((category,index)=>{
  const points=years.map((year,i)=>{
   const items=projects.filter(p=>p.categorie===category&&Number(p.annee)===year);
   const amount=items.reduce((a,p)=>a+(Number(p.cout_actualise)||0),0);
   return {year,items,amount,x:left+(years.length===1?plotW/2:i*plotW/(years.length-1))};
  });
  const trendPalette=['#2676a5','#e59b45','#8b78bd','#d46c72','#8b9baa','#c06a9b','#7e9b42','#4b9aaf','#b17c4d','#6b78a8'];
  return {category,color:/infrastructure/i.test(category)?'#16877c':trendPalette[categories.indexOf(category)%trendPalette.length],points};
 });
 const max=Math.max(1,...seriesData.flatMap(s=>s.points.map(p=>p.amount)));
 const yAt=v=>top+plotH-(v/max)*plotH;
 const grid=[0,.25,.5,.75,1].map(t=>{
  const y=top+plotH-t*plotH;
  return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" class="trend-grid"/><text x="${left-9}" y="${y+3}" text-anchor="end" class="trend-axis-label">${money(max*t).replace(' DT','')}</text>`;
 }).join('');
 const series=seriesData.map(s=>{
  s.points.forEach(p=>p.y=yAt(p.amount));
  const line=s.points.map(p=>`${p.x},${p.y}`).join(' ');
  const areaPoints=`${s.points[0].x},${top+plotH} ${line} ${s.points[s.points.length-1].x},${top+plotH}`;
  const area=`<polygon class="trend-area-animated" points="${areaPoints}" fill="${s.color}" opacity=".08"/>`;
  const path=`<polyline class="trend-line-animated" pathLength="1" points="${line}" fill="none" stroke="${s.color}" stroke-width="${/infrastructure/i.test(s.category)?4:2.8}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const markers=s.points.map(p=>{
   const info=`${p.year} · ${p.items.length} projet(s) · ${money(p.amount)}`;
   return `<circle class="trend-point" cx="${p.x}" cy="${p.y}" r="5" fill="${s.color}" stroke="#fff" stroke-width="2" tabindex="0" role="button" data-chart-key="trendCategory" data-chart-value="${p.year}" data-chart-label="${esc(s.category)}" data-tooltip="${esc(`${s.category} · ${info}`)}" aria-label="${esc(s.category)} · ${esc(info)}"/>`;
  }).join('');
  return area+path+markers;
 }).join('');
 const xLabels=years.map((year,i)=>{
  const x=left+(years.length===1?plotW/2:i*plotW/(years.length-1));
  return `<text x="${x}" y="${height-18}" text-anchor="middle" class="trend-axis-label">${year}</text>`;
 }).join('');
 const legend=seriesData.map(s=>`<span class="trend-legend-item ${/infrastructure/i.test(s.category)?'is-infrastructure':''}"><i style="background:${s.color}"></i>${esc(s.category)}</span>`).join('');
 return `<div class="trend-legend">${legend}</div><div class="allocation-trend-scroll"><svg class="allocation-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Évolution pluriannuelle des crédits alloués par type de projet">${grid}${series}${xLabels}</svg></div>`;
}
// V1.3.1 - Interactions des graphiques

function handleChartClick(e){
 const target=e.target.closest('[data-chart-key]');
 if(!target)return;

 const key=target.dataset.chartKey;
 const value=target.dataset.chartValue;
 const label=target.dataset.chartLabel;

 selectChartItems(key,value,label);
}

$('#statusList').addEventListener('click',handleChartClick);
$('#fundingChart').addEventListener('click',handleChartClick);
$('#categoryChart').addEventListener('click',handleChartClick);

$('#allocationTrendChart').addEventListener('click',handleChartClick);
$('#allocationTrendCategoryFilter').addEventListener('change',e=>{
 if(!e.target.matches('input[type="checkbox"]'))return;
 allocationTrendSelectedCategories=[...$('#allocationTrendCategoryFilter').querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.value);
 $('#allocationTrendChart').innerHTML=allocationTrendMarkup();
 const detail=$('#allocationTrendDetail');detail.classList.add('hidden');detail.innerHTML='';
});
$('#categoryZoom').addEventListener('input',e=>{
 const value=Number(e.target.value)||100;
 $('#categoryZoomValue').textContent=`${value} %`;
 $('#categoryChart').style.minWidth=`${value}%`;
});

// Info-bulle graphique commune : nombre de projets et montants, au survol.
const dashboardTooltip=$('#dashboardTooltip');
function positionDashboardTooltip(e){
 if(!dashboardTooltip||dashboardTooltip.classList.contains('hidden'))return;
 const pad=14;let x=e.clientX+pad,y=e.clientY+pad;
 const rect=dashboardTooltip.getBoundingClientRect();
 if(x+rect.width>window.innerWidth-8)x=e.clientX-rect.width-pad;
 if(y+rect.height>window.innerHeight-8)y=e.clientY-rect.height-pad;
 dashboardTooltip.style.left=`${Math.max(8,x)}px`;dashboardTooltip.style.top=`${Math.max(8,y)}px`;
}
document.addEventListener('pointerover',e=>{
 const target=e.target.closest('[data-tooltip]');if(!target||!dashboardTooltip)return;
 dashboardTooltip.textContent=target.dataset.tooltip;dashboardTooltip.classList.remove('hidden');positionDashboardTooltip(e);
});
document.addEventListener('pointermove',positionDashboardTooltip);
document.addEventListener('pointerout',e=>{
 const from=e.target.closest('[data-tooltip]');const to=e.relatedTarget?.closest?.('[data-tooltip]');
 if(from&&!to&&dashboardTooltip)dashboardTooltip.classList.add('hidden');
});
document.addEventListener('focusin',e=>{
 const target=e.target.closest('[data-tooltip]');if(target&&dashboardTooltip){dashboardTooltip.textContent=target.dataset.tooltip;dashboardTooltip.classList.remove('hidden');}
});
document.addEventListener('focusout',e=>{if(e.target.closest('[data-tooltip]')&&dashboardTooltip)dashboardTooltip.classList.add('hidden');});

function renderCompletedBalances(){
 const completed=dashboardSubset.filter(p=>p.statut_operationnel==='acheve');
 const overdue=completed.filter(p=>p.code_cloture==='overdue');
 const provisionalProjects=completed.filter(p=>!p.cloture_definitive);
 const provisionalTotal=provisionalProjects.reduce((s,p)=>s+(Number(p.solde_financier_provisoire) || 0),0);
 const finalProjects=completed.filter(p=>p.cloture_definitive);
 const finalTotal=finalProjects.reduce((s,p)=>s+(Number(p.reliquat_definitif)||0),0);
 $('#balanceOverdueCount').textContent=overdue.length;
 $('#balanceProvisionalTotal').textContent=money(provisionalTotal);
 $('#balanceFinalTotal').textContent=money(finalTotal);
 $('#completedBalanceRows').innerHTML=completed.length
  ?completed.map(p=>{
   const provisional=Number(p.solde_financier_provisoire)||0;
   const final=p.cloture_definitive?money(p.reliquat_definitif):'—';
   const procedure=p.type_procedure==='marche'?'Marché':p.type_procedure==='consultation'?'Consultation':'Non renseignée';
   const rowClass=p.code_cloture==='overdue'?'status-overdue':p.cloture_definitive?'status-closed':'status-to_close';
   return `<tr class="clickrow ${rowClass}" data-open="${p.id}" title="Ouvrir la fiche projet">
    <td><button class="project-link" data-open="${p.id}">${esc(p.intitule||'')}</button></td>
    <td>${p.annee||''}</td><td>${procedure}</td><td>${esc(p.statut_cloture||'À renseigner')}</td>
    <td>${money(p.cout_actualise)}</td><td>${money(p.credits_consommes)}</td>
    <td>${money(provisional)}</td><td><strong>${final}</strong></td>
   </tr>`;
  }).join('')
  :`<tr><td colspan="8" class="muted">Aucun projet achevé pour la période sélectionnée.</td></tr>`;
 $('#balanceCountLabel').textContent=`${completed.length} projet(s) achevé(s) · ${overdue.length} alerte(s) de clôture dépassée · ${provisionalProjects.length} solde(s) provisoire(s) · ${finalProjects.length} reliquat(s) définitif(s).`;
}
function render(){if(!projects)return;
 document.querySelectorAll('.chart-inline-detail').forEach(el=>{el.classList.add('hidden');el.innerHTML='';});
 const yearSel=$('#dashboardYear');const allYears=[...new Set(projects.map(p=>p.annee).filter(Boolean).map(Number))].sort((a,b)=>a-b);const prev=yearSel.value;yearSel.innerHTML='<option value="">Toutes les années</option>'+allYears.map(y=>`<option value="${y}">${y}</option>`).join('');yearSel.value=prev;
 const selectedYear=yearSel.value;
const subset=projects.filter(p=>!selectedYear||String(p.annee)===selectedYear);
dashboardSubset=subset;renderCompletedBalances();
const sum=(arr,k)=>arr.reduce((a,p)=>a+(+p[k]||0),0);
 $('#kProjects').textContent=subset.length;$('#kProjectsSub').textContent=selectedYear?`Programmés en ${selectedYear}`:'Toutes années confondues';
const paid=sum(subset,'credits_consommes');
 const budget=sum(subset,'cout_actualise');
 const rate=budget>0?Math.max(0,Math.min(100,paid/budget*100)):0;
 $('#kConsumption').textContent=pct(rate);
 $('#kConsumptionSub').textContent=`${money(paid)} / ${money(budget)} consommés`;
 const gaugeCirc=2*Math.PI*23;
 $('#kConsumptionGauge').innerHTML=`<svg viewBox="0 0 54 54"><circle class="gauge-track" cx="27" cy="27" r="23"/><circle class="gauge-value" cx="27" cy="27" r="23" stroke-dasharray="${gaugeCirc}" stroke-dashoffset="${gaugeCirc*(1-rate/100)}" style="--gauge-offset:${gaugeCirc*(1-rate/100)}"/></svg>`;
 const late=subset.filter(p=>p.alerte_retard==='RETARD'&&!['acheve','annule'].includes(p.statut_operationnel));$('#kLate').textContent=late.length;
 const done=subset.filter(p=>p.statut_operationnel==='acheve');const doneRate=subset.length?done.length/subset.length*100:0;
 $('#kDone').textContent=done.length;$('#kDoneSub').textContent=`Taux de réalisation ${pct(doneRate)}`;
 $('#kDoneProgress').style.width=`${Math.max(0,Math.min(100,doneRate))}%`;
 $('#yearChart').innerHTML=yearChartMarkup();
 const statuses=[
 {label:'Non démarrés',key:'status',valueKey:'non_demarre',value:subset.filter(p=>(p.statut_operationnel||'non_demarre')==='non_demarre').length},
 {label:'En cours',key:'status',valueKey:'en_cours',value:subset.filter(p=>p.statut_operationnel==='en_cours').length},
 {label:'Bloqués',key:'status',valueKey:'suspendu',value:subset.filter(p=>p.statut_operationnel==='suspendu').length},
 {label:'Achevés',key:'status',valueKey:'acheve',value:subset.filter(p=>p.statut_operationnel==='acheve').length},
 {label:'Annulés',key:'status',valueKey:'annule',value:subset.filter(p=>p.statut_operationnel==='annule').length}
].map(x=>{
 const matching=x.valueKey==='non_demarre'
  ?subset.filter(p=>(p.statut_operationnel||'non_demarre')==='non_demarre')
  :subset.filter(p=>p.statut_operationnel===x.valueKey);
 return {...x,count:matching.length,amount:sum(matching,'cout_actualise')};
});
$('#statusList').innerHTML=donutMarkup(statuses,subset.length,'Répartition des projets');
 const funding=[
 ['Autofinancement','autofinancement'],
 ['Prêt','emprunt'],
 ['Aides exceptionnelles','aide_exceptionnelle'],
 ['Aide non affectée','aide_non_affectee'],
 ['Aide affectée','aide_affectee'],
 ['Autres sources','autres_sources']
].map(([label,key])=>({
 label,
 key:'funding',
 valueKey:key,
 value:sum(subset,key),
 count:subset.filter(p=>(+p[key]||0)>0).length,
 amount:sum(subset,key)
})).filter(x=>x.value>0);

$('#fundingChart').innerHTML=donutMarkup(
 funding,
 funding.reduce((a,x)=>a+x.value,0),
 'Sources de financement'
)||'<p class="muted">Aucune source renseignée.</p>';
 const cats=[...new Set(subset.map(p=>p.categorie).filter(Boolean))]
 .map(c=>{
  const matching=subset.filter(p=>p.categorie===c);
  return {label:c,key:'category',valueKey:c,items:matching,
   allocated:sum(matching,'cout_actualise'),paid:sum(matching,'credits_consommes'),count:matching.length};
 })
 .sort((a,b)=>b.allocated-a.allocated);
 const cmax=Math.max(1,...cats.map(x=>x.allocated));
 $('#categoryChart').innerHTML=cats.map(x=>`
  <button type="button" class="category-compare-row" data-chart-key="category" data-chart-value="${esc(x.valueKey)}" data-chart-label="${esc(x.label)}"
   data-tooltip="${esc(`${x.count} projet(s) · Alloué : ${money(x.allocated)} · Consommé : ${money(x.paid)}`)}">
   <span class="category-compare-title">${esc(x.label)}</span>
   <span class="category-compare-bars">
    <span class="category-bar-line"><small>Alloué</small><i class="allocated-fill" style="--bar-width:${x.allocated/cmax*100}%"></i></span>
    <span class="category-bar-line"><small>Consommé</small><i class="consumed-fill" style="--bar-width:${Math.max(0,x.paid)/cmax*100}%"></i></span>
   </span>
   <b class="category-compare-values"><span>${money(x.allocated)}</span><span>${money(x.paid)}</span></b>
  </button>`).join('')||'<p class="muted">Aucune catégorie renseignée.</p>';
 const zoom=$('#categoryZoom');
 if(zoom){$('#categoryZoomValue').textContent=`${zoom.value} %`;$('#categoryChart').style.minWidth=`${zoom.value}%`;}
 $('#allocationTrendChart').innerHTML=allocationTrendMarkup();
 const recent=[...subset].filter(p=>p.date_dernier_suivi).sort((a,b)=>b.date_dernier_suivi.localeCompare(a.date_dernier_suivi)).slice(0,5);$('#recentRows').innerHTML=recent.length?recent.map(p=>`<tr class="clickrow" data-open="${p.id}" title="Ouvrir la fiche projet"><td><button class="project-link" data-open="${p.id}">${esc(p.intitule||'')}</button></td><td>${p.annee||''}</td><td>${esc(p.categorie||'')}</td><td>${money(p.cout_actualise)}</td><td>${pct(p.taux_physique)}</td><td>${esc(p.date_dernier_suivi)}</td></tr>`).join(''):`<tr><td colspan="6" class="muted">Aucun suivi enregistré.</td></tr>`;
 const alertItems=[];subset.forEach(p=>{if(p.statut_operationnel==='acheve'&&['overdue','incomplete','awaiting_definitive','missing_provisional','invalid_definitive_date','unknown','to_close'].includes(p.code_cloture)){alertItems.push({name:p.intitule,label:p.statut_cloture,detail:p.date_limite_cloture?`Échéance de clôture : ${formatDateFR(p.date_limite_cloture)}`:'Dates de réception à compléter',kind:['overdue','invalid_definitive_date'].includes(p.code_cloture)?'danger':'warning'});}if(p.statut_operationnel==='suspendu')alertItems.push({name:p.intitule,label:'Bloqué / suspendu',detail:p.motif_blocage||'Motif à renseigner',kind:'danger'});if(p.alerte_retard==='RETARD'&&!['acheve','annule'].includes(p.statut_operationnel))alertItems.push({name:p.intitule,label:'En retard',detail:`${p.jours_retard} jour(s) de retard`,kind:'danger'});if(p.alerte_demarrage)alertItems.push({name:p.intitule,label:'Démarrage à surveiller',detail:'Seuil après programmation dépassé',kind:'warning'});if(p.alerte_inactivite)alertItems.push({name:p.intitule,label:'Actualisation nécessaire',detail:'Aucun suivi enregistré récemment',kind:'warning'});if(p.echeance_proche)alertItems.push({name:p.intitule,label:'Échéance proche',detail:'Fin contractuelle dans le seuil défini',kind:'warning'});});$('#alertsList').innerHTML=alertItems.length?alertItems.map(a=>`<div class="alertrow ${a.kind}"><b>${esc(a.name)}</b><span>${esc(a.label)} — ${esc(a.detail)}</span></div>`).join(''):'<p class="muted">Aucune alerte calculée avec les dates actuellement renseignées.</p>';
 const yf=$('#yearFilter'),old=yf.value;yf.innerHTML='<option value="">Toutes les années</option>'+allYears.map(y=>`<option>${y}</option>`).join('');yf.value=old;const catsList=[...new Set(projects.map(p=>p.categorie).filter(Boolean))].sort();const cf=$('#catFilter'),oc=cf.value;cf.innerHTML='<option value="">Toutes les catégories</option>'+catsList.map(c=>`<option>${esc(c)}</option>`).join('');cf.value=oc;renderTable();}
function renderTable(){const q=$('#search').value.toLowerCase(),y=$('#yearFilter').value,c=$('#catFilter').value;const rows=projects.filter(p=>(!q||[p.intitule,p.commune,p.categorie,p.sous_categorie].join(' ').toLowerCase().includes(q))&&(!y||String(p.annee)===y)&&(!c||p.categorie===c));$('#projectRows').innerHTML=rows.map(p=>`<tr class="clickrow" data-open="${p.id}" title="Ouvrir la fiche projet"><td>${p.id}</td><td><button class="project-link" data-open="${p.id}">${esc(p.intitule)}</button></td><td>${p.annee||''}</td><td>${esc(p.categorie||'')}</td><td>${money(p.cout_actualise)}</td><td>${money(p.credits_consommes)}</td><td>${pct(p.taux_physique)}</td><td>${statusLabel(p.statut_operationnel)}</td><td>${p.statut_operationnel==='suspendu'?'Bloqué':p.alerte_retard==='RETARD'?'En retard':p.alerte_demarrage?'Démarrage à surveiller':p.echeance_proche?'Échéance proche':'Normal'}</td><td>${esc(p.etape||'')}</td><td class="project-actions">
    <button type="button" class="icon-action" data-open="${p.id}" title="Consulter" aria-label="Consulter le projet"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button>
    <button type="button" class="icon-action" data-edit="${p.id}" title="Modifier" aria-label="Modifier le projet"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></button>
    <button type="button" class="icon-action delete" data-del="${p.id}" title="Supprimer" aria-label="Supprimer le projet"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg></button>
   </td></tr>`).join('');$('#countLabel').textContent=`${rows.length} / ${projects.length} projet(s)`;}
function openForm(p={}){const f=$('#projectForm');f.reset();Object.keys(p).forEach(k=>{if(f.elements[k])f.elements[k].value=p[k]??''});if(!p.id){$('#warrantyDuration').value='12';}else if(p.duree_garantie_mois==null||p.duree_garantie_mois===''){$('#warrantyDuration').value=p.type_procedure==='marche'?'12':'0';}$('#formTitle').textContent=p.id?(lang==='ar'?'تعديل مشروع':'Modifier le projet'):(lang==='ar'?'مشروع جديد':'Nouveau projet');$('#formMessage').textContent='';$('#modal').classList.remove('hidden');setTimeout(()=>f.elements.intitule.focus(),50)}function closeForm(){$('#modal').classList.add('hidden')}
function formatDateFR(value){
 if(!value)return '—';
 const match=String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
 if(!match)return value;
 return `${match[3]}/${match[2]}/${match[1]}`;
}
async function openDetails(id){
 let p=await window.api.getProject(Number(id));
 if(!p)return;
 p=calc(p);$('#detailTitle').textContent=p.intitule;$('#detailSubtitle').textContent=`Projet n° ${p.id} · ${p.annee||'Année non renseignée'} · ${statusLabel(p.statut_operationnel)}`;
 const items=[['Gouvernorat',p.gouvernorat],['Commune',p.commune],['Catégorie',p.categorie],['Sous-catégorie',p.sous_categorie],['Coût initial',money(p.cout_initial)],['Coût actualisé',money(p.cout_actualise)],['Financement total',money(p.total_financement_fonds)],['Ressources réalisées',money(p.ressources_realisees)],['Crédits consommés',money(p.credits_consommes)],['Reliquat sur ressources réalisées',money(p.reliquat)],
['Taux d’absorption des ressources',pct(p.taux_financier)],
['Reliquat sur coût actualisé',money(p.reliquat_credit_actualise)],
['Taux de consommation du coût actualisé',pct(p.taux_consommation)],['Date de programmation',p.date_programmation],['Début des travaux',p.date_debut],['Durée contractuelle (mois)',p.duree_mois],['Fin contractuelle calculée',p.date_fin_prevue],['Taux physique',pct(p.taux_physique)],['Étape',p.etape],['Date du blocage',p.date_blocage],['Motif du blocage',p.motif_blocage],
['Action corrective',p.action_corrective],
['Reprise prévisionnelle',formatDateFR(p.date_reprise_prevue)],
['Dernier suivi',formatDateFR(p.date_dernier_suivi)],
['Type de procédure',p.type_procedure==='marche'?'Marché':p.type_procedure==='consultation'?'Consultation':'—'],
['Date de réception provisoire',formatDateFR(p.date_reception_provisoire)],
['Durée de garantie (mois)',p.duree_garantie_mois],
['Date de réception définitive',formatDateFR(p.date_reception_definitive)],
['Date du règlement définitif',formatDateFR(p.date_reglement_definitif)],
['Date de clôture effective',formatDateFR(p.date_cloture)],
 ['Fin de garantie calculée',formatDateFR(p.date_fin_garantie)],
 ['Date limite de clôture',formatDateFR(p.date_limite_cloture)],
 ['Statut de clôture',p.statut_cloture||'Non renseigné'],
 ['Solde financier provisoire',money(p.solde_financier_provisoire)],
 ['Reliquat définitif',p.cloture_definitive?money(p.reliquat_definitif):'Non déterminé : dossier non clôturé'],
 ['Observations',p.observations]];
 const history=p.historique||[];$('#detailContent').innerHTML=`<div class="detail-actions"><button class="primary" id="detailEdit">Modifier la fiche</button><button class="secondary" id="detailCloseBtn">Fermer</button></div><h3>Informations du projet</h3><div class="detail-grid">${items.map(([k,v])=>`<div class="detail-field"><small>${esc(k)}</small><b>${esc(v===null||v===undefined||v===''?'—':v)}</b></div>`).join('')}</div><h3>Historique des suivis (${history.length})</h3><div class="tablewrap"><table><thead><tr><th>Date</th><th>Avancement</th><th>Crédits consommés</th><th>État</th><th>Étape</th><th>Motif blocage</th><th>Observations</th></tr></thead><tbody>${history.length?history.map(h=>`<tr><td>${esc(h.date_suivi)}</td><td>${h.taux_physique==null?'—':pct(h.taux_physique)}</td><td>${h.credits_consommes==null?'—':money(h.credits_consommes)}</td><td>${esc(h.statut_operationnel?statusLabel(h.statut_operationnel):'—')}</td><td>${esc(h.etape||'—')}</td><td>${esc(h.motif_blocage||'—')}</td><td>${esc(h.observations||'—')}</td></tr>`).join(''):'<tr><td colspan="6" class="muted">Aucun suivi enregistré pour ce projet.</td></tr>'}</tbody></table></div><h3>Enregistrer un nouveau suivi</h3><form id="followupForm" data-project="${p.id}"><div class="followup-grid"><label>Date du suivi *<input name="date_suivi" type="date" value="${today()}" required></label><label>Avancement physique (%)<input name="taux_physique" type="number" min="0" max="100" step="0.01" value="${p.taux_physique??''}"></label><label>Crédits consommés (DT)<input name="credits_consommes" type="number" min="0" step="0.001" value="${p.credits_consommes??''}"></label><label>État opérationnel<select name="statut_operationnel"><option value="">Ne pas modifier</option><option value="non_demarre" ${p.statut_operationnel==='non_demarre'?'selected':''}>Non démarré</option><option value="en_cours" ${p.statut_operationnel==='en_cours'?'selected':''}>En cours</option><option value="suspendu" ${p.statut_operationnel==='suspendu'?'selected':''}>Bloqué / suspendu</option><option value="acheve" ${p.statut_operationnel==='acheve'?'selected':''}>Achevé</option><option value="annule" ${p.statut_operationnel==='annule'?'selected':''}>Annulé</option></select></label><label class="wide">Étape actuelle<input name="etape" value="${esc(p.etape||'')}"></label><label>Date du blocage<input name="date_blocage" type="date" value="${p.date_blocage||''}"></label><label>Motif du blocage<select name="motif_blocage"><option value="">—</option>${['Problème foncier','Études techniques','Procédure de marché','Crédits indisponibles','Difficultés avec l’entreprise','Réseaux concessionnaires','Difficultés administratives','Opposition / riverains','Autre'].map(x=>`<option ${p.motif_blocage===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Date prévisionnelle de reprise<input name="date_reprise_prevue" type="date" value="${p.date_reprise_prevue||''}"></label><label class="wide">Action corrective<textarea name="action_corrective" rows="2">${esc(p.action_corrective||'')}</textarea></label><label class="wide">Observations du suivi<textarea name="observations" rows="2"></textarea></label></div><div class="formfooter"><span id="followupMessage"></span><button class="primary" type="submit">Enregistrer le suivi</button></div></form><h3>Historique des paiements (${(p.paiements||[]).length})</h3><p class="muted">Total payé enregistré : <b>${money(p.paiements_total||0)}</b>${p.has_payment_history?'':' · Aucun paiement détaillé enregistré ; l’ancien cumul reste conservé. Pour un projet existant, saisissez tout l’historique avant le premier enregistrement : ensuite le cumul affiché sera la somme des paiements détaillés.'}</p><div class="tablewrap"><table><thead><tr><th>Date</th><th>Montant payé</th><th>Référence</th><th>Type de document</th><th>Observation</th><th>Actions</th></tr></thead><tbody>${(p.paiements||[]).map(pay=>`<tr><td>${esc(pay.payment_date)}</td><td>${money(pay.amount)}</td><td>${esc(pay.payment_reference||'—')}</td><td>${esc(pay.document_type||'—')}</td><td>${esc(pay.observation||'—')}</td><td><button class="action" data-payment-edit="${pay.id}">Modifier</button><button class="action delete" data-payment-del="${pay.id}">Supprimer</button></td></tr>`).join('')||'<tr><td colspan="6" class="muted">Aucune opération enregistrée.</td></tr>'}</tbody></table></div><h3>Ajouter un paiement</h3><form id="paymentForm" data-project="${p.id}"><div class="followup-grid"><label>Date réelle du paiement *<input name="payment_date" type="date" value="${today()}" required></label><label>Montant payé (DT) *<input name="amount" type="number" min="0.001" step="0.001" required></label><label>Référence du paiement / décompte<input name="payment_reference"></label><label>Type de document<input name="document_type" placeholder="Décompte, mandat, pièce de paiement…"></label><label class="wide">Observation<textarea name="observation" rows="2"></textarea></label></div><div class="formfooter"><span id="paymentMessage"></span><button class="primary" type="submit">Enregistrer le paiement</button></div></form>`;
 $('#detailModal').classList.remove('hidden');$('#detailEdit').onclick=()=>{closeDetails();openForm(p)};$('#detailCloseBtn').onclick=closeDetails;$('#followupForm').addEventListener('submit',saveFollowup);$('#paymentForm').addEventListener('submit',savePayment);$('#detailContent').onclick=paymentActions;}
function closeDetails(){$('#detailModal').classList.add('hidden')}
async function saveFollowup(e){e.preventDefault();const f=e.currentTarget;const v={project_id:Number(f.dataset.project)};for(const el of f.elements){if(!el.name)continue;let x=el.value;if(['taux_physique','credits_consommes'].includes(el.name))x=x===''?null:Number(x);v[el.name]=x;}try{await window.api.addFollowup(v);await load();await openDetails(v.project_id);toast('Suivi enregistré dans l’historique');}catch(err){$('#followupMessage').textContent=err.message;}}
async function savePayment(e){e.preventDefault();const f=e.currentTarget;const v={project_id:Number(f.dataset.project)};for(const el of f.elements)if(el.name)v[el.name]=el.name==='amount'?Number(el.value):el.value;try{await window.api.addPayment(v);await load();await openDetails(v.project_id);toast('Paiement enregistré');}catch(err){$('#paymentMessage').textContent=err.message;}}
async function paymentActions(e){const del=e.target.dataset.paymentDel,edit=e.target.dataset.paymentEdit;if(del){if(confirm('Supprimer définitivement cette opération de paiement ?')){await window.api.deletePayment(Number(del));const id=Number($('#paymentForm').dataset.project);await load();await openDetails(id);toast('Paiement supprimé');}}else if(edit){const id=Number(edit),row=(await window.api.listPayments(Number($('#paymentForm').dataset.project))).find(x=>x.id===id);if(!row)return;const date=prompt('Date du paiement (AAAA-MM-JJ)',row.payment_date);if(date===null)return;const amount=prompt('Montant payé (DT)',row.amount);if(amount===null)return;const ref=prompt('Référence',row.payment_reference||'');if(ref===null)return;await window.api.updatePayment({...row,payment_date:date,amount:Number(amount),payment_reference:ref});const projectId=Number($('#paymentForm').dataset.project);await load();await openDetails(projectId);toast('Paiement modifié');}}
$('#procedureType').addEventListener('change',e=>{
 const duration=$('#warrantyDuration');
 duration.value=e.target.value==='marche'?'12':e.target.value==='consultation'?'0':'';
});
$('#projectForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;const p={};for(const el of f.elements){if(el.name){let v=el.value;if(['annee','duree_mois','duree_garantie_mois'].includes(el.name))v=v===''?null:Number(v);else if(['cout_initial','cout_actualise','autofinancement','emprunt','aide_exceptionnelle','aide_non_affectee','aide_affectee','autres_sources','ressources_realisees','credits_consommes','taux_physique'].includes(el.name))v=v===''?0:Number(v);p[el.name]=v;}}p.id=p.id?Number(p.id):null;if(p.statut_operationnel==='suspendu'&&!p.motif_blocage){$('#formMessage').textContent='Veuillez préciser le motif du blocage.';return;}try{await window.api.save(p);await load();closeForm();toast('Projet enregistré avec succès');}catch(err){$('#formMessage').textContent='Erreur : '+err.message;}});
$('#projectRows').addEventListener('click',async e=>{const edit=e.target.dataset.edit,del=e.target.dataset.del,open=e.target.dataset.open||e.target.closest('[data-open]')?.dataset.open;if(edit){e.stopPropagation();openForm(projects.find(p=>p.id===Number(edit)));return;}if(del){
  e.stopPropagation();
  const p=projects.find(p=>p.id===Number(del));
  if(!p)return;
  try{
   const full=await window.api.getProject(Number(del));
   const followups=full?.historique?.length||0;
   const payments=full?.paiements?.length||0;
   let message=`Supprimer définitivement le projet « ${p.intitule} » ?`;
   if(followups||payments){
    message+=`\n\nAttention : ce projet possède ${followups} suivi(s) et ${payments} paiement(s). Ces historiques seront également supprimés.`;
   }
   message+='\n\nUne sauvegarde SQLite sera créée automatiquement avant la suppression.';
   if(!confirm(message))return;
   if((followups||payments)&&!confirm('Confirmez-vous une seconde fois la suppression définitive de ce projet et de tout son historique ?'))return;
   const result=await window.api.remove(Number(del));
   await load();
   toast(result?.backupPath?'Projet supprimé · sauvegarde créée':'Projet supprimé');
  }catch(err){toast(`Suppression impossible : ${err.message}`);}
  return;
 }if(open)openDetails(Number(open));});
$('#completedBalanceRows').addEventListener('click',e=>{const open=e.target.dataset.open||e.target.closest('[data-open]')?.dataset.open;if(open)openDetails(Number(open));});
$('#recentRows').addEventListener('click',e=>{const open=e.target.dataset.open||e.target.closest('[data-open]')?.dataset.open;if(open)openDetails(Number(open));});
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.view)));document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.goto)));$('#addBtn').onclick=()=>openForm();$('#closeModal').onclick=$('#cancelForm').onclick=closeForm;$('#closeDetail').onclick=closeDetails;$('#search').oninput=renderTable;$('#yearFilter').onchange=renderTable;$('#catFilter').onchange=renderTable;$('#language').onchange=e=>{lang=e.target.value;applyLang()};$('#dashboardYear').onchange=render;
async function exportExcel(){const p=await window.api.exportExcel();if(p)toast('Export Excel terminé');}async function importExcel(){const r=await window.api.importExcel();if(r){await load();toast(`${r.count} ligne(s) importée(s)`);}}
$('#exportBtn').onclick=$('#settingsExport').onclick=exportExcel;$('#importBtn').onclick=$('#settingsImport').onclick=importExcel;$('#backupBtn').onclick=async()=>{const p=await window.api.backup();if(p)toast('Sauvegarde créée');};$('#restoreBtn').onclick=async()=>{if(confirm('La restauration remplacera les données actuelles. Continuer ?')){if(await window.api.restore()){await load();toast('Base restaurée');}}};
async function loadThresholds(){const s=await window.api.getSettings();$('#thresholdStart').value=s.seuil_demarrage_jours;$('#thresholdInactive').value=s.seuil_inactivite_jours;$('#thresholdDue').value=s.seuil_echeance_jours;}
$('#saveThresholds').onclick=async()=>{await window.api.saveSettings({seuil_demarrage_jours:$('#thresholdStart').value,seuil_inactivite_jours:$('#thresholdInactive').value,seuil_echeance_jours:$('#thresholdDue').value});await load();toast('Seuils enregistrés');};
document.querySelectorAll('.printBtn').forEach(b=>b.addEventListener('click',()=>window.print()));
loadThresholds();load();
