<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		title?: string | Snippet;
	}

	const { children, title }: Props = $props();
</script>

<div
	class="bg-surface-primary rounded-md border-border border-solid border p-8
            transition-colors ease-in-out"
>
	{#if title}
		{#if typeof title === 'string'}
			<h1 class="font-display font-bold text-2xl mb-4">
				{title}
			</h1>
		{:else}
			{@render title?.()}
		{/if}
	{/if}

	{@render children?.()}
</div>
