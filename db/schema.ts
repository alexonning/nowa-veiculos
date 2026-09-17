import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const vehicles = sqliteTable(
  "vehicles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    version: text("version").notNull().default(""),
    year: integer("year").notNull(),
    mileage: integer("mileage").notNull().default(0),
    transmission: text("transmission").notNull().default("Manual"),
    fuel: text("fuel").notNull().default("Flex"),
    category: text("category").notNull().default("hatch"),
    condition: text("condition").notNull().default("usado"),
    saleEnabled: integer("sale_enabled", { mode: "boolean" }).notNull().default(true),
    rentalEnabled: integer("rental_enabled", { mode: "boolean" }).notNull().default(false),
    salePrice: integer("sale_price"),
    rentalPrice: integer("rental_price"),
    description: text("description").notNull().default(""),
    features: text("features").notNull().default("[]"),
    status: text("status").notNull().default("active"),
    isPromotion: integer("is_promotion", { mode: "boolean" }).notNull().default(false),
    promotionalPrice: integer("promotional_price"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_vehicles_status").on(table.status),
    index("idx_vehicles_promotion").on(table.isPromotion),
  ],
);

export const vehicleImages = sqliteTable(
  "vehicle_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
    objectKey: text("object_key"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_vehicle_images_vehicle_id").on(table.vehicleId)],
);
