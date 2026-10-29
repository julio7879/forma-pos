-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'VENDEDOR', 'PREPARADOR');

-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('SELECT', 'TEXT', 'COLOR');

-- CreateEnum
CREATE TYPE "OrderOrigin" AS ENUM ('WEB', 'POS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('RECIBIDO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDIENTE', 'ANTICIPO_PARCIAL', 'PAGADO');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ANTICIPO', 'SALDO', 'TOTAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'DEMO');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PORCENTAJE', 'FIJO');

-- CreateEnum
CREATE TYPE "DiscountAppliedType" AS ENUM ('PROMOCION', 'MANUAL');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('ENTRADA', 'SALIDA_VENTA', 'AJUSTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Role" NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen_url" TEXT,
    "categoria" TEXT NOT NULL,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "OptionType" NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT false,
    "valores_recargos" JSONB NOT NULL,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "origen" "OrderOrigin" NOT NULL,
    "cliente_nombre" TEXT NOT NULL,
    "cliente_contacto" TEXT NOT NULL,
    "fecha_deseada" TIMESTAMP(3),
    "estado_pedido" "OrderStatus" NOT NULL DEFAULT 'RECIBIDO',
    "estado_pago" "PaymentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total_extras" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_final" DECIMAL(10,2) NOT NULL,
    "total_pagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notas" TEXT,
    "creado_por_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "nombre_snapshot" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_base_snapshot" DECIMAL(10,2) NOT NULL,
    "opciones_snapshot" JSONB NOT NULL,
    "subtotal_item" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "tipo" "PaymentType" NOT NULL,
    "metodo" "PaymentMethod" NOT NULL,
    "registrado_por_id" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT,
    "tipo" "PromotionType" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "alcance" TEXT NOT NULL DEFAULT 'PEDIDO',
    "minimo_compra" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDiscount" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "promotion_id" TEXT,
    "codigo_snapshot" TEXT,
    "tipo" "DiscountAppliedType" NOT NULL,
    "valor_configurado" DECIMAL(10,2) NOT NULL,
    "monto_descontado" DECIMAL(10,2) NOT NULL,
    "razon_manual" TEXT,
    "autorizado_por_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tipo" "InventoryMovementType" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "usuario_id" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "usuario_id" TEXT,
    "accion" TEXT NOT NULL,
    "detalle_anterior" JSONB,
    "detalle_nuevo" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_referencia_key" ON "Order"("referencia");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_codigo_key" ON "Promotion"("codigo");

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDiscount" ADD CONSTRAINT "OrderDiscount_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDiscount" ADD CONSTRAINT "OrderDiscount_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDiscount" ADD CONSTRAINT "OrderDiscount_autorizado_por_id_fkey" FOREIGN KEY ("autorizado_por_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
