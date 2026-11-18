const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

let db;

const fields = ['gouvernorat','commune','intitule','categorie','sous_categorie','annee','cout_initial','cout_actualise','autofinancement','emprunt','aide_exceptionnelle','aide_non_affectee','aide_affectee','autres_sources','ressources_realisees','credits_consommes','date_programmation','date_debut','duree_mois','taux_physique','etape','statut_operationnel','date_blocage','motif_blocage','action_corrective','date_reprise_prevue','derniere_actualisation','observations','type_procedure','date_reception_provisoire','duree_garantie_mois','date_reception_definitive','date_reglement_definitif','date_cloture'];

function tableColumns(table){ return new Set(db.prepare(`PRAGMA table_info(${table})`).all().map(c=>c.name)); }
function initDb(){
 const dir=path.join(app.getPath('appData'),'project-manager-tataouine-v1.3');
 fs.mkdirSync(dir,{recursive:true});
 db=new Database(path.join(dir,'project-manager.sqlite')); db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON');
 db.exec(`CREATE TABLE IF NOT EXISTS projects (
 id INTEGER PRIMARY KEY AUTOINCREMENT, gouvernorat TEXT, commune TEXT, intitule TEXT NOT NULL,
 categorie TEXT, sous_categorie TEXT, annee INTEGER, cout_initial REAL DEFAULT 0, cout_actualise REAL DEFAULT 0,
 autofinancement REAL DEFAULT 0, emprunt REAL DEFAULT 0, aide_exceptionnelle REAL DEFAULT 0,
 aide_non_affectee REAL DEFAULT 0, aide_affectee REAL DEFAULT 0, autres_sources REAL DEFAULT 0,
 ressources_realisees REAL DEFAULT 0, credits_consommes REAL DEFAULT 0, date_debut TEXT, duree_mois INTEGER,
 taux_physique REAL DEFAULT 0, etape TEXT, statut_operationnel TEXT DEFAULT 'non_demarre', date_programmation TEXT,
 date_blocage TEXT, motif_blocage TEXT, action_corrective TEXT, date_reprise_prevue TEXT, derniere_actualisation TEXT,
 observations TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
 );
 CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS project_followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  date_suivi TEXT NOT NULL,
  taux_physique REAL,
  credits_consommes REAL,
  etape TEXT,
  statut_operationnel TEXT,
  date_blocage TEXT,
  motif_blocage TEXT,
  action_corrective TEXT,
  date_reprise_prevue TEXT,
  observations TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
 );
 CREATE INDEX IF NOT EXISTS idx_followups_project_date ON project_followups(project_id,date_suivi DESC,id DESC);
 CREATE TABLE IF NOT EXISTS project_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, payment_date TEXT NOT NULL, amount REAL NOT NULL CHECK(amount>=0),
  payment_reference TEXT, document_type TEXT, observation TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
 );
 CREATE INDEX IF NOT EXISTS idx_payments_project_date ON project_payments(project_id,payment_date,id);`);
 const existing=tableColumns('projects');
 const migrations={
 date_programmation:'TEXT',
 statut_operationnel:"TEXT DEFAULT 'non_demarre'",
 date_blocage:'TEXT',
 motif_blocage:'TEXT',
 action_corrective:'TEXT',
 date_reprise_prevue:'TEXT',
 derniere_actualisation:'TEXT',
 created_at:'TEXT',
 updated_at:'TEXT',
 type_procedure:'TEXT',
 date_reception_provisoire:'TEXT',
 duree_garantie_mois:'INTEGER DEFAULT 12',
 date_reception_definitive:'TEXT',
 date_reglement_definitif:'TEXT',
 date_cloture:'TEXT'
};

for(const [name,type] of Object.entries(migrations)){
 if(!existing.has(name)){
  db.exec(`ALTER TABLE projects ADD COLUMN ${name} ${type}`);
 }
}
 db.exec(`UPDATE projects SET statut_operationnel=CASE
  WHEN TRIM(COALESCE(etape,''))='تمّ الإنجاز' THEN 'acheve'
  WHEN TRIM(COALESCE(etape,''))='مشروع ملغى' THEN 'annule'
  WHEN TRIM(COALESCE(etape,''))='في طور الإنجاز' THEN 'en_cours'
  WHEN TRIM(COALESCE(etape,''))='مشروع معطل' THEN 'suspendu'
  ELSE COALESCE(statut_operationnel,'non_demarre') END
  WHERE statut_operationnel IS NULL OR statut_operationnel='' OR (statut_operationnel='non_demarre' AND TRIM(COALESCE(etape,'')) IN ('تمّ الإنجاز','مشروع ملغى','في طور الإنجاز','مشروع معطل'))`);
 const defaults={seuil_demarrage_jours:'90',seuil_inactivite_jours:'30',seuil_echeance_jours:'30'};
 const put=db.prepare('INSERT OR IGNORE INTO settings(key,value) VALUES (?,?)'); Object.entries(defaults).forEach(([k,v])=>put.run(k,v));
 const count=db.prepare('SELECT COUNT(*) n FROM projects').get().n;
 if(count===0){
  const seedPath=path.join(__dirname,'..','seed-projects.json');
  if(fs.existsSync(seedPath)){
   const seed=JSON.parse(fs.readFileSync(seedPath,'utf8'));
   const stmt=db.prepare(`INSERT INTO projects (${fields.join(',')}) VALUES (${fields.map(x=>'@'+x).join(',')})`);
   const tx=db.transaction(rows=>rows.forEach(row=>{const clean={};fields.forEach(f=>clean[f]=row[f]??null);stmt.run(clean);})); tx(seed);
  }
 }
}
function getSettings(){return Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map(x=>[x.key,Number(x.value)]));}
function latestFollowup(projectId){return db.prepare('SELECT * FROM project_followups WHERE project_id=? ORDER BY date_suivi DESC,id DESC LIMIT 1').get(projectId)||null;}

