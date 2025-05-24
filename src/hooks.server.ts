import * as auth from '$lib/server/auth.js';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const publicPaths = ['/login', '/api/', '/favicon.png', '/_app/'];

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	const path = event.url.pathname;

	const isPublicPath = publicPaths.some(
		(publicPath) => path === publicPath || path.startsWith(publicPath)
	);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;

		if (!isPublicPath) throw redirect(302, `/login?redirectTo=${encodeURIComponent(path)}`);

		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		event.locals.user = user;
		event.locals.session = session;
	} else {
		auth.deleteSessionTokenCookie(event);
		event.locals.user = null;
		event.locals.session = null;

		if (!isPublicPath) throw redirect(302, `/login?redirectTo=${encodeURIComponent(path)}`);
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleAuth);
