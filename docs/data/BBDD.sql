-- ============================================================
--  App Ocio Familiar — Schema PostgreSQL v5
--  Requiere: pgvector (CREATE EXTENSION vector)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
--  BLOQUE 1 — USUARIOS Y FAMILIAS
-- ============================================================

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT        NOT NULL,
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE familias (
    id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                  TEXT    NOT NULL,
    -- Código corto generado automáticamente para invitar miembros, ej: FAM-A3BX9K
    codigo_invitacion       TEXT    NOT NULL UNIQUE
                                    DEFAULT 'FAM-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    ciudad_habitual         TEXT,
    -- Las 5 preferencias del onboarding (sin coordenadas GPS)
    pref_carrito            BOOLEAN NOT NULL DEFAULT false,
    pref_cambiador          BOOLEAN NOT NULL DEFAULT false,
    pref_interior           BOOLEAN NOT NULL DEFAULT false,
    pref_bajo_presupuesto   BOOLEAN NOT NULL DEFAULT false,
    pref_tranquilo          BOOLEAN NOT NULL DEFAULT false,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla puente users <-> familias
-- rol: 'creador' | 'miembro'
CREATE TABLE familia_miembros (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id  UUID        NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    rol         TEXT        NOT NULL DEFAULT 'miembro'
                            CHECK (rol IN ('creador', 'miembro')),
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (familia_id, user_id)
);

-- Hijos: solo guardamos rango de edad, nunca fecha de nacimiento
-- Rangos: '0-1' | '2-3' | '4-6' | '7-10' | '11+'
-- Así no se almacena ningún dato que permita identificar a un menor
CREATE TABLE hijos (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id  UUID    NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
    nombre      TEXT    NOT NULL,
    rango_edad  TEXT    NOT NULL
                        CHECK (rango_edad IN ('0-1', '2-3', '4-6', '7-10', '11+'))
);


-- ============================================================
--  BLOQUE 2 — CUENTAS COMERCIO Y COMERCIOS
-- ============================================================

-- Cuentas de comercio: completamente separadas de los usuarios familiares
-- Una cuenta puede gestionar varios comercios (ej. cadena con varias sedes)
CREATE TABLE cuentas_comercio (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_contacto TEXT        NOT NULL,
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    telefono        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comercios (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_comercio_id  UUID        NOT NULL REFERENCES cuentas_comercio(id) ON DELETE RESTRICT,
    nombre              TEXT        NOT NULL,
    descripcion         TEXT,
    direccion           TEXT,
    lat                 FLOAT,
    lng                 FLOAT,
    telefono            TEXT,
    website             TEXT,
    logo_url            TEXT,
    -- false por defecto: el comercio no aparece hasta que el equipo lo verifica
    verificado          BOOLEAN     NOT NULL DEFAULT false,
    verificado_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Características del comercio (bloque opcional, se rellena tras el alta)
CREATE TABLE comercio_caracteristicas (
    id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    comercio_id      UUID    NOT NULL UNIQUE REFERENCES comercios(id) ON DELETE CASCADE,
    edad_min         INT     CHECK (edad_min >= 0),
    edad_max         INT     CHECK (edad_max >= 0),
    duracion_minutos INT     CHECK (duracion_minutos > 0),
    precio_medio     FLOAT   CHECK (precio_medio >= 0),
    es_interior      BOOLEAN,
    admite_carrito   BOOLEAN,
    tiene_cambiador  BOOLEAN,
    -- 1 = muy tranquilo, 5 = muy activo/estresante
    nivel_estres     INT     CHECK (nivel_estres BETWEEN 1 AND 5)
);

CREATE TABLE categorias (
    id      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre  TEXT    NOT NULL UNIQUE,
    slug    TEXT    NOT NULL UNIQUE,
    icono   TEXT
);

-- Relación muchos-a-muchos: un comercio puede tener varias categorías
CREATE TABLE comercio_categorias (
    comercio_id  UUID NOT NULL REFERENCES comercios(id)  ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (comercio_id, categoria_id)
);


-- ============================================================
--  BLOQUE 3 — EVENTOS
-- ============================================================

-- comercio_id es nullable: un evento puede no estar ligado a ningún comercio
-- (ej. actividad en un parque público organizada externamente)
CREATE TABLE eventos (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    comercio_id  UUID        REFERENCES comercios(id) ON DELETE SET NULL,
    titulo       TEXT        NOT NULL,
    descripcion  TEXT,
    imagen_url   TEXT,
    lat          FLOAT,
    lng          FLOAT,
    direccion    TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin    TIMESTAMPTZ,
    precio       FLOAT       CHECK (precio >= 0),
    capacidad    INT         CHECK (capacidad > 0),
    -- 'borrador' | 'publicado' | 'cancelado' | 'finalizado'
    estado       TEXT        NOT NULL DEFAULT 'borrador'
                             CHECK (estado IN ('borrador', 'publicado', 'cancelado', 'finalizado')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Características propias del evento (independientes del comercio)
CREATE TABLE evento_caracteristicas (
    id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id        UUID    NOT NULL UNIQUE REFERENCES eventos(id) ON DELETE CASCADE,
    edad_min         INT     CHECK (edad_min >= 0),
    edad_max         INT     CHECK (edad_max >= 0),
    duracion_minutos INT     CHECK (duracion_minutos > 0),
    es_interior      BOOLEAN,
    admite_carrito   BOOLEAN,
    tiene_cambiador  BOOLEAN,
    nivel_estres     INT     CHECK (nivel_estres BETWEEN 1 AND 5)
);

-- Vectores para búsqueda semántica con pgvector
-- Dimensión 768: compatible con nomic-embed-text (Ollama)
CREATE TABLE evento_embeddings (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id         UUID        NOT NULL UNIQUE REFERENCES eventos(id) ON DELETE CASCADE,
    embedding         VECTOR(768) NOT NULL,
    texto_vectorizado TEXT        NOT NULL,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice IVFFlat para búsqueda aproximada por similitud coseno
-- Ejecutar DESPUÉS de tener al menos ~100 registros
-- Ajustar 'lists' según volumen: sqrt(número de filas esperado)
CREATE INDEX idx_evento_embeddings_vector
    ON evento_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);


-- ============================================================
--  BLOQUE 4 — INTERACCIÓN FAMILIAR
-- ============================================================

-- Historial de eventos realizados por la familia (registro manual)
-- familia_id: historial compartido por toda la familia
-- user_id: qué miembro concreto lo registró
CREATE TABLE historial_familia (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id       UUID        NOT NULL REFERENCES familias(id)  ON DELETE CASCADE,
    user_id          UUID        NOT NULL REFERENCES users(id)     ON DELETE RESTRICT,
    evento_id        UUID        NOT NULL REFERENCES eventos(id)   ON DELETE RESTRICT,
    fecha_asistencia TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valoracion       INT         CHECK (valoracion BETWEEN 1 AND 5),
    resena           TEXT,
    repetir          BOOLEAN,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Una familia no puede registrar el mismo evento dos veces
    UNIQUE (familia_id, evento_id)
);

-- Eventos guardados como favoritos por la familia (compartido entre miembros)
CREATE TABLE favoritos (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id  UUID        NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
    evento_id   UUID        NOT NULL REFERENCES eventos(id)  ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (familia_id, evento_id)
);

-- Valoraciones públicas de comercios (personales, no familiares)
-- Un usuario solo puede dejar una valoración por comercio
CREATE TABLE ratings (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id)     ON DELETE RESTRICT,
    comercio_id UUID        NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    puntuacion  INT         NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, comercio_id)
);


-- ============================================================
--  ÍNDICES DE RENDIMIENTO
-- ============================================================

-- Login de usuarios y comercios
CREATE INDEX idx_users_email
    ON users(email);
CREATE INDEX idx_cuentas_comercio_email
    ON cuentas_comercio(email);

-- Familias por código de invitación
CREATE INDEX idx_familias_codigo
    ON familias(codigo_invitacion);

-- Miembros por familia y por usuario
CREATE INDEX idx_familia_miembros_familia
    ON familia_miembros(familia_id);
CREATE INDEX idx_familia_miembros_user
    ON familia_miembros(user_id);

-- Hijos por familia
CREATE INDEX idx_hijos_familia
    ON hijos(familia_id);

-- Solo comercios verificados (los más consultados en la app)
CREATE INDEX idx_comercios_verificados
    ON comercios(verificado) WHERE verificado = true;

-- Comercios por ubicación (búsqueda geográfica aproximada)
CREATE INDEX idx_comercios_geo
    ON comercios(lat, lng);

-- Eventos publicados y por fecha
CREATE INDEX idx_eventos_publicados
    ON eventos(estado) WHERE estado = 'publicado';
CREATE INDEX idx_eventos_fecha
    ON eventos(fecha_inicio);
CREATE INDEX idx_eventos_comercio
    ON eventos(comercio_id);

-- Eventos por ubicación
CREATE INDEX idx_eventos_geo
    ON eventos(lat, lng);

-- Historial y favoritos por familia
CREATE INDEX idx_historial_familia_id
    ON historial_familia(familia_id);
CREATE INDEX idx_favoritos_familia_id
    ON favoritos(familia_id);

-- Ratings por comercio (para calcular media de puntuación)
CREATE INDEX idx_ratings_comercio
    ON ratings(comercio_id);