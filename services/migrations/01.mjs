import { sql } from 'kysely'

export async function up(db) {
  await db.schema
    .createType('status')
    .asEnum(['active', 'inactive'])
    .execute()

  await db.schema
    .createTable("user")
    .addColumn("id", "bigserial", (col) => col.primaryKey())
    .addColumn("cognitoId", "varchar", (col) => col.notNull().unique())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("email", "varchar", (col) => col.notNull().unique())
    .addColumn("document", "varchar", (col) => col.notNull().unique())
    .addColumn("birthDate", "varchar", (col) => col.notNull())
    .addColumn("mobilePhone", "varchar", (col) => col.notNull())
    .addColumn("status", 'status', (col) => col.defaultTo("active").notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("product")
    .addColumn("id", "bigserial", (col) => col.primaryKey())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("price", "varchar", (col) => col.notNull())
    .addColumn("quantity", "varchar", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("salesDay")
    .addColumn("id", "bigserial", (col) => col.primaryKey())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("soldProduct")
    .addColumn("id", "bigserial", (col) => col.primaryKey())
    .addColumn("salesDayId", "integer", (col) => col.references('salesDay.id').onDelete('cascade'))
    .addColumn("soldQuantity", "varchar", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("log")
    .addColumn("id", "bigserial", (col) => col.primaryKey())
    .addColumn("cognitoId", "varchar", (col) => col.references('user.cognitoId').onDelete('cascade'))
    .addColumn("event", "json", (col) => col.notNull())
    .addColumn("response", "json", (col) => col.notNull())
    .addColumn("statusCode", "varchar", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db) {
  await db.schema.dropTable("soldProduct").execute();
  await db.schema.dropTable("salesDay").execute();
  await db.schema.dropTable("product").execute();
  await db.schema.dropTable("user").execute();
  await db.schema.dropTable("log").execute();
}