function addMonthsISO(value, months){
 if(!value)return null;
 const m=String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
 if(!m)return null;
 const year=Number(m[1]), month=Number(m[2])-1, day=Number(m[3]);
 const first=new Date(year,month,1,12);
 first.setMonth(first.getMonth()+Number(months||0));
 const lastDay=new Date(first.getFullYear(),first.getMonth()+1,0,12).getDate();
 first.setDate(Math.min(day,lastDay));
 return `${first.getFullYear()}-${String(first.getMonth()+1).padStart(2,'0')}-${String(first.getDate()).padStart(2,'0')}`;
}
function closeoutInfo(p){
 const type=p.type_procedure||'';
 const provisional=p.date_reception_provisoire||null;
 const duration=p.duree_garantie_mois==null||p.duree_garantie_mois===''?(type==='marche'?12:0):Math.max(0,Number(p.duree_garantie_mois)||0);
 const warrantyEnd=provisional&&duration>0?addMonthsISO(provisional,duration):null;
 const definitive=p.date_reception_definitive||null;
 const settlement=p.date_reglement_definitif||null;
 const closure=p.date_cloture||null;
 const deadline=definitive?addMonthsISO(definitive,3):null;
 const requiresProvisional=type==='marche'||duration>0;
 const now=new Date(); const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 let status='Procédure non renseignée', code='unknown';
 if(type){
  if(requiresProvisional&&!provisional){status='Réception provisoire à renseigner';code='missing_provisional';}
  else if(!definitive){
   if(warrantyEnd&&today<warrantyEnd){status='En période de garantie';code='warranty';}
   else{status='Réception définitive à enregistrer';code='awaiting_definitive';}
  }else if(warrantyEnd&&definitive<warrantyEnd){
   status='Réception définitive antérieure à la fin de garantie';code='invalid_definitive_date';
  }else if(closure&&settlement&&closure>=definitive&&closure>=settlement){
   status='Clôturé définitivement';code='closed';
  }else if(deadline&&today>deadline){
   status='Délai de clôture dépassé';code='overdue';
  }else if(closure){
   status='Clôture incomplète';code='incomplete';
  }else{
   status='À clôturer';code='to_close';
  }
 }
 return {type_procedure:type,duree_garantie_effective:duration,date_fin_garantie:warrantyEnd,date_limite_cloture:deadline,statut_cloture:status,code_cloture:code,cloture_definitive:code==='closed'};
}

