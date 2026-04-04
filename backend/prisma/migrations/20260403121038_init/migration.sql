-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'light', 'moderate', 'active');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "sex" "Sex",
    "age" INTEGER,
    "weight_kg" DOUBLE PRECISION,
    "height_cm" DOUBLE PRECISION,
    "activity_level" "ActivityLevel" NOT NULL DEFAULT 'sedentary',
    "daily_goal_kcal" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kcal_per_100g" DOUBLE PRECISION NOT NULL,
    "protein_per_100g" DOUBLE PRECISION NOT NULL,
    "fat_per_100g" DOUBLE PRECISION NOT NULL,
    "carbs_per_100g" DOUBLE PRECISION NOT NULL,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "total_kcal" DOUBLE PRECISION NOT NULL,
    "total_protein" DOUBLE PRECISION NOT NULL,
    "total_fat" DOUBLE PRECISION NOT NULL,
    "total_carbs" DOUBLE PRECISION NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "log_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_log_items" (
    "id" UUID NOT NULL,
    "meal_log_id" UUID NOT NULL,
    "food_id" UUID NOT NULL,
    "quantity_g" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_log_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "foods_name_idx" ON "foods"("name");

-- CreateIndex
CREATE INDEX "foods_created_by_user_id_idx" ON "foods"("created_by_user_id");

-- CreateIndex
CREATE INDEX "meal_logs_user_id_idx" ON "meal_logs"("user_id");

-- CreateIndex
CREATE INDEX "meal_logs_log_date_idx" ON "meal_logs"("log_date");

-- CreateIndex
CREATE INDEX "meal_logs_user_id_log_date_idx" ON "meal_logs"("user_id", "log_date");

-- CreateIndex
CREATE INDEX "meal_log_items_meal_log_id_idx" ON "meal_log_items"("meal_log_id");

-- CreateIndex
CREATE INDEX "meal_log_items_food_id_idx" ON "meal_log_items"("food_id");

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_log_items" ADD CONSTRAINT "meal_log_items_meal_log_id_fkey" FOREIGN KEY ("meal_log_id") REFERENCES "meal_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_log_items" ADD CONSTRAINT "meal_log_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
