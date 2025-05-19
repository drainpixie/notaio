import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	username: z
		.string()
		.min(3)
		.max(30)
		.trim()
		.regex(/^[a-zA-Z0-9]+$/),
	password: z.string().min(6).max(30).trim()
});

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const redirectTo = event.url.searchParams.get('redirectTo') || '/';
		return redirect(302, redirectTo);
	}

	return {
		redirectTo: event.url.searchParams.get('redirectTo') || '/'
	};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const form = schema.safeParse({ username, password });

		if (!form.success)
			return fail(400, {
				errors: form.error.flatten().fieldErrors,
				values: { username },
				message: 'Invalid form data'
			});

		const results = await db.select().from(table.user).where(eq(table.user.username, username));

		const existing = results.at(0);
		if (!existing)
			return fail(400, {
				values: { username },
				message: 'Incorrect username or password'
			});

		const valid = await verify(existing.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!valid)
			return fail(400, {
				values: { username },
				message: 'Incorrect username or password'
			});

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existing.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		const redirectTo = event.url.searchParams.get('redirectTo') ?? '/';
		return redirect(302, redirectTo);
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const form = schema.safeParse({ username, password });

		if (!form.success)
			return fail(400, {
				errors: form.error.flatten().fieldErrors,
				values: { username },
				message: 'Invalid form data'
			});

		const existing = await db.select().from(table.user).where(eq(table.user.username, username));

		if (existing.length > 0)
			return fail(400, {
				values: { username },
				message: 'Username already taken'
			});

		const id = generateUserID();
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			await db.insert(table.user).values({ id, username, passwordHash });

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, id);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			return fail(500, {
				values: { username },
				message: 'An error occurred while creating your account'
			});
		}

		const redirectTo = event.url.searchParams.get('redirectTo') ?? '/';
		return redirect(302, redirectTo);
	}
};

function generateUserID() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
