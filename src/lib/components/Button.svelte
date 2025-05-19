<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onclick?: (event: MouseEvent) => void;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		href?: string;
		iconL?: Snippet;
		iconR?: Snippet;
		children: Snippet;
		class?: string;
	}

	const { onclick, disabled, type, href, children, iconL, iconR, ...others }: Props = $props();

	function handleClick(event: MouseEvent) {
		if (!disabled) onclick?.(event);
	}

	const isLink = $derived(typeof href === 'string');
</script>

{#if isLink}
	<a {href} onclick={handleClick} {...others}>
		{@render iconL?.()}
		{@render children?.()}
		{@render iconR?.()}
	</a>
{:else}
	<button {type} {disabled} onclick={handleClick} {...others}>
		{@render iconL?.()}
		{@render children?.()}
		{@render iconR?.()}
	</button>
{/if}

<style lang="postcss">
	@reference "../../app.css";

	button,
	a {
		@apply inline-flex items-center justify-center gap-2 p-3 
			   border-solid rounded-md font-inherit text-base font-medium 
			   !cursor-pointer transition-colors no-underline border border-border
			   text-fg-primary bg-surface-primary hover:bg-surface-secondary;
	}
</style>
