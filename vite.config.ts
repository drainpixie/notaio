import { sveltekit } from '@sveltejs/kit/vite';
import { default as tailwindcss } from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: { fs: { allow: ['vendor'] } }
});
