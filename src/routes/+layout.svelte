<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { initHighlighting, initTheme } from '$lib/stores/theme.svelte.js';
	import { CommandBar, type Command } from '@drainpixie/moji';

	import '../app.css';
	import { Home, Plus } from '@lucide/svelte';

	const { data, children } = $props();

	$effect(() => {
		initTheme();
		initHighlighting();
	});

	const commands = [
		{
			text: 'Home',
			trigger: () => console.log('Home'),
			icon: Home,
			category: 'navigation',
			hotkey: ['h']
		},
		{ text: 'Create', trigger: () => console.log('Create'), icon: Plus, category: 'actions' }
	];
</script>

<Navbar user={data.user} />
<CommandBar {commands} />

<main class="flex flex-col h-[calc(100vh-var(--navbar-height))] items-center justify-center">
	{@render children?.()}
</main>
