import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { note as table, type Note } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { MARKDOWN_DEFAULT_VALUE } from '$lib';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) throw new Error('User not found');

	let notes = await db.select().from(table).where(eq(table.userId, user.id)).execute();
	if (notes.length === 0) {
		notes = await db
			.insert(table)
			.values({
				content: MARKDOWN_DEFAULT_VALUE,
				userId: user.id,
				tags: [],
				icon: 'FileQuestion',
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning()
			.execute();
	}

	return {
		user,
		notes
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (event.locals.session) await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/login');
	},
	save: async (event) => {
		const data = await event.request.formData();
		if (!data.has('notes')) return;

		const notes: Note[] = JSON.parse(data.get('notes') as string);
		if (notes.length === 0) return;

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
	}
};
