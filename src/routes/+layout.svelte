<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { initHighlighting, initTheme } from '$lib/stores/theme.svelte.js';

	import '../app.css';

	const { data, children } = $props();

	$effect(() => {
		initTheme();
		initHighlighting();
	});
</script>

<Navbar user={data.user} />

<main class="flex flex-col h-[calc(100vh-var(--navbar-height))] items-center justify-center">
	{@render children?.()}
</main>
