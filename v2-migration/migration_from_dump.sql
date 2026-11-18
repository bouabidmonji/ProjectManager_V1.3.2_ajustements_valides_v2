-- Project Manager V2 - import des donnees du dump SQLite V1.3.2
-- Source: db/sqlite_dump.sql (dump fourni dans le depot)
-- A executer APRES schema.sql, sur une base V2 vide.
-- Ce script ne cree aucun suivi ni paiement absent du dump.
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM projects) THEN
    RAISE EXCEPTION 'Import interrompu : la table projects contient deja des donnees.';
  END IF;
END $$;

CREATE TEMP TABLE v1_projects_stage (
 id BIGINT, gouvernorat TEXT, commune TEXT, intitule TEXT NOT NULL,
 categorie TEXT, sous_categorie TEXT, annee INTEGER, cout_initial NUMERIC(18,3) DEFAULT 0, cout_actualise NUMERIC(18,3) DEFAULT 0,
 autofinancement NUMERIC(18,3) DEFAULT 0, emprunt NUMERIC(18,3), aide_exceptionnelle NUMERIC(18,3),
 aide_non_affectee NUMERIC(18,3), aide_affectee NUMERIC(18,3), autres_sources NUMERIC(18,3),
 ressources_realisees NUMERIC(18,3), credits_consommes NUMERIC(18,3), date_debut TEXT, duree_mois INTEGER,
 taux_physique NUMERIC(7,3), etape TEXT, statut_operationnel TEXT, date_programmation TEXT,
 date_blocage TEXT, motif_blocage TEXT, action_corrective TEXT, date_reprise_prevue TEXT, derniere_actualisation TEXT,
 observations TEXT, created_at TEXT, updated_at TEXT, type_procedure TEXT, date_reception_provisoire TEXT,
 duree_garantie_mois INTEGER DEFAULT 12, date_reception_definitive TEXT, date_reglement_definitif TEXT, date_cloture TEXT
) ON COMMIT DROP;

