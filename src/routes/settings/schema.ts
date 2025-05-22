import { z } from 'zod';

const apiKeySchema = z
	.string()
	.startsWith('sk-')
	.length(51) // "sk-" (3 chars) + 48 alphanumeric = 51 total
	.refine((key) => /^[a-zA-Z0-9]+$/.test(key.slice(3)), {
		message: "API key must contain only alphanumeric characters after 'sk-'"
	});

export const schema = z.object({
	apiKey: apiKeySchema,
	baseURL: z.string().url(),
	authorizationHeader: z.string()
});