function derived(p){
 const paymentSummary=db.prepare('SELECT COUNT(*) n, COALESCE(SUM(amount),0) total FROM project_payments WHERE project_id=?').get(p.id);
 const paid=paymentSummary.n>0?Number(paymentSummary.total):Number(p.credits_consommes)||0;
 const total=['autofinancement','emprunt','aide_exceptionnelle','aide_non_affectee','aide_affectee','autres_sources'].reduce((s,k)=>s+(Number(p[k])||0),0);
 const reliquat=(Number(p.ressources_realisees)||0)-paid;
 const tauxFin=Number(p.ressources_realisees)>0?paid/Number(p.ressources_realisees)*100:0;
 let fin=null; if(p.date_debut&&p.duree_mois){const d=new Date(p.date_debut+'T12:00:00');d.setMonth(d.getMonth()+Number(p.duree_mois));fin=d.toISOString().slice(0,10);}
 const operationalStatus=p.statut_operationnel||(p.etape==='تمّ الإنجاز'?'acheve':p.etape==='في طور الإنجاز'?'en_cours':'non_demarre');
 const done=['acheve','annule'].includes(operationalStatus);
 const now=new Date(); const late=!!(fin&&!done&&new Date(fin+'T23:59:59')<now);
 const days=late?Math.floor((now-new Date(fin+'T23:59:59'))/86400000):0;
 const st=getSettings();
 const daysSinceProg=p.date_programmation?Math.floor((now-new Date(p.date_programmation+'T12:00:00'))/86400000):null;
 const last=latestFollowup(p.id); const lastDate=last?.date_suivi||null;
 const daysInactive=lastDate?Math.floor((now-new Date(lastDate+'T12:00:00'))/86400000):null;
 const startAlert=operationalStatus==='non_demarre'&&daysSinceProg!==null&&daysSinceProg>=st.seuil_demarrage_jours;
 const inactiveAlert=operationalStatus==='en_cours'&&daysInactive!==null&&daysInactive>=st.seuil_inactivite_jours;
 const nearDue=!!(fin&&!done&&!late&&Math.ceil((new Date(fin+'T23:59:59')-now)/86400000)<=st.seuil_echeance_jours);
 const closure=closeoutInfo(p); const soldeProvisoire=(Number(p.cout_actualise)||0)-paid; const reliquatDefinitif=closure.cloture_definitive?soldeProvisoire:null;
 return {...p,...closure,credits_consommes:paid,paiements_count:paymentSummary.n,paiements_total:paymentSummary.total,has_payment_history:paymentSummary.n>0,statut_operationnel:operationalStatus,total_financement_fonds:total,reliquat,taux_financier:tauxFin,date_fin_prevue:fin,solde_financier_provisoire:soldeProvisoire,reliquat_definitif:reliquatDefinitif,taux_consommation: (Number(p.cout_actualise)||0)>0?paid/(Number(p.cout_actualise)||1)*100:0,alerte_retard:late?'RETARD':'OK',jours_retard:days,alerte_demarrage:startAlert,alerte_inactivite:inactiveAlert,echeance_proche:nearDue,date_dernier_suivi:lastDate,dernier_suivi:last};
}
function getProject(projectId){const p=db.prepare('SELECT * FROM projects WHERE id=?').get(projectId);if(!p)return null;return {...derived(p),historique:db.prepare('SELECT * FROM project_followups WHERE project_id=? ORDER BY date_suivi DESC,id DESC').all(projectId),paiements:db.prepare('SELECT * FROM project_payments WHERE project_id=? ORDER BY payment_date DESC,id DESC').all(projectId)};}

