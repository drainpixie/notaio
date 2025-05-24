import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const user = sqliteTable('user', {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	age: integer(),
	username: text().notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const settings = sqliteTable('settings', {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	apiKey: text('api_key').notNull().unique(),
	baseURL: text('base_url').notNull(),
	authorizationHeader: text('authorization_header').notNull()
});

export const session = sqliteTable('session', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const note = sqliteTable('note', {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	icon: text().notNull().default('FileQuestion'),
	title: text().notNull().default('Untitled'),
	content: text().notNull(),
	pinned: integer({ mode: 'boolean' }).default(false),
	tags: text({ mode: 'json' })
		.notNull()
		.$type<string[]>()
		.default(sql`(json_array())`),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Note = typeof note.$inferSelect;
