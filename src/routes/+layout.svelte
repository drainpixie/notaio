<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { getTheme, initHighlighting, initTheme, toggleTheme } from '$lib/stores/theme.svelte.js';
	import { CommandBar, type Command } from '@drainpixie/moji';

	import '../app.css';
	import { Home, Moon, Pin, Plus, Sun, Trash } from '@lucide/svelte';
	import { store } from '$lib/stores/notes.svelte';
	import { getLucideIcon } from '$lib';
	import { goto } from '$app/navigation';

	const { data, children } = $props();

	$effect(() => {
		initTheme();
		initHighlighting();
	});

	const commands: Command[] = $derived([
		{
			text: 'Home',
			trigger: () => goto('/'),
			icon: Home,
			category: 'navigation',
			hotkey: ['h']
		},
		{
			text: 'Create',
			trigger: () => store.add(),
			icon: Plus,
			category: 'actions',
			hotkey: ['ctrl', 'c']
		},
		{
			text: 'Delete',
			trigger: () => store.delete(store.activeNote.id),
			icon: Trash,
			category: 'actions',
			hotkey: ['ctrl', 'd']
		},
		{
			text: 'Pin',
			trigger: () => store.pin(store.activeNote.id),
			icon: Pin,
			category: 'actions',
			hotkey: ['ctrl', 'p']
		},
		{
			text: 'Theme',
			trigger: () => toggleTheme(),
			icon: getTheme() === 'dark' ? Moon : Sun,
			category: 'actions'
		},

		...store.sorted.map((note) => ({
			text: note.title,
			trigger: () => store.active(note),
			icon: getLucideIcon(note.icon),
			category: 'notes'
		}))
	]);
</script>

<Navbar user={data.user} />
<CommandBar {commands} />

<main class="flex flex-col h-[calc(100vh-var(--navbar-height))] items-center justify-center">
	{@render children?.()}
</main>

<style lang="postcss">
	@reference "../app.css";

	:global {
		[data-command-bar-overlay] {
			@apply flex items-center justify-center min-w-screen min-h-screen;
		}

		[data-command-bar] {
			@apply w-full max-w-md rounded-lg shadow-lg bg-surface-primary border border-border;
		}

		[data-command-bar-content] {
			@apply flex flex-col p-2;
		}

		[data-command-bar-item] {
			@apply flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium 
		   text-fg-primary transition-colors hover:bg-surface-secondary 
		   focus:bg-surface-secondary focus:outline-none ease-modern;
		}

		[data-command-bar-item].selected {
			@apply bg-surface-secondary;
		}

		[data-command-bar-icon] {
			@apply flex h-4 w-4 items-center text-fg-secondary;
		}

		[data-command-bar-text] {
			@apply flex-1 leading-none;
		}

		[data-command-bar-hotkey] {
			@apply rounded-md border border-border bg-surface-secondary px-2 py-1 
		   text-xs font-semibold text-fg-secondary;
		}

		[data-command-bar-category-title] {
			@apply pl-1 text-xs font-semibold text-fg-secondary capitalize;
		}

		[data-command-bar-search-input] {
			@apply w-full rounded-md border border-border bg-surface-primary 
		   px-2 py-1.5 text-sm font-semibold text-fg-primary;
		}
	}
</style>
