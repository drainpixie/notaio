<script lang="ts">
	import { getTheme, toggleTheme } from '$lib/stores/theme.svelte';
	import { Moon, Sun } from 'lucide-svelte';

	const { id } = $props();
</script>

<button {id} onclick={toggleTheme} aria-label="Toggle theme">
	{#if getTheme() === 'dark'}
		<Sun size={16} />
	{:else}
		<Moon size={16} />
	{/if}
</button>
