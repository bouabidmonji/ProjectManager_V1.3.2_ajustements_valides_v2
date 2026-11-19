'use strict';
require('dotenv').config();
const express=require('express'),helmet=require('helmet'),cookieParser=require('cookie-parser');
const bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),path=require('node:path');
const {randomUUID}=require('node:crypto');
const {pool}=require('./db');
const {authRequired,allow}=require('./auth');
const app=express(),PORT=Number(process.env.PORT||3001),SECRET=process.env.JWT_SECRET;
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:'1mb'}));app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.get('/api/health',async(_req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected',version:'2.0.0'});}catch(e){res.status(503).json({status:'error',database:'unavailable',message:e.message});}});
app.post('/api/auth/login',async(req,res)=>{try{
 const username=String(req.body.username||'').trim(),password=String(req.body.password||'');
 const q=await pool.query('SELECT id,username,display_name,password_hash,role,is_active FROM app_users WHERE username=$1',[username]),u=q.rows[0];
 if(!u||!u.is_active||!(await bcrypt.compare(password,u.password_hash)))return res.status(401).json({error:'Identifiants incorrects.'});
 const token=jwt.sign({id:u.id,username:u.username,name:u.display_name,role:u.role},SECRET,{expiresIn:'8h'});
 res.cookie('pm_session',token,{httpOnly:true,sameSite:'strict',secure:process.env.COOKIE_SECURE==='true',maxAge:28800000,path:'/'});
 res.json({user:{id:u.id,username:u.username,name:u.display_name,role:u.role}});
 }catch(e){console.error(e);res.status(500).json({error:'Erreur serveur.'});}});
app.post('/api/auth/logout',(req,res)=>{res.clearCookie('pm_session',{httpOnly:true,sameSite:'strict',path:'/'});res.json({ok:true});});
app.get('/api/auth/me',authRequired,(req,res)=>res.json({user:req.user}));
app.get('/api/dashboard',authRequired,async(_req,res)=>{try{
 const q=await pool.query(`SELECT p.id,p.project_code,p.title,p.initial_programming_year,p.current_programming_year,p.category,p.subcategory,
 p.initial_cost,p.updated_cost,p.self_funding,p.loan,p.exceptional_aid,p.unassigned_aid,p.assigned_aid,p.other_funding,
 p.realized_resources,COALESCE(pay.paid_total,p.legacy_consumed_credits,0)::numeric consumed_credits,
 p.physical_progress,p.operational_status,p.current_stage,p.programming_date,p.start_date,p.duration_months,
 p.blocked_date,p.blockage_reason,p.corrective_action,p.planned_resumption_date,p.last_update_date,
 COALESCE(p.procedure_type,p.legacy_payload->>'type_procedure') procedure_type,
 COALESCE(p.provisional_reception_date,NULLIF(p.legacy_payload->>'date_reception_provisoire','')::date) provisional_reception_date,
 COALESCE(p.warranty_months,NULLIF(p.legacy_payload->>'duree_garantie_mois','')::int) warranty_months,
 COALESCE(p.definitive_reception_date,NULLIF(p.legacy_payload->>'date_reception_definitive','')::date) definitive_reception_date,
 COALESCE(p.final_payment_date,NULLIF(p.legacy_payload->>'date_reglement_definitif','')::date) final_payment_date,
 COALESCE(p.closure_date,NULLIF(p.legacy_payload->>'date_cloture','')::date) closure_date,
 COALESCE(f.last_followup_date,p.last_update_date) last_followup_date
 FROM projects p
 LEFT JOIN LATERAL (SELECT SUM(amount) paid_total FROM project_payments WHERE project_id=p.id) pay ON TRUE
 LEFT JOIN LATERAL (SELECT MAX(followup_date) last_followup_date FROM project_followups WHERE project_id=p.id) f ON TRUE
 ORDER BY p.initial_programming_year NULLS LAST,p.project_code`);
 const items=q.rows.map(p=>{const paid=Number(p.consumed_credits||0),cost=Number(p.updated_cost||0),done=p.operational_status==='completed',closed=!!p.closure_date&&!!p.final_payment_date;
 const provisional=done&&!closed?cost-paid:0,final=done&&closed?Number(p.realized_resources||0)-paid:0;
 return {...p,provisional_balance:provisional,final_residual:final,financially_closed:closed};});
 const total=items.length,sum=k=>items.reduce((a,p)=>a+Number(p[k]||0),0);
 res.json({items,summary:{total,completed:items.filter(p=>p.operational_status==='completed').length,blocked:items.filter(p=>p.operational_status==='blocked').length,updated_budget:sum('updated_cost'),consumed_credits:sum('consumed_credits'),realized_resources:sum('realized_resources'),provisional_balance:sum('provisional_balance'),final_residual:sum('final_residual')}});
 }catch(e){console.error(e);res.status(500).json({error:'Impossible de charger le tableau de bord.'});}});
app.get('/api/projects',authRequired,async(req,res)=>{try{
 const search=String(req.query.search||'').trim(),year=req.query.year?Number(req.query.year):null,status=String(req.query.status||''),category=String(req.query.category||''),vals=[],w=[];
 if(search){vals.push('%'+search+'%');w.push("(title ILIKE $"+vals.length+" OR project_code ILIKE $"+vals.length+" OR COALESCE(category,'') ILIKE $"+vals.length+")");}
 if(year&&Number.isInteger(year)){vals.push(year);w.push('initial_programming_year=$'+vals.length);}
 if(status){vals.push(status);w.push('operational_status=$'+vals.length);}
 if(category){vals.push(category);w.push('category=$'+vals.length);}
 const q=await pool.query('SELECT id,project_code,title,initial_programming_year,category,updated_cost,legacy_consumed_credits,physical_progress,operational_status,current_stage FROM projects '+(w.length?'WHERE '+w.join(' AND '):'')+' ORDER BY initial_programming_year DESC NULLS LAST,id DESC LIMIT 1000',vals);
 res.json({items:q.rows});
 }catch(e){console.error(e);res.status(500).json({error:'Impossible de charger les projets.'});}});
app.get('/api/assignees',authRequired,async(_req,res)=>{const q=await pool.query("SELECT id,display_name,role FROM app_users WHERE is_active=TRUE ORDER BY display_name");res.json({items:q.rows});});
app.get('/api/projects/:id',authRequired,async(req,res)=>{try{
 const q=await pool.query('SELECT * FROM projects WHERE id::text=$1 OR project_code=$1',[req.params.id]);if(!q.rowCount)return res.status(404).json({error:'Projet introuvable.'});
 const p=q.rows[0];
 const [r,h,payments,followups]=await Promise.all([
  pool.query("SELECT pr.id,pr.responsibility_role,pr.user_id,u.display_name,u.username,pr.assigned_at FROM project_responsibilities pr JOIN app_users u ON u.id=pr.user_id WHERE pr.project_id=$1 AND pr.active=TRUE ORDER BY CASE pr.responsibility_role WHEN 'principal' THEN 0 ELSE 1 END,pr.responsibility_role,u.display_name",[p.id]),
  pool.query("SELECT h.id,h.event_type,h.summary,h.before_data,h.after_data,h.created_at,u.display_name FROM project_history h LEFT JOIN app_users u ON u.id=h.user_id WHERE h.project_id=$1 ORDER BY h.created_at DESC LIMIT 100",[p.id]),
  pool.query("SELECT id,payment_date,amount,payment_reference,document_type,observation FROM project_payments WHERE project_id=$1 ORDER BY payment_date DESC,id DESC",[p.id]),
  pool.query("SELECT id,followup_date,physical_progress,consumed_credits,current_stage,operational_status,blocked_date,blockage_reason,corrective_action,planned_resumption_date,observations FROM project_followups WHERE project_id=$1 ORDER BY followup_date DESC,id DESC",[p.id])
 ]);
 res.json({...p,responsibilities:r.rows,history:h.rows,payments:payments.rows,followups:followups.rows,payments_total:payments.rows.reduce((a,x)=>a+Number(x.amount||0),0),has_payment_history:payments.rowCount>0});
 }catch(e){console.error(e);res.status(500).json({error:'Impossible de charger la fiche projet.'});}});
app.put('/api/projects/:id/responsibilities',authRequired,allow('admin'),async(req,res)=>{const b=req.body||{},role=b.role,userId=Number(b.user_id);if(!['principal','technical','finance','procurement','gis'].includes(role)||!Number.isInteger(userId))return res.status(400).json({error:'Affectation invalide.'});const c=await pool.connect();try{
 await c.query('BEGIN');const p=await c.query('SELECT id FROM projects WHERE id=$1',[req.params.id]);if(!p.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Projet introuvable.'});}
 const u=await c.query('SELECT id FROM app_users WHERE id=$1 AND is_active=TRUE',[userId]);if(!u.rowCount){await c.query('ROLLBACK');return res.status(400).json({error:'Utilisateur absent ou inactif.'});}
 const prior=await c.query('SELECT user_id FROM project_responsibilities WHERE project_id=$1 AND responsibility_role=$2 AND active=TRUE',[p.rows[0].id,role]);
 await c.query('UPDATE project_responsibilities SET active=FALSE,ended_at=now() WHERE project_id=$1 AND responsibility_role=$2 AND active=TRUE',[p.rows[0].id,role]);
 await c.query('INSERT INTO project_responsibilities(project_id,user_id,responsibility_role,assigned_by) VALUES($1,$2,$3,$4)',[p.rows[0].id,userId,role,req.user.id]);
 await c.query("INSERT INTO project_history(project_id,user_id,event_type,summary,before_data,after_data) VALUES($1,$2,'responsibility_changed',$3,$4,$5)",[p.rows[0].id,req.user.id,'Affectation '+role+' modifiée',JSON.stringify({user_id:prior.rows[0]?.user_id||null}),JSON.stringify({user_id:userId,role})]);
 await c.query('COMMIT');res.json({ok:true});
 }catch(e){await c.query('ROLLBACK');console.error(e);res.status(500).json({error:'Impossible de modifier les responsabilités.'});}finally{c.release();}});
app.post('/api/projects',authRequired,allow('admin'),async(req,res)=>{const b=req.body||{};if(!String(b.title||'').trim())return res.status(400).json({error:'L’intitulé est obligatoire.'});if(!Number.isInteger(Number(b.principal_user_id)))return res.status(400).json({error:'Un responsable principal est obligatoire.'});const c=await pool.connect();try{
 await c.query('BEGIN');const temp='PENDING-'+randomUUID(),year=Number(b.year)||new Date().getFullYear();
 await c.query("SELECT pg_advisory_xact_lock(hashtext('pm-project-code-' || $1::text))",[year]);
 const seq=await c.query("SELECT COALESCE(MAX(RIGHT(project_code,4)::int),0)+1 AS n FROM projects WHERE project_code LIKE $1",['PM-'+year+'-%']);
 const q=await c.query("INSERT INTO projects(project_code,title,initial_programming_year,current_programming_year,category,subcategory,updated_cost,operational_status,current_stage,observations) VALUES($1,$2,$3,$3,$4,$5,$6,$7,$8,$9) RETURNING id",[temp,String(b.title).trim(),year,b.category||null,b.subcategory||null,Number(b.updated_cost)||0,b.status||'not_started',b.stage||null,b.observations||null]);
 const id=q.rows[0].id,code='PM-'+String(year).padStart(4,'0')+'-'+String(seq.rows[0].n).padStart(4,'0');
 await c.query('UPDATE projects SET project_code=$1 WHERE id=$2',[code,id]);
 const principal=await c.query('SELECT id FROM app_users WHERE id=$1 AND is_active=TRUE',[Number(b.principal_user_id)]);if(!principal.rowCount)throw new Error('Le responsable principal est introuvable ou inactif.');
 await c.query("INSERT INTO project_responsibilities(project_id,user_id,responsibility_role,assigned_by) VALUES($1,$2,'principal',$3)",[id,Number(b.principal_user_id),req.user.id]);
 await c.query("INSERT INTO project_history(project_id,user_id,event_type,summary,after_data) VALUES($1,$2,'created','Création du projet',$3)",[id,req.user.id,JSON.stringify({project_code:code,title:String(b.title).trim()})]);
 await c.query("INSERT INTO audit_logs(user_id,action,entity_type,entity_id,details) VALUES($1,'create','project',$2,$3)",[req.user.id,String(id),JSON.stringify({project_code:code})]);
 await c.query('COMMIT');res.status(201).json({id,project_code:code});
 }catch(e){await c.query('ROLLBACK');console.error(e);res.status(500).json({error:'Création impossible.'});}finally{c.release();}});
app.put('/api/projects/:id',authRequired,async(req,res)=>{const b=req.body||{},role=req.user.role;
 const technical=['physical_progress','operational_status','current_stage','programming_date','start_date','duration_months','blocked_date','blockage_reason','corrective_action','planned_resumption_date','last_update_date','provisional_reception_date','warranty_months','definitive_reception_date','procedure_type'];
 const finance=['updated_cost','self_funding','loan','exceptional_aid','unassigned_aid','assigned_aid','other_funding','realized_resources','final_payment_date','closure_date'];
 const allowed=role==='admin'?[...technical,...finance,'title','category','procedure_type']:role==='technical'?technical:role==='finance'?finance:[];
 if(!allowed.length)return res.status(403).json({error:'Profil en lecture seule.'});
 const keys=Object.keys(b);const denied=keys.filter(k=>!allowed.includes(k));
 if(denied.length)return res.status(403).json({error:'Votre profil ne peut pas modifier : '+denied.join(', ')});
 const fields=keys.filter(k=>allowed.includes(k));if(!fields.length)return res.status(400).json({error:'Aucune donnée modifiable transmise.'});
 const c=await pool.connect();try{await c.query('BEGIN');
 const before=await c.query('SELECT * FROM projects WHERE id=$1 FOR UPDATE',[req.params.id]);if(!before.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Projet introuvable.'});}
 const sets=[],vals=[];for(const key of fields){vals.push(b[key]);sets.push(key+'=$'+vals.length);}
 vals.push(req.params.id);
 const q=await c.query('UPDATE projects SET '+sets.join(',')+',updated_at=now() WHERE id=$'+vals.length+' RETURNING *',vals);
 await c.query("INSERT INTO project_history(project_id,user_id,event_type,summary,before_data,after_data) VALUES($1,$2,'project_updated',$3,$4,$5)",[req.params.id,req.user.id,'Modification par profil '+role,JSON.stringify(before.rows[0]),JSON.stringify(q.rows[0])]);
 await c.query("INSERT INTO audit_logs(user_id,action,entity_type,entity_id,details) VALUES($1,'update','project',$2,$3)",[req.user.id,String(req.params.id),JSON.stringify({role,fields})]);
 await c.query('COMMIT');res.json(q.rows[0]);
 }catch(e){await c.query('ROLLBACK');console.error(e);res.status(500).json({error:'Modification impossible.'});}finally{c.release();}});
app.post('/api/projects/:id/followups',authRequired,allow('admin','technical'),async(req,res)=>{const b=req.body||{};if(!b.followup_date)return res.status(400).json({error:'La date du suivi est obligatoire.'});const c=await pool.connect();try{await c.query('BEGIN');const p=await c.query('SELECT id FROM projects WHERE id=$1 FOR UPDATE',[req.params.id]);if(!p.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Projet introuvable.'});}const q=await c.query('INSERT INTO project_followups(project_id,followup_date,physical_progress,consumed_credits,current_stage,operational_status,blocked_date,blockage_reason,corrective_action,planned_resumption_date,observations) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',[req.params.id,b.followup_date,b.physical_progress??null,b.consumed_credits??null,b.current_stage||null,b.operational_status||null,b.blocked_date||null,b.blockage_reason||null,b.corrective_action||null,b.planned_resumption_date||null,b.observations||null]);const fields=['physical_progress','current_stage','operational_status','blocked_date','blockage_reason','corrective_action','planned_resumption_date'];const vals=[],sets=[];for(const k of fields)if(b[k]!==undefined&&b[k]!==null&&b[k]!==''){vals.push(b[k]);sets.push(k+'=if(sets.length){vals.push(req.params.id);await c.query('UPDATE projects SET '+sets.join(',')+',last_update_date=$'+(vals.length+1)+',updated_at=now() WHERE id=$'+vals.length,[...vals,b.followup_date]);}await c.query("INSERT INTO project_history(project_id,user_id,event_type,summary,after_data) VALUES($1,$2,'followup_added','Suivi technique enregistré',$3)",[req.params.id,req.user.id,JSON.stringify(q.rows[0])]);await c.query('COMMIT');res.status(201).json(q.rows[0]);}catch(e){await c.query('ROLLBACK');console.error(e);res.status(500).json({error:'Enregistrement du suivi impossible.'});}finally{c.release();}});
app.post('/api/projects/:id/payments',authRequired,allow('admin','finance'),async(req,res)=>{const b=req.body||{},amount=Number(b.amount);if(!Number.isFinite(amount)||amount<=0||!b.payment_date)return res.status(400).json({error:'Date et montant positif obligatoires.'});const c=await pool.connect();try{await c.query('BEGIN');const p=await c.query('SELECT id FROM projects WHERE id=$1 FOR UPDATE',[req.params.id]);if(!p.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Projet introuvable.'});}const q=await c.query('INSERT INTO project_payments(project_id,payment_date,amount,payment_reference,document_type,observation) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[req.params.id,b.payment_date,amount,b.payment_reference||null,b.document_type||null,b.observation||null]);await c.query("INSERT INTO project_history(project_id,user_id,event_type,summary,after_data) VALUES($1,$2,'payment_added','Paiement enregistré',$3)",[req.params.id,req.user.id,JSON.stringify(q.rows[0])]);await c.query('COMMIT');res.status(201).json(q.rows[0]);}catch(e){await c.query('ROLLBACK');console.error(e);res.status(500).json({error:'Enregistrement du paiement impossible.'});}finally{c.release();}});
app.delete('/api/projects/:id/payments/:paymentId',authRequired,allow('admin','finance'),async(req,res)=>{try{const q=await pool.query('DELETE FROM project_payments WHERE id=$1 AND project_id=$2 RETURNING id',[req.params.paymentId,req.params.id]);if(!q.rowCount)return res.status(404).json({error:'Paiement introuvable.'});await pool.query("INSERT INTO project_history(project_id,user_id,event_type,summary,after_data) VALUES($1,$2,'payment_deleted','Paiement supprimé',$3)",[req.params.id,req.user.id,JSON.stringify({payment_id:req.params.paymentId})]);res.json({ok:true});}catch(e){console.error(e);res.status(500).json({error:'Suppression du paiement impossible.'});}});
app.get('/api/users',authRequired,allow('admin'),async(_req,res)=>{const q=await pool.query('SELECT id,username,display_name,role,is_active,created_at FROM app_users ORDER BY display_name');res.json({items:q.rows});});
app.post('/api/users',authRequired,allow('admin'),async(req,res)=>{const {username,display_name,password,role}=req.body||{};if(!username||!display_name||!password||!['admin','technical','finance','viewer'].includes(role)||String(password).length<12)return res.status(400).json({error:'Données invalides. Mot de passe : 12 caractères minimum.'});try{const hash=await bcrypt.hash(password,12);const q=await pool.query('INSERT INTO app_users(username,display_name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,username,display_name,role,is_active',[username,display_name,hash,role]);res.status(201).json(q.rows[0]);}catch(e){res.status(e.code==='23505'?409:500).json({error:e.code==='23505'?'Identifiant déjà utilisé.':'Création utilisateur impossible.'});}});
app.get('/api/audit',authRequired,allow('admin'),async(_req,res)=>{const q=await pool.query('SELECT a.*,u.display_name FROM audit_logs a LEFT JOIN app_users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 200');res.json({items:q.rows});});
app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,'0.0.0.0',()=>console.log('Project Manager V2 ecoute sur le port '+PORT));
+vals.length);}if(sets.length){vals.push(req.params.id);await c.query('UPDATE projects SET '+sets.join(',')+',last_update_date=$'+(vals.length+1)+',updated_at=now() WHERE id=$'+vals.length,[...vals,b.followup_date]);}await c.query("INSERT INTO project_history(project_id,user_id,event_type,summary,after_data) VALUES($1,$2,'followup_added','Suivi technique enregistré',$3)",[req.params.id,req.user.id,JSON.stringify(q.rows[0])]);await c.query('COMMIT');res.status(201).json(q.rows[0]);}catch(e){await c.query('ROLLBACK');console.error(e);res.status(500).json({error:'Enregistrement du suivi impossible.'});}finally{c.release();}});
app.post('/api/projects/:id/payments',authRequired,allow('admin','finance'),async(req,res)=>{const b=req.body||{},amount=Number(b.amount);if(!Number.isFinite(amount)||amount<=0||!b.payment_date)return res.status(400).json({error:'Date et montant positif obligatoires.'});const c=await pool.connect();try{await c.query('BEGIN');const p=await c.query('SELECT id FROM projects WHERE id=$1 FOR UPDATE',[req.params.id]);if(!p.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Projet introuvable.'});}const q=await c.query('INSERT INTO project_payments(project_id,payment_date,amount,payment_reference,document_type,observation) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[req.params.id,b.payment_date,amount,b.payment_reference||null,b.document_type||null,b.observation||null]);await c.query("INSERT INTO project_history(project_id,user_id,event_type,summary,after_data) VALUES($1,$2,'payment_added','Paiement enregistré',$3)",[req.params.id,req.user.id,JSON.stringify(q.rows[0])]);await c.query('COMMIT');res.status(201).json(q.rows[0]);}catch(e){await c.query('ROLLBACK');console.error(e);res.status(500).json({error:'Enregistrement du paiement impossible.'});}finally{c.release();}});
app.delete('/api/projects/:id/payments/:paymentId',authRequired,allow('admin','finance'),async(req,res)=>{try{const q=await pool.query('DELETE FROM project_payments WHERE id=$1 AND project_id=$2 RETURNING id',[req.params.paymentId,req.params.id]);if(!q.rowCount)return res.status(404).json({error:'Paiement introuvable.'});await pool.query("INSERT INTO project_history(project_id,user_id,event_type,summary,after_data) VALUES($1,$2,'payment_deleted','Paiement supprimé',$3)",[req.params.id,req.user.id,JSON.stringify({payment_id:req.params.paymentId})]);res.json({ok:true});}catch(e){console.error(e);res.status(500).json({error:'Suppression du paiement impossible.'});}});
app.get('/api/users',authRequired,allow('admin'),async(_req,res)=>{const q=await pool.query('SELECT id,username,display_name,role,is_active,created_at FROM app_users ORDER BY display_name');res.json({items:q.rows});});
app.post('/api/users',authRequired,allow('admin'),async(req,res)=>{const {username,display_name,password,role}=req.body||{};if(!username||!display_name||!password||!['admin','technical','finance','viewer'].includes(role)||String(password).length<12)return res.status(400).json({error:'Données invalides. Mot de passe : 12 caractères minimum.'});try{const hash=await bcrypt.hash(password,12);const q=await pool.query('INSERT INTO app_users(username,display_name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,username,display_name,role,is_active',[username,display_name,hash,role]);res.status(201).json(q.rows[0]);}catch(e){res.status(e.code==='23505'?409:500).json({error:e.code==='23505'?'Identifiant déjà utilisé.':'Création utilisateur impossible.'});}});
app.get('/api/audit',authRequired,allow('admin'),async(_req,res)=>{const q=await pool.query('SELECT a.*,u.display_name FROM audit_logs a LEFT JOIN app_users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 200');res.json({items:q.rows});});
app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,'0.0.0.0',()=>console.log('Project Manager V2 ecoute sur le port '+PORT));
