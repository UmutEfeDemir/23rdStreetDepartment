-- 23rd Street Department — Neon PostgreSQL Schema
-- Neon console.neon.tech → SQL Editor'de çalıştır

-- Officers table
CREATE TABLE IF NOT EXISTS officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_no TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  rank_order INT NOT NULL DEFAULT 99,
  unit TEXT NOT NULL CHECK (unit IN ('HPD','CID','SWAT','TFD','K9','ASD')),
  status TEXT NOT NULL CHECK (status IN ('Görevde','Aktif','İzinli','Eğitimde')),
  seniority_months INT DEFAULT 0,
  rank_progress INT DEFAULT 0 CHECK (rank_progress BETWEEN 0 AND 100),
  next_rank TEXT,
  duty_hours INT DEFAULT 0,
  patrols INT DEFAULT 0,
  commendations INT DEFAULT 0,
  warnings INT DEFAULT 0,
  discord_id TEXT,
  avatar_url TEXT,
  is_command BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id UUID REFERENCES officers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  meta TEXT,
  at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age INT NOT NULL,
  discord TEXT NOT NULL,
  character_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  experience TEXT NOT NULL,
  motivation TEXT NOT NULL,
  accepted_rules BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','interview','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site stats (tek satır)
CREATE TABLE IF NOT EXISTS site_stats (
  id INT PRIMARY KEY DEFAULT 1,
  years_active INT DEFAULT 3,
  total_personnel INT DEFAULT 0,
  active_troopers INT DEFAULT 0,
  sectors INT DEFAULT 6
);

INSERT INTO site_stats (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Rank sırası referansı için view (opsiyonel)
CREATE OR REPLACE VIEW officer_rank_view AS
SELECT
  o.*,
  CASE o.rank
    WHEN 'Komiser'             THEN 1
    WHEN 'Komiser Yardımcısı'  THEN 2
    WHEN 'Yardımcı Komiser'    THEN 3
    WHEN 'Başmüfettiş'         THEN 4
    WHEN 'Müfettiş'            THEN 5
    WHEN 'Başçavuş'            THEN 6
    WHEN 'Çavuş'               THEN 7
    WHEN 'Kıdemli Trooper'     THEN 8
    WHEN 'Trooper'             THEN 9
    WHEN 'Deneme Trooper'      THEN 10
    WHEN 'Aday'                THEN 11
    ELSE 99
  END AS rank_sort
FROM officers o;
