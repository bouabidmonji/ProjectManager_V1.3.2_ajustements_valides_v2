'use strict';
require('dotenv').config();
const bcrypt=require('bcryptjs');
const {pool}=require('../db');
(async()=>{
 const {ADMIN_USERNAME,ADMIN_PASSWORD}=process.env;
 const name=process.env.ADMIN_NAME||'Administrateur';
 if(!ADMIN_USERNAME||!ADMIN_PASSWORD||ADMIN_PASSWORD.length<12)throw new Error('Definir ADMIN_USERNAME et ADMIN_PASSWORD (12 caracteres minimum).');
 const hash=await bcrypt.hash(ADMIN_PASSWORD,12);
 await pool.query("INSERT INTO app_users(username,display_name,password_hash,role) VALUES($1,$2,$3,'admin') ON CONFLICT(username) DO NOTHING",[ADMIN_USERNAME,name,hash]);
 console.log('Compte administrateur cree ou deja present.');await pool.end();
})().catch(e=>{console.error(e.message);process.exit(1);});
