import { generateID } from '$lib';
import { validateSessionFromCookies } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { type Note, note } from '$lib/server/db/schema';
import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { user } = await validateSessionFromCookies(cookies);
	if (!user) return error(401, { message: 'Unauthorized' });

	const { title, content, icon = 'FileQuestion', tags = [] }: Note = await request.json();
	const userId = user.id;

	if (!title || !content) return error(400, { message: 'Title and text are required' });

	if (typeof title !== 'string' || typeof content !== 'string' || typeof icon !== 'string')
		return error(400, { message: 'Title, text, and icon must be strings' });

	if (title.length < 3 || title.length > 255)
		return error(400, {
			message: 'Title must be between 3 and 255 characters'
		});

	if (tags.length > 10) return error(400, { message: 'Too many tags' });

	if (tags.some((tag: string) => tag.length > 255)) return error(400, { message: 'Tag too long' });

	const [id] = generateID(title);
	const body = {
		id,
		icon,
		tags,
		title,
		userId,
		content,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	await db.insert(note).values(body);
	return json(body);
};

export const GET: RequestHandler = async ({ url, cookies }) => {
	const { user } = await validateSessionFromCookies(cookies);
	if (!user) return error(401, { message: 'Unauthorized' });

	const userId = user.id;
	const id = url.searchParams.get('id');

	if (!id) {
		const notes = await db.select().from(note).where(eq(note.userId, userId)).execute();

		return json(notes);
	}

	const data = await db
		.select()
		.from(note)
		.where(and(eq(note.id, id), eq(note.userId, userId)))
		.limit(1)
		.execute();

	return json(data);
};
