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
 const q=await pool.query("SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE p.operational_status='completed')::int completed,COUNT(*) FILTER(WHERE p.operational_status='in_progress')::int in_progress,COUNT(*) FILTER(WHERE p.operational_status='blocked')::int blocked,COALESCE(SUM(p.updated_cost),0)::numeric updated_budget,COALESCE(SUM(COALESCE(pay.paid_total,p.legacy_consumed_credits)),0)::numeric consumed_credits FROM projects p LEFT JOIN LATERAL (SELECT SUM(amount) AS paid_total FROM project_payments WHERE project_id=p.id) pay ON TRUE");
 res.json(q.rows[0]);
 }catch(e){console.error(e);res.status(500).json({error:'Impossible de charger le tableau de bord.'});}});
app.get('/api/projects',authRequired,async(req,res)=>{try{
 const search=String(req.query.search||'').trim(),year=req.query.year?Number(req.query.year):null,vals=[],w=[];
 if(search){vals.push('%'+search+'%');w.push("(title ILIKE $"+vals.length+" OR project_code ILIKE $"+vals.length+" OR COALESCE(category,'') ILIKE $"+vals.length+")");}
 if(year&&Number.isInteger(year)){vals.push(year);w.push('initial_programming_year=$'+vals.length);}
 const q=await pool.query('SELECT id,project_code,title,initial_programming_year,category,updated_cost,legacy_consumed_credits,physical_progress,operational_status,current_stage FROM projects '+(w.length?'WHERE '+w.join(' AND '):'')+' ORDER BY initial_programming_year DESC NULLS LAST,id DESC LIMIT 1000',vals);
 res.json({items:q.rows});
 }catch(e){console.error(e);res.status(500).json({error:'Impossible de charger les projets.'});}});
app.get('/api/projects/:id',authRequired,async(req,res)=>{const q=await pool.query('SELECT * FROM projects WHERE id::text=$1 OR project_code=$1',[req.params.id]);if(!q.rowCount)return res.status(404).json({error:'Projet introuvable.'});res.json(q.rows[0]);});
app.post('/api/projects',authRequired,allow('admin','agent'),async(req,res)=>{const b=req.body||{};if(!String(b.title||'').trim())return res.status(400).json({error:'L’intitulé est obligatoire.'});const c=await pool.connect();try{
 await c.query('BEGIN');const temp='PENDING-'+randomUUID(),year=Number(b.year)||new Date().getFullYear();
 await c.query("SELECT pg_advisory_xact_lock(hashtext('pm-project-code-' || $1::text))",[year]);
 const seq=await c.query("SELECT COALESCE(MAX(RIGHT(project_code,4)::int),0)+1 AS n FROM projects WHERE project_code LIKE $1",['PM-'+year+'-%']);
 const q=await c.query("INSERT INTO projects(project_code,title,initial_programming_year,current_programming_year,category,subcategory,updated_cost,operational_status,current_stage,observations) VALUES($1,$2,$3,$3,$4,$5,$6,$7,$8,$9) RETURNING id",[temp,String(b.title).trim(),year,b.category||null,b.subcategory||null,Number(b.updated_cost)||0,b.status||'not_started',b.stage||null,b.observations||null]);
 const id=q.rows[0].id,code='PM-'+String(year).padStart(4,'0')+'-'+String(seq.rows[0].n).padStart(4,'0');
 await c.query('UPDATE projects SET project_code=$1 WHERE id=$2',[code,id]);
 await c.query("INSERT INTO audit_logs(user_id,action,entity_type,entity_id,details) VALUES($1,'create','project',$2,$3)",[req.user.id,String(id),JSON.stringify({project_code:code})]);
 await c.query('COMMIT');res.status(201).json({id,project_code:code});
 }catch(e){await c.query('ROLLBACK');console.error(e);res.status(500).json({error:'Création impossible.'});}finally{c.release();}});
app.put('/api/projects/:id',authRequired,allow('admin','agent'),async(req,res)=>{const b=req.body||{};try{
 const q=await pool.query("UPDATE projects SET title=COALESCE($1,title),category=COALESCE($2,category),updated_cost=COALESCE($3,updated_cost),physical_progress=COALESCE($4,physical_progress),operational_status=COALESCE($5,operational_status),current_stage=COALESCE($6,current_stage),observations=COALESCE($7,observations),updated_at=now() WHERE id=$8 RETURNING id,project_code",[b.title??null,b.category??null,b.updated_cost==null?null:Number(b.updated_cost),b.physical_progress==null?null:Number(b.physical_progress),b.operational_status??null,b.current_stage??null,b.observations??null,req.params.id]);
 if(!q.rowCount)return res.status(404).json({error:'Projet introuvable.'});
 await pool.query("INSERT INTO audit_logs(user_id,action,entity_type,entity_id,details) VALUES($1,'update','project',$2,$3)",[req.user.id,String(req.params.id),JSON.stringify(b)]);
 res.json(q.rows[0]);
 }catch(e){console.error(e);res.status(500).json({error:'Modification impossible.'});}});
app.get('/api/users',authRequired,allow('admin'),async(_req,res)=>{const q=await pool.query('SELECT id,username,display_name,role,is_active,created_at FROM app_users ORDER BY display_name');res.json({items:q.rows});});
app.post('/api/users',authRequired,allow('admin'),async(req,res)=>{const {username,display_name,password,role}=req.body||{};if(!username||!display_name||!password||!['admin','agent','member','supervisor'].includes(role)||String(password).length<12)return res.status(400).json({error:'Données invalides. Mot de passe : 12 caractères minimum.'});try{const hash=await bcrypt.hash(password,12);const q=await pool.query('INSERT INTO app_users(username,display_name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,username,display_name,role,is_active',[username,display_name,hash,role]);res.status(201).json(q.rows[0]);}catch(e){res.status(e.code==='23505'?409:500).json({error:e.code==='23505'?'Identifiant déjà utilisé.':'Création utilisateur impossible.'});}});
app.get('/api/audit',authRequired,allow('admin'),async(_req,res)=>{const q=await pool.query('SELECT a.*,u.display_name FROM audit_logs a LEFT JOIN app_users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 200');res.json({items:q.rows});});
app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,'0.0.0.0',()=>console.log('Project Manager V2 ecoute sur le port '+PORT));
