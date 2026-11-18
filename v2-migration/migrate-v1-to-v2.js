'use strict';
// One-time, non-destructive V1.3.2 SQLite -> V2 PostgreSQL importer.
// Node.js 22+. Required packages: better-sqlite3, pg.
const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const { Client } = require('pg');

const sourcePath = process.env.SOURCE_SQLITE || process.argv[2];
const databaseUrl = process.env.DATABASE_URL;
if (!sourcePath || !databaseUrl) {
  console.error('Usage: set SOURCE_SQLITE=... and DATABASE_URL=... then run node migrate-v1-to-v2.js');
  process.exit(2);
}
if (!fs.existsSync(sourcePath)) {
  console.error('SQLite source file not found:', sourcePath);
  process.exit(2);
}

const asText = v => v === undefined || v === null || v === '' ? null : String(v);
const asNumber = v => v === undefined || v === null || v === '' || !Number.isFinite(Number(v)) ? 0 : Number(v);
const asNullableNumber = v => v === undefined || v === null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v);
const asDate = v => {
  if (!v) return null;
  const s = String(v).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
};
const asTimestamp = v => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
const statusMap = v => {
  const s = String(v || '').trim().toLowerCase();
  if (['acheve','completed','تمّ الإنجاز'].includes(s)) return 'completed';
  if (['annule','cancelled','canceled','مشروع ملغى'].includes(s)) return 'cancelled';
  if (['suspendu','bloque','blocked','مشروع معطل'].includes(s)) return 'blocked';
  if (['en_cours','in_progress','في طور الإنجاز'].includes(s)) return 'in_progress';
  return 'not_started';
};
const json = row => JSON.stringify(row);
const hasTable = (db, name) => !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name);
const rowsFrom = (db, name) => hasTable(db, name) ? db.prepare('SELECT * FROM "' + name + '" ORDER BY id').all() : [];

