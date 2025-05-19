<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		form: Record<string, unknown> | null;
		class?: string;
	}

	const { children, form, ...rest }: Props = $props();
</script>

<div class="bg-surface-primary rounded-md p-8 transition-colors ease-in-out" {...rest}>
	{@render children?.()}

	{#if form?.message}
		<div
			class={`p-2 ${form?.success ? 'bg-green-200 border-green-400' : 'bg-red-200 border-red-400'} border-l-4 mt-4`}
			role="alert"
		>
			<p class="!text-fg-primary !font-bold !text-lg !font-display">{form?.message}</p>
			{#if form?.errors}
				<ul>
					{#each Object.entries(form.errors) as [key, value] (key)}
						<li>
							<span class="uppercase font-bold text-sm">{key}</span>
							<span class="text-md">{value}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>
