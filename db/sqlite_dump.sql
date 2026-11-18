PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE projects (
 id INTEGER PRIMARY KEY AUTOINCREMENT, gouvernorat TEXT, commune TEXT, intitule TEXT NOT NULL,
 categorie TEXT, sous_categorie TEXT, annee INTEGER, cout_initial REAL DEFAULT 0, cout_actualise REAL DEFAULT 0,
 autofinancement REAL DEFAULT 0, emprunt REAL DEFAULT 0, aide_exceptionnelle REAL DEFAULT 0,
 aide_non_affectee REAL DEFAULT 0, aide_affectee REAL DEFAULT 0, autres_sources REAL DEFAULT 0,
 ressources_realisees REAL DEFAULT 0, credits_consommes REAL DEFAULT 0, date_debut TEXT, duree_mois INTEGER,
 taux_physique REAL DEFAULT 0, etape TEXT, statut_operationnel TEXT DEFAULT 'non_demarre', date_programmation TEXT,
 date_blocage TEXT, motif_blocage TEXT, action_corrective TEXT, date_reprise_prevue TEXT, derniere_actualisation TEXT,
 observations TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
 , type_procedure TEXT, date_reception_provisoire TEXT, duree_garantie_mois INTEGER DEFAULT 12, date_reception_definitive TEXT, date_reglement_definitif TEXT, date_cloture TEXT);