async function main() {
  const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
  const client = new Client({ connectionString: databaseUrl, ssl: process.env.PGSSL === 'disable' ? false : undefined });
  try {
    const integrity = source.pragma('quick_check');
    if (!integrity.length || integrity[0].quick_check !== 'ok') {
      throw new Error('SQLite integrity check failed: ' + JSON.stringify(integrity));
    }
    if (!hasTable(source, 'projects')) throw new Error('Source SQLite has no projects table.');
    const projects = rowsFrom(source, 'projects');
    const followups = rowsFrom(source, 'project_followups');
    const payments = rowsFrom(source, 'project_payments');
    const settings = rowsFrom(source, 'settings');
    if (!projects.length) throw new Error('No projects found in source SQLite; import cancelled.');
    await client.connect();
    await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    const existing = await client.query('SELECT COUNT(*)::int AS n FROM projects');
    if (existing.rows[0].n !== 0) {
      throw new Error('Target V2 database already contains projects. Import is stopped to prevent duplicates or overwriting.');
    }

    await client.query('BEGIN');
    try {
      const idMap = new Map();
      const sequences = new Map();
      const ordered = [...projects].sort((a,b) => Number(a.id)-Number(b.id));
      for (const p of ordered) {
        const legacyId = Number(p.id);
        if (!Number.isInteger(legacyId)) throw new Error('Invalid legacy project ID: ' + p.id);
        const yearValue = Number(p.annee) || Number((asDate(p.date_programmation) || String(p.created_at || '')).slice(0,4)) || 0;
        const year = yearValue > 0 ? yearValue : 0;
        const seq = (sequences.get(year) || 0) + 1;
        sequences.set(year, seq);
        const code = 'PM-' + String(year).padStart(4,'0') + '-' + String(seq).padStart(4,'0');
        const fields = [
          'project_code','legacy_id','title','governorate','municipality','category','subcategory',
          'initial_programming_year','current_programming_year','initial_cost','updated_cost','self_funding',
          'loan','exceptional_aid','unassigned_aid','assigned_aid','other_funding','realized_resources',
          'legacy_consumed_credits','physical_progress','operational_status','current_stage','programming_date',
          'start_date','duration_months','blocked_date','blockage_reason','corrective_action',
          'planned_resumption_date','last_update_date','procedure_type','provisional_reception_date',
          'warranty_months','definitive_reception_date','final_payment_date','closure_date','observations',
          'legacy_payload','created_at','updated_at'
        ];
        const vals = [
          code,legacyId,asText(p.intitule) || ('Projet legacy ' + legacyId),asText(p.gouvernorat),asText(p.commune),
          asText(p.categorie),asText(p.sous_categorie),year || null,year || null,asNumber(p.cout_initial),
          asNumber(p.cout_actualise),asNumber(p.autofinancement),asNumber(p.emprunt),asNumber(p.aide_exceptionnelle),
          asNumber(p.aide_non_affectee),asNumber(p.aide_affectee),asNumber(p.autres_sources),
          asNumber(p.ressources_realisees),asNumber(p.credits_consommes),asNumber(p.taux_physique),
          statusMap(p.statut_operationnel || p.etape),asText(p.etape),asDate(p.date_programmation),asDate(p.date_debut),
          asNullableNumber(p.duree_mois),asDate(p.date_blocage),asText(p.motif_blocage),asText(p.action_corrective),
          asDate(p.date_reprise_prevue),asDate(p.derniere_actualisation),asText(p.type_procedure),
          asDate(p.date_reception_provisoire),asNullableNumber(p.duree_garantie_mois),
          asDate(p.date_reception_definitive),asDate(p.date_reglement_definitif),asDate(p.date_cloture),
          asText(p.observations),json(p),asTimestamp(p.created_at),asTimestamp(p.updated_at)
        ];
        const placeholders = vals.map((_,i) => '$' + (i+1)).join(',');
        const inserted = await client.query(
          'INSERT INTO projects (' + fields.join(',') + ') VALUES (' + placeholders + ') RETURNING id',
          vals
        );
        idMap.set(legacyId, inserted.rows[0].id);
      }

      let importedFollowups = 0;
      for (const f of followups) {
        const projectId = idMap.get(Number(f.project_id));
        if (!projectId) throw new Error('Follow-up ' + f.id + ' references missing project ' + f.project_id);
        if (!asDate(f.date_suivi)) throw new Error('Follow-up ' + f.id + ' has no valid date_suivi; import stopped to avoid inventing a date.');
        await client.query(
          `INSERT INTO project_followups
          (legacy_id,project_id,legacy_project_id,followup_date,physical_progress,consumed_credits,current_stage,
           operational_status,blocked_date,blockage_reason,corrective_action,planned_resumption_date,observations,
           legacy_payload,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [f.id,projectId,f.project_id,asDate(f.date_suivi),
           asNullableNumber(f.taux_physique),asNullableNumber(f.credits_consommes),asText(f.etape),
           f.statut_operationnel ? statusMap(f.statut_operationnel) : null,asDate(f.date_blocage),
           asText(f.motif_blocage),asText(f.action_corrective),asDate(f.date_reprise_prevue),
           asText(f.observations),json(f),asTimestamp(f.created_at)]
        );
        importedFollowups++;
      }

      let importedPayments = 0;
      for (const p of payments) {
        const projectId = idMap.get(Number(p.project_id));
        if (!projectId) throw new Error('Payment ' + p.id + ' references missing project ' + p.project_id);
        if (!asDate(p.payment_date)) throw new Error('Payment ' + p.id + ' has no valid payment_date; import stopped to avoid inventing a date.');
        await client.query(
          `INSERT INTO project_payments
          (legacy_id,project_id,legacy_project_id,payment_date,amount,payment_reference,document_type,observation,
           legacy_payload,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [p.id,projectId,p.project_id,asDate(p.payment_date),
           Math.max(0,asNumber(p.amount)),asText(p.payment_reference),asText(p.document_type),
           asText(p.observation),json(p),asTimestamp(p.created_at)]
        );
        importedPayments++;
      }

      for (const s of settings) {
        await client.query(
          'INSERT INTO app_settings(key,value,legacy_payload) VALUES($1,$2,$3) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, legacy_payload=EXCLUDED.legacy_payload',
          [String(s.key),String(s.value),json(s)]
        );
      }

      const check = await client.query(`
        SELECT
          (SELECT COUNT(*)::int FROM projects) AS projects,
          (SELECT COUNT(*)::int FROM project_followups) AS followups,
          (SELECT COUNT(*)::int FROM project_payments) AS payments
      `);
      const totals = check.rows[0];
      if (totals.projects !== projects.length || totals.followups !== importedFollowups || totals.payments !== importedPayments) {
        throw new Error('Post-import count mismatch: ' + JSON.stringify(totals));
      }
      await client.query(
        `INSERT INTO migration_runs
        (source_name,completed_at,source_projects,source_followups,source_payments,
         imported_projects,imported_followups,imported_payments,status,details)
        VALUES($1,now(),$2,$3,$4,$2,$3,$4,'completed',$5)`,
        [path.basename(sourcePath),projects.length,followups.length,payments.length,
         JSON.stringify({sqliteIntegrity:'ok',settings:settings.length,legacyIdsPreserved:true})]
      );
      await client.query('COMMIT');
      console.log(JSON.stringify({
        status:'completed',
        source:path.basename(sourcePath),
        sqliteIntegrity:'ok',
        projects:projects.length,
        followups:importedFollowups,
        payments:importedPayments,
        settings:settings.length,
        targetCounts:totals
      },null,2));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    source.close();
    await client.end().catch(() => {});
  }
}

main().catch(error => {
  console.error('MIGRATION FAILED:', error.message);
  process.exitCode = 1;
});
