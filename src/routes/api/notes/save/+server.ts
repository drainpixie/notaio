import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { note as table, type Note } from '$lib/server/db/schema';
import { error, type RequestHandler, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const notePatchSchema = z.object({
	id: z.string(),
	tags: z.array(z.string()).optional(),
	icon: z.string().optional(),
	title: z.string().optional(),
	content: z.string().optional(),
	pinned: z.boolean().optional()
});

export const PATCH: RequestHandler = async ({ request, cookies }) => {
	const { user } = await auth.validateSessionFromCookies(cookies);
	if (!user) return error(401, { message: 'Unauthorized' });

	const data = await request.formData();
	if (!data.has('notes')) return error(400, { message: 'Invalid notes data' });

	const notes: Note[] = JSON.parse(data.get('notes') as string);
	const parsed = notes.map((note) => notePatchSchema.parse(note));
	if (parsed.length === 0) return error(400, { message: 'Invalid notes data' });

	for (const note of notes) {
		await db
			.update(table)
			.set({
				tags: note.tags,
				icon: note.icon,
				title: note.title,
				pinned: note.pinned,
				content: note.content,
				updatedAt: new Date()
			})
			.where(eq(table.id, note.id))
			.run();
	}

	return json(notes);
};
