import type { PageServerLoad } from './$types';

import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { schema } from './schema';
import { db } from '$lib/server/db';
import { settings } from '$lib/server/db/schema';
import { redirect, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const existing = await db
		.select()
		.from(settings)
		.where(eq(settings.userId, event.locals.user.id))
		.limit(1);

	const form = await superValidate(zod(schema));

	if (existing.length > 0) {
		const settings = existing[0];

		form.data = {
			apiKey: settings.apiKey,
			baseURL: settings.baseURL,
			authorizationHeader: settings.authorizationHeader
		};
	}

	return {
		form,
		existing: existing.length > 0
	};
};

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Unauthorized' });

		const form = await superValidate(event, zod(schema));

		if (!form.valid) return fail(400, { form });

		const { apiKey, baseURL, authorizationHeader } = form.data;
		const userId = event.locals.user.id;

		try {
			const existing = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);

			if (existing.length > 0) {
				await db
					.update(settings)
					.set({
						apiKey,
						baseURL,
						authorizationHeader
					})
					.where(eq(settings.userId, userId));
			} else {
				await db.insert(settings).values({
					userId,
					apiKey,
					baseURL,
					authorizationHeader
				});
			}
		} catch (error) {
			console.error('Error saving settings:', error);

			return fail(500, {
				form: {
					...form,
					message: 'An error occurred while saving your settings'
				}
			});
		}

		return redirect(302, '/');
	}
};
