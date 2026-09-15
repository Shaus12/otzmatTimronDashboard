import { sqliteTable, text, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const records=sqliteTable('records',{
 userId:text('user_id').notNull(),id:text('id').notNull(),kind:text('kind').notNull(),name:text('name').notNull(),detail:text('detail').notNull().default(''),category:text('category').notNull().default(''),status:text('status').notNull().default('פתוח'),due:text('due').notNull().default(''),url:text('url').notNull().default(''),assignee:text('assignee').notNull().default(''),updated:text('updated').notNull(),deleted:integer('deleted').notNull().default(0)
},t=>[primaryKey({columns:[t.userId,t.id]}),uniqueIndex('unique_vehicle_assignment').on(t.userId,t.assignee).where(sql`${t.kind} = 'vehicles' AND ${t.assignee} <> '' AND ${t.deleted} = 0`)]);
