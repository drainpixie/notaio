import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { hash, verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { schema } from './schema';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const redirectTo = event.url.searchParams.get('redirectTo') || '/';
		return redirect(302, redirectTo);
	}

	const form = await superValidate(zod(schema));

	return {
		form,
		redirectTo: event.url.searchParams.get('redirectTo') || '/'
	};
};

export const actions: Actions = {
	login: async (event) => {
		const form = await superValidate(event, zod(schema));
		if (!form.valid) return fail(400, { form });

		const { username, password } = form.data;

		const results = await db.select().from(table.user).where(eq(table.user.username, username));
		const existing = results.at(0);
		if (!existing)
			return fail(400, {
				form: {
					...form,
					message: 'Incorrect username or password'
				}
			});

		const valid = await verify(existing.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!valid)
			return fail(400, {
				form: {
					...form,
					message: 'Incorrect username or password'
				}
			});

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existing.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		const redirectTo = event.url.searchParams.get('redirectTo') ?? '/';
		return redirect(302, redirectTo);
	},
	register: async (event) => {
		const form = await superValidate(event, zod(schema));

		if (!form.valid) return fail(400, { form });

		const { username, password } = form.data;

		const existing = await db.select().from(table.user).where(eq(table.user.username, username));
		if (existing.length > 0)
			return fail(400, {
				form: {
					...form,
					message: 'Username already taken'
				}
			});

		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			const res = await db
				.insert(table.user)
				.values({ username, passwordHash })
				.returning({ id: table.user.id });

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, res[0].id);

			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			console.error(e);

			return fail(500, {
				form: {
					...form,
					message: 'An error occurred while creating your account'
				}
			});
		}

		const redirectTo = event.url.searchParams.get('redirectTo') ?? '/';
		return redirect(302, redirectTo);
	}
};