INSERT INTO projects VALUES(1,'تطاوين','تطاوين','بناء مجسمات','Embellissement','Monument',2026,500000,500000,500000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الإستشارة أو طلب عروض أو فرز العروض أو ابرام الصفقة','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (2,'تطاوين','تطاوين','تنوير عمومي','Infrastructure','eclairage_public',2026,450000,450000,NULL,450000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (3,'تطاوين','تطاوين','تعبيد الطرقات (تجديد)','Infrastructure','Routes',2026,780000,780000,130000,250000,400000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (4,'تطاوين','تطاوين','اقتناء معدات نطافة و طرقات','Materiels','Materiel_propreté',2026,450000,450000,450000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (5,'تطاوين','تطاوين','صيانة الطرقات','Infrastructure','Routes',2026,210000,210000,210000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (6,'تطاوين','تطاوين','إقتناء معدات نظافة و طرقات شاحنة 16 مكعب وشاحنة مجهظة بسلم','Materiels','Materiel_propreté',2025,700000,700000,700000,NULL,NULL,NULL,NULL,NULL,700000,700000,NULL,NULL,NULL,'في طور الإستشارة أو طلب عروض أو فرز العروض أو ابرام الصفقة','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,'في طور فرز العروض ','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (7,'تطاوين','تطاوين','أشغال الصيانة و التعهد الطرقات ','Infrastructure','Routes',2025,113000,113000,113000,NULL,NULL,NULL,NULL,NULL,113000,NULL,'2025-11-25',7,75,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (8,'تطاوين','تطاوين','تعبيد الطرقات','Infrastructure','Routes',2025,189000,189000,189000,NULL,NULL,NULL,NULL,NULL,189000,NULL,'2025-11-15',5,20,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (9,'تطاوين','تطاوين','تجهيزات إعلامية و كاميرا مراقبة','Materiels','Equipements_divers',2025,200000,170000,170000,NULL,NULL,NULL,NULL,NULL,170000,NULL,NULL,NULL,NULL,'في طور الدراسات','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
INSERT INTO projects VALUES(10,'تطاوين','تطاوين','تنوير عمومي بحي النصر من عمادة قطوفة','Infrastructure','eclairage_public',2025,89000,89000,89000,NULL,NULL,NULL,NULL,NULL,89000,NULL,'2026-04-27',3,NULL,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (11,NULL,NULL,'مد قنوات الماء الصالح للضرب لكل من قاعة الألعاب الفردية بالرقبة و والوحدة النموذجية لمعالجة النفايات','Infrastructure','Eau potable',2025,42000,42000,42000,0,0,0,0,0,42000,0,'',NULL,100,'تمّ الإنجاز','acheve','','','','','','','','2026-11-10 11:43:15','2026-11-17 15:21:56','marche','2025-09-10',12,'','',''),
  (12,'تطاوين','تطاوين','اقتناء معدات نظافة (شاحنة ضاغطة 16 م3)','Materiels','Materiel_propreté',2024,460000,460000,160000,300000,NULL,NULL,NULL,NULL,460000,NULL,'2025-12-26',6,NULL,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (13,'تطاوين','تطاوين','اقتناء عدد 2شاحنة قالبة و جرار','Materiels','Materiel_propreté',2024,323000,323000,73000,NULL,NULL,250000,NULL,NULL,323000,323000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (14,'تطاوين','تطاوين','مراجعة مثال التهيئة بمناطق التوسعة(السعادة-المزطورية-الزهرة)','Etudes','Etudes _PAU',2024,63000,63000,63000,NULL,NULL,NULL,NULL,NULL,63000,NULL,'2025-06-09',9,25,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (15,'تطاوين','تطاوين','صيانة الطرقات','Infrastructure','Routes',2024,50000,55000,55000,NULL,NULL,NULL,NULL,NULL,55000,55000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (16,'تطاوين','تطاوين','اشغال صيانة المنشات الرياضية(القاعة الرياضية بعباس-الملعب الفرعي بحي المهرجان)','Batiments','Equipemnts _sportifs',2024,35000,46000,46000,NULL,NULL,NULL,NULL,NULL,46000,46000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (17,'تطاوين','تطاوين','صيانة الااسواق البلدية (سوق الصناعات التقليدية-المسلخ البلدي-سوق الماشية)','Batiments','Batiments _economiques',2024,102000,89000,NULL,89000,NULL,NULL,NULL,NULL,89000,89000,NULL,NULL,NULL,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'القبول النهائي لاشغال المسلخ البلدي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
INSERT INTO projects VALUES(18,'تطاوين','تطاوين','ترصيف قرب المؤسسات الجامعية','Infrastructure','Routes',2024,91000,91000,91000,NULL,NULL,NULL,NULL,NULL,91000,89500,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (19,'تطاوين','تطاوين','تجديد شبكة التنوير العمومي بط,و 19 وط ج 121','Infrastructure','eclairage_public',2024,200000,212000,12000,200000,NULL,NULL,NULL,NULL,212000,210000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (20,'تطاوين','تطاوين','اقتناء تجهيزات صيانة العجلات وحواجز','Materiels','Equipements_divers',2023,18000,83000,83000,NULL,NULL,NULL,NULL,NULL,83000,83000,NULL,NULL,30,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'في طور تسلم المعدات','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (21,'تطاوين','تطاوين','اقتناء تجهيزات المسح الطوبوغرافي واجهزة تكييف  ','Materiels','Equipements_divers',2023,57000,57000,57000,NULL,NULL,NULL,NULL,NULL,57000,57000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (22,'تطاوين','تطاوين','تجديد،تمديد وتهذيب شبكة التنوير العمومي بطريق الرقبة-الطريق الرئيسة بالمزطورية-حسر برورمت- مفترق وادي الغار-جامع حي الجرف','Infrastructure','eclairage_public',2023,326000,326000,326000,NULL,NULL,NULL,NULL,NULL,326000,293400,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'القبول النهائي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (23,'تطاوين','تطاوين','مد شبكة التطهير (حي الموظفين-دي ابن سينا-غرغار-قصر المقابلة)','Infrastructure','Assainissement',2023,540000,540000,540000,NULL,NULL,NULL,NULL,NULL,540000,NULL,NULL,NULL,NULL,'في طور الإستشارة أو طلب عروض أو فرز العروض أو ابرام الصفقة','non_demarre',NULL,NULL,NULL,NULL,NULL,NULL,'تن الإعلان عن كلب العروض عدد 8 (فخر اجل لبول العروض  22/08/2025 )','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (24,'تطاوين','تطاوين','صيانة الطرقات ','Infrastructure','Routes',2023,50000,50000,50000,NULL,NULL,NULL,NULL,NULL,50000,50000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (25,'تطاوين','تطاوين','اقتناء فوانيس LED وتركيزها بالطرقات الرئيسية ','Infrastructure','eclairage_public',2023,100000,92000,92000,NULL,NULL,NULL,NULL,NULL,92000,92000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'القبول النهائي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
INSERT INTO projects VALUES(26,'تطاوين','تطاوين','تعبيد الطرقات بمناطق التوسعة','Infrastructure','Routes',2023,440000,542000,NULL,NULL,102000,NULL,440000,NULL,542000,270465,'2025-04-21',8,25,'في طور الإنجاز','en_cours',NULL,NULL,NULL,NULL,NULL,NULL,'انطلاق الاشغال 21/04/2025','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (27,'تطاوين','تطاوين','تجميل المدينة بمناطق التوسعة','Embellissement','Jardins_ publics',2023,85000,88500,3500,NULL,NULL,NULL,85000,NULL,88500,85000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,unistr('القبول النهائي\u000a'),'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (28,'تطاوين','تطاوين','تنوير عمومي (مناطق التوسعة)','Infrastructure','eclairage_public',2023,525000,525000,NULL,NULL,NULL,NULL,525000,NULL,525000,472500,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (29,'تطاوين','تطاوين','تعبيد الطرقات','Infrastructure','Routes',2022,800000,777761,277761,500000,NULL,NULL,NULL,NULL,777761,777761,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (30,'تطاوين','تطاوين','صيانة الطرقات','Infrastructure','Routes',2022,97300,97300,50000,NULL,NULL,47300,NULL,NULL,97300,97300,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (31,'تطاوين','تطاوين','الماء الصالح للشراب','Infrastructure','Eau potable',2022,49000,49190,49190,NULL,NULL,NULL,NULL,NULL,49190,49190,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'لم نتوصل بوثائق الخلاص من الركة الوطنية لاستغلال و توزيع المياه','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (32,'تطاوين','تطاوين','صيانة الحدائق','Embellissement','Jardins_ publics',2022,320000,215997,37597,100000,NULL,78400,NULL,NULL,215997,187000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'في انتظار الختم النّهائي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (33,'تطاوين','تطاوين','دراسات','Etudes','Etudes _Embellissements',2022,50080,50080,50080,NULL,NULL,NULL,NULL,NULL,50080,28272,NULL,NULL,53,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (34,'تطاوين','تطاوين','تهيئة دائرة بلدية بالمزطورية','Batiments','Batiments_ administratifs',2022,263715,192988,192988,NULL,NULL,NULL,NULL,NULL,192988,192988,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'مشروع منتهي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
INSERT INTO projects VALUES(35,'تطاوين','تطاوين','تهيئة مصب الفضلات','Divers','entretein_decharge',2022,140000,136000,136000,NULL,NULL,NULL,NULL,NULL,136000,136000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'مشروع منتهي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (36,'تطاوين','تطاوين','اقتناء شاحنة قالبة 3,5 طن','Materiels','Materiel_propreté',2022,94000,94000,14000,NULL,NULL,NULL,NULL,80000,94000,94000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL),
  (37,'تطاوين','تطاوين','تجهيزات  إدارية و إعلامية','Materiels','Equipements_divers',2022,50136,49000,49000,NULL,NULL,NULL,NULL,NULL,49000,49000,NULL,NULL,100,'تمّ الإنجاز','acheve',NULL,NULL,NULL,NULL,NULL,NULL,'مشروع منتهي','2026-11-10 11:43:15','2026-11-10 11:43:15',NULL,NULL,12,NULL,NULL,NULL);
CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT INTO settings VALUES('seuil_demarrage_jours','90'),
  ('seuil_inactivite_jours','30'),
  ('seuil_echeance_jours','30');
CREATE TABLE project_followups (
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
CREATE TABLE project_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, payment_date TEXT NOT NULL, amount REAL NOT NULL CHECK(amount>=0),
  payment_reference TEXT, document_type TEXT, observation TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
 );
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('projects',38),
  ('project_payments',4);
CREATE INDEX idx_followups_project_date ON project_followups(project_id,date_suivi DESC,id DESC);
CREATE INDEX idx_payments_project_date ON project_payments(project_id,payment_date,id);
PRAGMA writable_schema=OFF;
COMMIT;