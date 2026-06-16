-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "family_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" SERIAL NOT NULL,
    "family_id" INTEGER NOT NULL,
    "name" VARCHAR(100),
    "age" INTEGER NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" TEXT,
    "phone_number" VARCHAR(30),
    "plan" INTEGER,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER,
    "fuente" VARCHAR(20),
    "external_id" TEXT,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "categoria" VARCHAR(50),
    "tipo_plantilla" VARCHAR(100),
    "municipio" VARCHAR(100),
    "territorio" VARCHAR(30),
    "address" TEXT,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "telefono" VARCHAR(30),
    "email" VARCHAR(100),
    "website" TEXT,
    "es_lluvia" BOOLEAN NOT NULL DEFAULT false,
    "es_carrito" BOOLEAN NOT NULL DEFAULT false,
    "es_cambiador" BOOLEAN NOT NULL DEFAULT false,
    "es_silla_ruedas" BOOLEAN NOT NULL DEFAULT false,
    "es_mascotas" BOOLEAN NOT NULL DEFAULT false,
    "edad_minima" DECIMAL,
    "multiplicador" DECIMAL(3,2) DEFAULT 1.00,
    "fecha_inicio" TIMESTAMP(6) NOT NULL,
    "fecha_fin" TIMESTAMP(6),
    "lugar" VARCHAR(255),
    "price" VARCHAR,
    "imagen_url" TEXT,
    "tipo_evento" VARCHAR(100),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "discount" VARCHAR(50),
    "description" TEXT,
    "duration" DECIMAL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER,
    "title" VARCHAR(150) NOT NULL,
    "is_recommendation" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_events" (
    "plan_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "event_order" INTEGER NOT NULL,

    CONSTRAINT "plan_events_pkey" PRIMARY KEY ("plan_id","event_id")
);

-- CreateTable
CREATE TABLE "user_favorite_events" (
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "saved_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_events_pkey" PRIMARY KEY ("user_id","event_id")
);

-- CreateTable
CREATE TABLE "user_favorite_plans" (
    "user_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "saved_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_plans_pkey" PRIMARY KEY ("user_id","plan_id")
);

-- CreateTable
CREATE TABLE "user_selected_recommendations" (
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "selected_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_selected_recommendations_pkey" PRIMARY KEY ("user_id","event_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_user_id_key" ON "businesses"("user_id");

-- CreateIndex
CREATE INDEX "events_municipio_idx" ON "events"("municipio");

-- CreateIndex
CREATE INDEX "events_territorio_idx" ON "events"("territorio");

-- CreateIndex
CREATE INDEX "events_categoria_idx" ON "events"("categoria");

-- CreateIndex
CREATE INDEX "events_tipo_evento_idx" ON "events"("tipo_evento");

-- CreateIndex
CREATE INDEX "events_fecha_inicio_idx" ON "events"("fecha_inicio");

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_events" ADD CONSTRAINT "plan_events_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_events" ADD CONSTRAINT "plan_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_events" ADD CONSTRAINT "user_favorite_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_events" ADD CONSTRAINT "user_favorite_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_plans" ADD CONSTRAINT "user_favorite_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_plans" ADD CONSTRAINT "user_favorite_plans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_selected_recommendations" ADD CONSTRAINT "user_selected_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_selected_recommendations" ADD CONSTRAINT "user_selected_recommendations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
