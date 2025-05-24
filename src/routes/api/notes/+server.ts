import { MARKDOWN_DEFAULT_VALUE } from '$lib';
import { validateSessionFromCookies } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { note as table } from '$lib/server/db/schema';

import { error, json, type RequestHandler } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const note = z
    .object({
        icon: z.string().default('FileQuestion'),
        title: z.string().default('Untitled'),
        content: z.string().default(MARKDOWN_DEFAULT_VALUE),
        tags: z.array(z.string())
    })
    .partial();

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { user } = await validateSessionFromCookies(cookies);
    if (!user) return error(401, { message: 'Unauthorized' });

    const formData = await request.formData();
    const noteData = note.parse(Object.fromEntries(formData));

    const data = await db
        .insert(table)
        .values({
            userId: user.id,
            content: MARKDOWN_DEFAULT_VALUE,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...noteData
        })
        .returning()
        .execute();

    return json(data[0]);
};

export const GET: RequestHandler = async ({ params, cookies }) => {
    const { user } = await validateSessionFromCookies(cookies);
    if (!user) return error(401, { message: 'Unauthorized' });

    const { id } = params;
    if (!id) return error(400, { message: 'Invalid note ID' });

    const note = await db
        .select()
        .from(table)
        .where(and(eq(table.id, id), eq(table.userId, user.id)))
        .limit(1)
        .execute();

    if (!note) return error(404, { message: 'Note not found' });
    return json(note);
};

export const DELETE: RequestHandler = async ({ url, cookies }) => {
    const { user } = await validateSessionFromCookies(cookies);
    if (!user) return error(401, { message: 'Unauthorized' });

    const id = url.searchParams.get('id');
    if (!id) return error(400, { message: 'Invalid note ID' });

    const note = await db
        .select()
        .from(table)
        .where(and(eq(table.id, id), eq(table.userId, user.id)))
        .limit(1)
        .execute();

    if (!note) return error(404, { message: 'Note not found' });

    await db.delete(table).where(eq(table.id, id)).execute();
    return json(note);
};
