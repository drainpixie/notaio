<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		header: Snippet;
	}

	let { children, header }: Props = $props();
</script>

<div
	class="fixed top-0 left-0 w-40 h-full bg-surface-primary text-fg-primary border-r border-border
            z-50 flex flex-col transition-colors ease-in-out"
>
	<div class="flex flex-col mt-14">
		{@render header?.()}
		{@render children?.()}
	</div>
</div>