ipcMain.handle('projects:list',()=>db.prepare('SELECT * FROM projects ORDER BY annee DESC,id DESC').all().map(derived));
ipcMain.handle('projects:get',(_,id)=>getProject(Number(id)));
ipcMain.handle('projects:save',(_,p)=>{
 const data={};fields.forEach(f=>data[f]=p[f]??null);
 if(p.id){const stmt=db.prepare(`UPDATE projects SET ${fields.map(f=>`${f}=@${f}`).join(',')},updated_at=CURRENT_TIMESTAMP WHERE id=@id`);stmt.run({...data,id:p.id});return getProject(p.id);}
 const info=db.prepare(`INSERT INTO projects (${fields.join(',')}) VALUES (${fields.map(f=>'@'+f).join(',')})`).run(data);return getProject(info.lastInsertRowid);
});
ipcMain.handle('projects:delete',async(_,id)=>{
  const projectId=Number(id);
  if(!Number.isInteger(projectId)||projectId<=0)throw new Error('Identifiant de projet invalide.');
  const exists=db.prepare('SELECT id FROM projects WHERE id=?').get(projectId);
  if(!exists)return {deleted:0,followups:0,payments:0,backupPath:null};
  const backupDir=path.join(app.getPath('appData'),'project-manager-tataouine-v1.3','backups');
  fs.mkdirSync(backupDir,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const backupPath=path.join(backupDir,`before-delete-project-${projectId}-${stamp}.sqlite`);
  await db.backup(backupPath);
  const tx=db.transaction(()=>{
   const followups=db.prepare('SELECT COUNT(*) AS n FROM project_followups WHERE project_id=?').get(projectId).n;
   const payments=db.prepare('SELECT COUNT(*) AS n FROM project_payments WHERE project_id=?').get(projectId).n;
   const deleted=db.prepare('DELETE FROM projects WHERE id=?').run(projectId).changes;
   return {deleted,followups,payments,backupPath};
  });
  return tx();
 });
ipcMain.handle('payments:list',(_,projectId)=>db.prepare('SELECT * FROM project_payments WHERE project_id=? ORDER BY payment_date DESC,id DESC').all(Number(projectId)));
ipcMain.handle('payments:add',(_,v)=>{
 const projectId=Number(v.project_id), amount=Number(v.amount);
 if(!db.prepare('SELECT id FROM projects WHERE id=?').get(projectId))throw new Error('Projet introuvable.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v.payment_date||''))throw new Error('La date réelle du paiement est obligatoire.');
 if(!Number.isFinite(amount)||amount<=0)throw new Error('Le montant payé doit être supérieur à zéro.');
 const info=db.prepare('INSERT INTO project_payments(project_id,payment_date,amount,payment_reference,document_type,observation) VALUES (?,?,?,?,?,?)').run(projectId,v.payment_date,amount,v.payment_reference||null,v.document_type||null,v.observation||null);
 return db.prepare('SELECT * FROM project_payments WHERE id=?').get(info.lastInsertRowid);
});
ipcMain.handle('payments:update',(_,v)=>{
 const id=Number(v.id), amount=Number(v.amount);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v.payment_date||'')||!Number.isFinite(amount)||amount<=0)throw new Error('Date ou montant de paiement invalide.');
 db.prepare('UPDATE project_payments SET payment_date=?,amount=?,payment_reference=?,document_type=?,observation=? WHERE id=?').run(v.payment_date,amount,v.payment_reference||null,v.document_type||null,v.observation||null,id);
 return db.prepare('SELECT * FROM project_payments WHERE id=?').get(id);
});
ipcMain.handle('payments:delete',(_,id)=>db.prepare('DELETE FROM project_payments WHERE id=?').run(Number(id)).changes);
ipcMain.handle('followups:add',(_,v)=>{
 const projectId=Number(v.project_id); if(!db.prepare('SELECT id FROM projects WHERE id=?').get(projectId))throw new Error('Projet introuvable.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v.date_suivi||''))throw new Error('La date du suivi est obligatoire.');
 const current=db.prepare('SELECT motif_blocage FROM projects WHERE id=?').get(projectId);
 if(v.statut_operationnel==='suspendu'&&!v.motif_blocage&&!current.motif_blocage)throw new Error('Pour déclarer un blocage, précisez son motif.');
 const tx=db.transaction(()=>{
  db.prepare(`INSERT INTO project_followups(project_id,date_suivi,taux_physique,credits_consommes,etape,statut_operationnel,date_blocage,motif_blocage,action_corrective,date_reprise_prevue,observations) VALUES (@project_id,@date_suivi,@taux_physique,@credits_consommes,@etape,@statut_operationnel,@date_blocage,@motif_blocage,@action_corrective,@date_reprise_prevue,@observations)`).run({project_id:projectId,date_suivi:v.date_suivi,taux_physique:v.taux_physique??null,credits_consommes:v.credits_consommes??null,etape:v.etape||null,statut_operationnel:v.statut_operationnel||null,date_blocage:v.date_blocage||null,motif_blocage:v.motif_blocage||null,action_corrective:v.action_corrective||null,date_reprise_prevue:v.date_reprise_prevue||null,observations:v.observations||null});
  const sets=['derniere_actualisation=@date_suivi','updated_at=CURRENT_TIMESTAMP']; const params={date_suivi:v.date_suivi,id:projectId};
  for(const k of ['taux_physique','credits_consommes','etape','statut_operationnel','date_blocage','motif_blocage','action_corrective','date_reprise_prevue','observations'])if(v[k]!==undefined&&v[k]!==null&&v[k]!==''){sets.push(`${k}=@${k}`);params[k]=v[k];}
  db.prepare(`UPDATE projects SET ${sets.join(',')} WHERE id=@id`).run(params);
 });tx();return getProject(projectId);
});
ipcMain.handle('backup:create',async()=>{const {filePath}=await dialog.showSaveDialog({defaultPath:`Project-Manager-backup-${new Date().toISOString().slice(0,10)}.sqlite`,filters:[{name:'SQLite',extensions:['sqlite']}]});if(!filePath)return null;await db.backup(filePath);return filePath;});
ipcMain.handle('backup:restore',async()=>{
 const {filePaths}=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'SQLite',extensions:['sqlite']}]});if(!filePaths.length)return false;
 const source=new Database(filePaths[0],{readonly:true});
 try{
  const srcTables=new Set(source.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name));
  const rows=source.prepare('SELECT * FROM projects').all(); const srcSettings=srcTables.has('settings')?source.prepare('SELECT * FROM settings').all():[];
  const srcHistory=srcTables.has('project_followups')?source.prepare('SELECT * FROM project_followups').all():[];
  const srcPayments=srcTables.has('project_payments')?source.prepare('SELECT * FROM project_payments').all():[];
  const tx=db.transaction(()=>{
   db.prepare('DELETE FROM project_payments').run();db.prepare('DELETE FROM project_followups').run();db.prepare('DELETE FROM projects').run();
   const cols=tableColumns('projects');const use=fields.filter(c=>cols.has(c)&&rows.length&&Object.hasOwn(rows[0],c));
   if(rows.length){const st=db.prepare(`INSERT INTO projects(id,${use.join(',')}) VALUES (@id,${use.map(x=>'@'+x).join(',')})`);rows.forEach(r=>{const o={id:r.id};use.forEach(c=>o[c]=r[c]??null);st.run(o);});}
   if(srcSettings.length){db.prepare('DELETE FROM settings').run();const ss=db.prepare('INSERT OR REPLACE INTO settings(key,value) VALUES (@key,@value)');srcSettings.forEach(x=>ss.run(x));}
   if(srcPayments.length){const ps=db.prepare('INSERT INTO project_payments(id,project_id,payment_date,amount,payment_reference,document_type,observation,created_at) VALUES (@id,@project_id,@payment_date,@amount,@payment_reference,@document_type,@observation,@created_at)');srcPayments.forEach(x=>ps.run(x));}
   if(srcHistory.length){const hs=db.prepare('INSERT INTO project_followups(id,project_id,date_suivi,taux_physique,credits_consommes,etape,statut_operationnel,date_blocage,motif_blocage,action_corrective,date_reprise_prevue,observations,created_at) VALUES (@id,@project_id,@date_suivi,@taux_physique,@credits_consommes,@etape,@statut_operationnel,@date_blocage,@motif_blocage,@action_corrective,@date_reprise_prevue,@observations,@created_at)');srcHistory.forEach(x=>hs.run(x));}
  });tx();return true;
 }finally{source.close();}
});
ipcMain.handle('excel:export',async()=>{const XLSX=require('xlsx');const {filePath}=await dialog.showSaveDialog({defaultPath:'Suivi_projets_Tataouine.xlsx',filters:[{name:'Classeur Excel',extensions:['xlsx']}]});if(!filePath)return null;const rows=db.prepare('SELECT * FROM projects ORDER BY annee DESC,id').all().map(derived);const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'tableau_suivi');const hist=db.prepare(`SELECT f.*,p.intitule AS projet FROM project_followups f JOIN projects p ON p.id=f.project_id ORDER BY f.date_suivi DESC`).all();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(hist),'historique_suivi');const pays=db.prepare('SELECT pay.*,p.intitule AS projet FROM project_payments pay JOIN projects p ON p.id=pay.project_id ORDER BY pay.payment_date').all();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(pays),'historique_paiements');XLSX.writeFile(wb,filePath);return filePath;});
ipcMain.handle('excel:import',async()=>{const XLSX=require('xlsx');const {filePaths}=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'Classeur Excel',extensions:['xlsx','xls']}]});if(!filePaths.length)return null;const wb=XLSX.readFile(filePaths[0]);const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:null});if(!rows.length)return {count:0};const aliases={type_procedure:['type_procedure','type de procédure'],date_reception_provisoire:['date_reception_provisoire','date réception provisoire'],duree_garantie_mois:['duree_garantie_mois','durée de garantie (mois)'],date_reception_definitive:['date_reception_definitive','date réception définitive'],date_reglement_definitif:['date_reglement_definitif','date du règlement définitif'],date_cloture:['date_cloture','date de clôture effective'],date_programmation:['date_programmation','date programmation'],statut_operationnel:['statut_operationnel','état opérationnel'],date_blocage:['date_blocage'],motif_blocage:['motif_blocage'],action_corrective:['action_corrective'],date_reprise_prevue:['date_reprise_prevue'],derniere_actualisation:['derniere_actualisation'],intitule:['intitule','projet','المشروع'],annee:['annee','année','سنة البرمجة'],commune:['commune','البلدية'],gouvernorat:['gouvernorat','ولاية','الولاية'],categorie:['categorie','نوع المشروع'],sous_categorie:['sous_categorie','النوع الفرعي للمشروع'],cout_initial:['cout_initial','coût initial'],cout_actualise:['cout_actualise','coût actualisé'],autofinancement:['autofinancement','تمويل ذاتي'],emprunt:['emprunt','قرض'],aide_exceptionnelle:['aide_exceptionnelle'],aide_non_affectee:['aide_non_affectee'],aide_affectee:['aide_affectee'],autres_sources:['autres_sources'],ressources_realisees:['ressources_realisees'],credits_consommes:['credits_consommes'],date_debut:['date_debut'],duree_mois:['duree_mois'],taux_physique:['taux_physique'],etape:['etape'],observations:['observations']};const normalized=rows.map(r=>{const o={};for(const [k,names] of Object.entries(aliases)){const key=Object.keys(r).find(x=>names.includes(x.trim().toLowerCase()));o[k]=key?r[key]:null;}return o;}).filter(r=>r.intitule);const tx=db.transaction(()=>{const st=db.prepare(`INSERT INTO projects (${fields.join(',')}) VALUES (${fields.map(x=>'@'+x).join(',')})`);normalized.forEach(r=>{const o={};fields.forEach(f=>o[f]=r[f]??null);st.run(o);});});tx();return {count:normalized.length};});
ipcMain.handle('settings:get',()=>getSettings());
ipcMain.handle('settings:save',(_,values)=>{const st=db.prepare('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');for(const k of ['seuil_demarrage_jours','seuil_inactivite_jours','seuil_echeance_jours']){const n=Math.max(1,Math.min(3650,Number(values[k])||1));st.run(k,String(n));}return getSettings();});
ipcMain.handle('report:print',()=>true);
ipcMain.handle('app:info',()=>({version:app.getVersion(),dataPath:path.join(app.getPath('appData'),'project-manager-tataouine-v1.3')}));
function automaticDailyBackup(){
 const dir=path.join(app.getPath('appData'),'project-manager-tataouine-v1.3','backups');
 fs.mkdirSync(dir,{recursive:true});
 const day=new Date().toISOString().slice(0,10);
 const target=path.join(dir,`auto-${day}.sqlite`);
 if(!fs.existsSync(target))db.backup(target).catch(err=>console.error('Backup automatique impossible:',err));
}
function createWindow(){const win=new BrowserWindow({width:1440,height:920,minWidth:1100,minHeight:700,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});win.loadFile(path.join(__dirname,'index.html'));}
app.whenReady().then(()=>{initDb();automaticDailyBackup();createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
