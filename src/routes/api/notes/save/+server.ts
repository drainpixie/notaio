import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { note as table, type Note } from '$lib/server/db/schema';
import { error, type RequestHandler, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ request, cookies }) => {
	const { user } = await auth.validateSessionFromCookies(cookies);
	if (!user) return error(401, { message: 'Unauthorized' });

	const data = await request.formData();
	if (!data.has('notes')) return error(400, { message: 'Invalid notes data' });

	const notes: Note[] = JSON.parse(data.get('notes') as string);
	if (notes.length === 0) return error(400, { message: 'Invalid notes data' });

	for (const note of notes) {
		await db
			.update(table)
			.set({
				tags: note.tags,
				icon: note.icon,
				title: note.title,
				content: note.content,
				updatedAt: new Date()
			})
			.where(eq(table.id, note.id))
			.run();
	}

	return json(notes);
};
