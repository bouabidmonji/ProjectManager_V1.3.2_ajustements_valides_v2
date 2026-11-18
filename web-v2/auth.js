'use strict';
const jwt=require('jsonwebtoken');
const secret=process.env.JWT_SECRET;
if(!secret||secret.length<32) throw new Error('JWT_SECRET doit contenir au moins 32 caracteres.');
function authRequired(req,res,next){
 const token=req.cookies.pm_session;
 if(!token)return res.status(401).json({error:'Authentification requise.'});
 try{req.user=jwt.verify(token,secret);next();}
 catch{res.clearCookie('pm_session');res.status(401).json({error:'Session invalide ou expiree.'});}
}
function allow(...roles){return(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({error:'Droits insuffisants.'});}
module.exports={authRequired,allow};
