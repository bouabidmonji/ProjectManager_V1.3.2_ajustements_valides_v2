'use strict';
const {Pool}=require('pg');
if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL est obligatoire.');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.PG_POOL_MAX||10),ssl:process.env.PGSSL==='require'?{rejectUnauthorized:true}:false});
pool.on('error',e=>console.error('PostgreSQL:',e.message));
module.exports={pool};
