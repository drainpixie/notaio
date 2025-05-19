<script lang="ts">
	import type { FullAutoFill, HTMLInputTypeAttribute } from 'svelte/elements';

	interface Props {
		autocomplete?: FullAutoFill;
		type: HTMLInputTypeAttribute;
		name: string;
		value: unknown;
		id?: string;
	}

	let { id, name, value = $bindable(null), ...rest }: Props = $props();
</script>

<div class="mb-4 flex flex-col">
	<label for={name} class="uppercase text-sm font-bold mb-2">{name}</label>
	<input
		class="bg-surface-primary text-fg-primary outline-none border border-border border-solid rounded-md p-2 transition-colors ease-in-out"
		{...rest}
		{id}
		{name}
		bind:value
	/>
</div>
