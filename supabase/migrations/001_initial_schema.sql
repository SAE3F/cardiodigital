-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ENUMs
CREATE TYPE sociedad_source AS ENUM ('SAC','AHA','ESC','ACC','ACC_AHA','ILCOR','LOCAL');
CREATE TYPE guia_categoria AS ENUM (
  'arritmias','coronario','insuficiencia_cardiaca',
  'emergencias','farmacologia','procedimientos',
  'hipertension','anticoagulacion'
);
CREATE TYPE nivel_evidencia AS ENUM ('IA','IB','IC','IIA','IIB','III');
CREATE TYPE rol_usuario AS ENUM ('medico_residente','medico_staff','estudiante','admin');

-- profiles (extiende auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  rol         rol_usuario NOT NULL DEFAULT 'medico_residente',
  institucion TEXT,
  matricula   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- guias
CREATE TABLE guias (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT UNIQUE NOT NULL,
  titulo           TEXT NOT NULL,
  subtitulo        TEXT,
  categoria        guia_categoria NOT NULL,
  fuente           sociedad_source NOT NULL,
  anio_publicacion INTEGER NOT NULL,
  version          TEXT,
  doi              TEXT,
  url_fuente       TEXT,
  contenido_md     TEXT NOT NULL,
  resumen_rapido   TEXT,
  nivel_evidencia  nivel_evidencia,
  palabras_clave   TEXT[],
  fts_vector       TSVECTOR,
  activa           BOOLEAN NOT NULL DEFAULT TRUE,
  destacada        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by       UUID REFERENCES profiles(id)
);

-- algoritmos
CREATE TABLE algoritmos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guia_id     UUID REFERENCES guias(id) ON DELETE CASCADE,
  titulo      TEXT NOT NULL,
  descripcion TEXT,
  nodo_raiz   JSONB NOT NULL,
  orden       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- calculadoras
CREATE TABLE calculadoras (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  nombre        TEXT NOT NULL,
  descripcion   TEXT,
  categoria     TEXT NOT NULL,
  schema_inputs JSONB,
  funcion_clave TEXT NOT NULL,
  indicacion    TEXT,
  interpretacion JSONB,
  referencias   TEXT[],
  activa        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- scores_riesgo (historial por usuario)
CREATE TABLE scores_riesgo (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calculadora_id UUID REFERENCES calculadoras(id),
  usuario_id     UUID REFERENCES profiles(id),
  inputs         JSONB NOT NULL,
  puntaje        DECIMAL(10,2),
  interpretacion TEXT,
  recomendacion  TEXT,
  notas          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- dosis_farmacos
CREATE TABLE dosis_farmacos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre           TEXT NOT NULL,
  nombre_comercial TEXT[],
  dosis            JSONB NOT NULL,
  clase            TEXT,
  contraindicaciones TEXT[],
  fts_vector       TSVECTOR,
  activa           BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger FTS para guias
CREATE OR REPLACE FUNCTION update_guias_fts() RETURNS TRIGGER AS $$
BEGIN
  NEW.fts_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.titulo,''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.subtitulo,''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.resumen_rapido,''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.contenido_md,''))), 'C') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(array_to_string(NEW.palabras_clave,' '),''))), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_guias_fts BEFORE INSERT OR UPDATE ON guias
  FOR EACH ROW EXECUTE FUNCTION update_guias_fts();

-- Trigger FTS para farmacos
CREATE OR REPLACE FUNCTION update_farmacos_fts() RETURNS TRIGGER AS $$
BEGIN
  NEW.fts_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.nombre,''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(array_to_string(NEW.nombre_comercial,' '),''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.clase,''))), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_farmacos_fts BEFORE INSERT OR UPDATE ON dosis_farmacos
  FOR EACH ROW EXECUTE FUNCTION update_farmacos_fts();

-- updated_at genérico
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_guias_upd BEFORE UPDATE ON guias FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices GIN para FTS
CREATE INDEX idx_guias_fts ON guias USING GIN(fts_vector);
CREATE INDEX idx_farmacos_fts ON dosis_farmacos USING GIN(fts_vector);
CREATE INDEX idx_guias_categoria ON guias(categoria) WHERE activa = TRUE;
CREATE INDEX idx_guias_fuente_anio ON guias(fuente, anio_publicacion DESC) WHERE activa = TRUE;
CREATE INDEX idx_algoritmos_guia ON algoritmos(guia_id, orden);
CREATE INDEX idx_scores_usuario ON scores_riesgo(usuario_id, created_at DESC);

-- RLS
ALTER TABLE guias ENABLE ROW LEVEL SECURITY;
ALTER TABLE algoritmos ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosis_farmacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guias_read" ON guias FOR SELECT TO authenticated USING (activa = TRUE);
CREATE POLICY "guias_write_admin" ON guias FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));
CREATE POLICY "algoritmos_read" ON algoritmos FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "algoritmos_write_admin" ON algoritmos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));
CREATE POLICY "calculadoras_read" ON calculadoras FOR SELECT TO authenticated USING (activa = TRUE);
CREATE POLICY "farmacos_read" ON dosis_farmacos FOR SELECT TO authenticated USING (activa = TRUE);
CREATE POLICY "scores_own" ON scores_riesgo FOR ALL TO authenticated
  USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "profiles_own" ON profiles FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Vista unificada para búsqueda
CREATE OR REPLACE VIEW busqueda_unificada AS
  SELECT id, slug, titulo AS nombre, resumen_rapido AS descripcion,
    'guia' AS tipo, categoria::TEXT AS categoria,
    fuente::TEXT AS fuente, anio_publicacion, fts_vector
  FROM guias WHERE activa = TRUE
UNION ALL
  SELECT id, nombre AS slug, nombre, clase AS descripcion,
    'farmaco' AS tipo, clase AS categoria,
    NULL AS fuente, NULL AS anio_publicacion, fts_vector
  FROM dosis_farmacos WHERE activa = TRUE;

-- RPC para búsqueda unificada desde el frontend
CREATE OR REPLACE FUNCTION buscar(query TEXT)
RETURNS TABLE (id UUID, nombre TEXT, descripcion TEXT, tipo TEXT, categoria TEXT, ranking REAL)
AS $$
  SELECT b.id, b.nombre, b.descripcion, b.tipo, b.categoria,
    ts_rank_cd(b.fts_vector, to_tsquery('spanish', unaccent(query))) AS ranking
  FROM busqueda_unificada b
  WHERE b.fts_vector @@ to_tsquery('spanish', unaccent(query))
  ORDER BY ranking DESC LIMIT 20;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