INSERT INTO v1_projects_stage VALUES(1,'تطاوين','تطاوين','بناء مجسمات','Embellissement','Monument',2026,500000,500000,500000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الإستشارة أو طلب عروض أو فرز العروض أو ابرام الصفقة','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (2,'تطاوين','تطاوين','تنوير عمومي','Infrastructure','eclairage_public',2026,450000,450000,NULL,450000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (3,'تطاوين','تطاوين','تعبيد الطرقات (تجديد)','Infrastructure','Routes',2026,780000,780000,130000,250000,400000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (4,'تطاوين','تطاوين','اقتناء معدات نطافة و طرقات','Materiels','Materiel_propreté',2026,450000,450000,450000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (5,'تطاوين','تطاوين','صيانة الطرقات','Infrastructure','Routes',2026,210000,210000,210000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (6,'تطاوين','تطاوين','إقتناء معدات نظافة و طرقات شاحنة 16 مكعب وشاحنة مجهظة بسلم','Materiels','Materiel_propreté',2025,700000,700000,700000,NULL,NULL,NULL,NULL,NULL,700000,700000,NULL,NULL,NULL,'في طور الإستشارة أو طلب عروض أو فرز العروض أو ابرام الصفقة','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,'في طور فرز العروض ','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (7,'تطاوين','تطاوين','أشغال الصيانة و التعهد الطرقات ','Infrastructure','Routes',2025,113000,113000,113000,NULL,NULL,NULL,NULL,NULL,113000,NULL,'2025-11-25',7,75,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (8,'تطاوين','تطاوين','تعبيد الطرقات','Infrastructure','Routes',2025,189000,189000,189000,NULL,NULL,NULL,NULL,NULL,189000,NULL,'2025-11-15',5,20,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (9,'تطاوين','تطاوين','تجهيزات إعلامية و كاميرا مراقبة','Materiels','Equipements_divers',2025,200000,170000,170000,NULL,NULL,NULL,NULL,NULL,170000,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
INSERT INTO v1_projects_stage VALUES(10,'تطاوين','تطاوين','تنوير عمومي بحي النصر من عمادة قطوفة','Infrastructure','eclairage_public',2025,89000,89000,89000,NULL,NULL,NULL,NULL,NULL,89000,NULL,'2026-04-27',3,NULL,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (11,NULL,NULL,'مد قنوات الماء الصالح للضرب لكل من قاعة الألعاب الفردية بالرقبة و والوحدة النموذجية لمعالجة النفايات','Infrastructure','Eau potable',2025,42000,42000,42000,0,0,0,0,0,42000,0,'',NULL,100,'تمّ الإنجاز','acheve','','','','','','','','2026-11-10 11:43:15','2026-11-17 15:21:56','marche','2025-09-10',12,'','',''),
  (12,'تطاوين','تطاوين','اقتناء معدات نظافة (شاحنة ضاغطة 16 م3)','Materiels','Materiel_propreté',2024,460000,460000,160000,300000,NULL,NULL,NULL,NULL,460000,NULL,'2025-12-26',6,NULL,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (13,'تطاوين','تطاوين','اقتناء عدد 2شاحنة قالبة و جرار','Materiels','Materiel_propreté',2024,323000,323000,73000,NULL,NULL,250000,NULL,NULL,323000,323000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (14,'تطاوين','تطاوين','مراجعة مثال التهيئة بمناطق التوسعة(السعادة-المزطورية-الزهرة)','Etudes','Etudes _PAU',2024,63000,63000,63000,NULL,NULL,NULL,NULL,NULL,63000,NULL,'2025-06-09',9,25,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (15,'تطاوين','تطاوين','صيانة الطرقات','Infrastructure','Routes',2024,50000,55000,55000,NULL,NULL,NULL,NULL,NULL,55000,55000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (16,'تطاوين','تطاوين','اشغال صيانة المنشات الرياضية(القاعة الرياضية بعباس-الملعب الفرعي بحي المهرجان)','Batiments','Equipemnts _sportifs',2024,35000,46000,46000,NULL,NULL,NULL,NULL,NULL,46000,46000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (17,'تطاوين','تطاوين','صيانة الااسواق البلدية (سوق الصناعات التقليدية-المسلخ البلدي-سوق الماشية)','Batiments','Batiments _economiques',2024,102000,89000,NULL,89000,NULL,NULL,NULL,NULL,89000,89000,NULL,NULL,NULL,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'القبول النهائي لاشغال المسلخ البلدي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
INSERT INTO v1_projects_stage VALUES(18,'تطاوين','تطاوين','ترصيف قرب المؤسسات الجامعية','Infrastructure','Routes',2024,91000,91000,91000,NULL,NULL,NULL,NULL,NULL,91000,89500,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (19,'تطاوين','تطاوين','تجديد شبكة التنوير العمومي بط,و 19 وط ج 121','Infrastructure','eclairage_public',2024,200000,212000,12000,200000,NULL,NULL,NULL,NULL,212000,210000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (20,'تطاوين','تطاوين','اقتناء تجهيزات صيانة العجلات وحواجز','Materiels','Equipements_divers',2023,18000,83000,83000,NULL,NULL,NULL,NULL,NULL,83000,83000,NULL,NULL,30,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'في طور تسلم المعدات','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (21,'تطاوين','تطاوين','اقتناء تجهيزات المسح الطوبوغرافي واجهزة تكييف  ','Materiels','Equipements_divers',2023,57000,57000,57000,NULL,NULL,NULL,NULL,NULL,57000,57000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (22,'تطاوين','تطاوين','تجديد،تمديد وتهذيب شبكة التنوير العمومي بطريق الرقبة-الطريق الرئيسة بالمزطورية-حسر برورمت- مفترق وادي الغار-جامع حي الجرف','Infrastructure','eclairage_public',2023,326000,326000,326000,NULL,NULL,NULL,NULL,NULL,326000,293400,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'القبول النهائي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (23,'تطاوين','تطاوين','مد شبكة التطهير (حي الموظفين-دي ابن سينا-غرغار-قصر المقابلة)','Infrastructure','Assainissement',2023,540000,540000,540000,NULL,NULL,NULL,NULL,NULL,540000,NULL,NULL,NULL,NULL,'في طور الإستشارة أو طلب عروض أو فرز العروض أو ابرام الصفقة','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,'تن الإعلان عن كلب العروض عدد 8 (فخر اجل لبول العروض  22/08/2025 )','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (24,'تطاوين','تطاوين','صيانة الطرقات ','Infrastructure','Routes',2023,50000,50000,50000,NULL,NULL,NULL,NULL,NULL,50000,50000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (25,'تطاوين','تطاوين','اقتناء فوانيس LED وتركيزها بالطرقات الرئيسية ','Infrastructure','eclairage_public',2023,100000,92000,92000,NULL,NULL,NULL,NULL,NULL,92000,92000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'القبول النهائي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
INSERT INTO v1_projects_stage VALUES(26,'تطاوين','تطاوين','تعبيد الطرقات بمناطق التوسعة','Infrastructure','Routes',2023,440000,542000,NULL,NULL,102000,NULL,440000,NULL,542000,270465,'2025-04-21',8,25,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,'انطلاق الاشغال 21/04/2025','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (27,'تطاوين','تطاوين','تجميل المدينة بمناطق التوسعة','Embellissement','Jardins_ publics',2023,85000,88500,3500,NULL,NULL,NULL,85000,NULL,88500,85000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,E'القبول النهائي\n','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (28,'تطاوين','تطاوين','تنوير عمومي (مناطق التوسعة)','Infrastructure','eclairage_public',2023,525000,525000,NULL,NULL,NULL,NULL,525000,NULL,525000,472500,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (29,'تطاوين','تطاوين','تعبيد الطرقات','Infrastructure','Routes',2022,800000,777761,277761,500000,NULL,NULL,NULL,NULL,777761,777761,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (30,'تطاوين','تطاوين','صيانة الطرقات','Infrastructure','Routes',2022,97300,97300,50000,NULL,NULL,47300,NULL,NULL,97300,97300,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (31,'تطاوين','تطاوين','الماء الصالح للشراب','Infrastructure','Eau potable',2022,49000,49190,49190,NULL,NULL,NULL,NULL,NULL,49190,49190,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'لم نتوصل بوثائق الخلاص من الركة الوطنية لاستغلال و توزيع المياه','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (32,'تطاوين','تطاوين','صيانة الحدائق','Embellissement','Jardins_ publics',2022,320000,215997,37597,100000,NULL,78400,NULL,NULL,215997,187000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'في انتظار الختم النّهائي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (33,'تطاوين','تطاوين','دراسات','Etudes','Etudes _Embellissements',2022,50080,50080,50080,NULL,NULL,NULL,NULL,NULL,50080,28272,NULL,NULL,53,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (34,'تطاوين','تطاوين','تهيئة دائرة بلدية بالمزطورية','Batiments','Batiments_ administratifs',2022,263715,192988,192988,NULL,NULL,NULL,NULL,NULL,192988,192988,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'مشروع منتهي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
INSERT INTO v1_projects_stage VALUES(35,'تطاوين','تطاوين','تهيئة مصب الفضلات','Divers','entretein_decharge',2022,140000,136000,136000,NULL,NULL,NULL,NULL,NULL,136000,136000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'مشروع منتهي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (36,'تطاوين','تطاوين','اقتناء شاحنة قالبة 3,5 طن','Materiels','Materiel_propreté',2022,94000,94000,14000,NULL,NULL,NULL,NULL,80000,94000,94000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (37,'تطاوين','تطاوين','تجهيزات  إدارية و إعلامية','Materiels','Equipements_divers',2022,50136,49000,49000,NULL,NULL,NULL,NULL,NULL,49000,49000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'مشروع منتهي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);

CREATE TEMP TABLE v1_settings_stage (key TEXT PRIMARY KEY, value TEXT NOT NULL) ON COMMIT DROP;
INSERT INTO v1_settings_stage VALUES
 ('seuil_demarrage_jours','90'),
 ('seuil_inactivite_jours','30'),
 ('seuil_echeance_jours','30');

INSERT INTO projects (
 id, project_code, legacy_id, legacy_version, title, governorate, municipality,
 category, subcategory, initial_programming_year, current_programming_year,
 initial_cost, updated_cost, self_funding, loan, exceptional_aid, unassigned_aid,
 assigned_aid, other_funding, realized_resources, legacy_consumed_credits,
 physical_progress, operational_status, current_stage, programming_date, start_date,
 duration_months, blocked_date, blockage_reason, corrective_action, planned_resumption_date,
 last_update_date, procedure_type, provisional_reception_date, warranty_months,
 definitive_reception_date, final_payment_date, closure_date, observations,
 legacy_payload, created_at, updated_at
)
SELECT
 s.id,
 'PM-' || LPAD(COALESCE(s.annee, EXTRACT(YEAR FROM NULLIF(s.created_at,'')::timestamp)::int, 0)::text,4,'0')
   || '-' || LPAD(ROW_NUMBER() OVER (
      PARTITION BY COALESCE(s.annee, EXTRACT(YEAR FROM NULLIF(s.created_at,'')::timestamp)::int, 0)
      ORDER BY s.id
   )::text,4,'0'),
 s.id, '1.3.2', s.intitule, s.gouvernorat, s.commune,
 s.categorie, s.sous_categorie, s.annee, s.annee,
 COALESCE(s.cout_initial,0), COALESCE(s.cout_actualise,0), COALESCE(s.autofinancement,0),
 COALESCE(s.emprunt,0), COALESCE(s.aide_exceptionnelle,0), COALESCE(s.aide_non_affectee,0),
 COALESCE(s.aide_affectee,0), COALESCE(s.autres_sources,0), COALESCE(s.ressources_realisees,0),
 COALESCE(s.credits_consommes,0), COALESCE(s.taux_physique,0),
 CASE LOWER(COALESCE(s.statut_operationnel,'')) 
   WHEN 'en_cours' THEN 'in_progress'
   WHEN 'suspendu' THEN 'blocked'
   WHEN 'acheve' THEN 'completed'
   WHEN 'annule' THEN 'cancelled'
   ELSE 'not_started' END,
 s.etape, NULLIF(s.date_programmation,'')::date, NULLIF(s.date_debut,'')::date,
 s.duree_mois, NULLIF(s.date_blocage,'')::date, s.motif_blocage, s.action_corrective,
 NULLIF(s.date_reprise_prevue,'')::date, NULLIF(s.derniere_actualisation,'')::date,
 s.type_procedure, NULLIF(s.date_reception_provisoire,'')::date, s.duree_garantie_mois,
 NULLIF(s.date_reception_definitive,'')::date, NULLIF(s.date_reglement_definitif,'')::date,
 NULLIF(s.date_cloture,'')::date, s.observations, to_jsonb(s),
 NULLIF(s.created_at,'')::timestamp, NULLIF(s.updated_at,'')::timestamp
FROM v1_projects_stage s
ORDER BY s.id;

INSERT INTO app_settings(key,value,legacy_payload)
SELECT key,value,jsonb_build_object('key',key,'value',value) FROM v1_settings_stage;

-- Le dump fourni ne contient aucune ligne INSERT pour ces deux tables.
-- Elles restent donc vides, sans date ni montant inventé.
SELECT setval(pg_get_serial_sequence('projects','id'), COALESCE((SELECT MAX(id) FROM projects),1), true);

INSERT INTO migration_runs (
 source_name, completed_at, source_projects, source_followups, source_payments,
 imported_projects, imported_followups, imported_payments, status, details
)
SELECT
 'db/sqlite_dump.sql', now(), (SELECT COUNT(*) FROM v1_projects_stage), 0, 0,
 (SELECT COUNT(*) FROM projects), 0, 0, 'completed',
 jsonb_build_object(
   'source','SQLite V1.3.2 SQL dump',
   'settings',(SELECT COUNT(*) FROM v1_settings_stage),
   'legacy_ids_preserved',true,
   'followups_present_in_dump',false,
   'payments_present_in_dump',false
 );

DO $$
DECLARE n INTEGER;
BEGIN
 SELECT COUNT(*) INTO n FROM projects;
 IF n <> 37 THEN RAISE EXCEPTION 'Controle echoue : 37 projets attendus, % importes.', n; END IF;
END $$;

COMMIT;

-- Controle apres execution :
-- SELECT COUNT(*) FROM projects;          -- attendu : 37
-- SELECT COUNT(*) FROM project_followups; -- attendu : 0 (aucune ligne dans le dump)
-- SELECT COUNT(*) FROM project_payments;  -- attendu : 0 (aucune ligne dans le dump)
-- SELECT key,value FROM app_settings ORDER BY key;
-- SELECT legacy_id,project_code,title FROM projects ORDER BY legacy_id;
