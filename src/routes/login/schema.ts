import { z } from 'zod';

export const schema = z.object({
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters')
		.max(30, 'Username must be at most 30 characters')
		.trim(),
	password: z
		.string()
		.min(6, 'Password must be at least 6 characters')
		.max(30, 'Password must be at most 30 characters')
		.trim()
});
