import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const user = sqliteTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const settings = sqliteTable('settings', {
	id: text('id')
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
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	icon: text('icon').notNull().default('FileQuestion'),
	title: text('title').notNull().default('Untitled'),
	content: text('content').notNull(),
	tags: text('tags', { mode: 'json' })
		.notNull()
		.$type<string[]>()
		.default(sql`(json_array())`),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Note = typeof note.$inferSelect;
