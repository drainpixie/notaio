<script lang="ts">
	import { getLucideIcon } from '$lib';
	import Editor from '$lib/components/editor/Editor.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Search, SortAsc } from 'lucide-svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let activeNote = $state(data.notes[0]);

	function handleNoteClick(event: MouseEvent) {
		const id = (event.currentTarget as HTMLButtonElement).value;
		const note = data.notes.find((note) => note.id === id);

		if (note) activeNote = note;
	}
</script>

<Sidebar>
	{#snippet header()}
		<button class="muted" onclick={() => alert('TODO:')}>
			<Search size={16} />
			<span>Search</span>
		</button>
		<button class="muted" onclick={() => alert('TODO:')}>
			<SortAsc size={16} />
			<span>Sort</span>
		</button>
	{/snippet}

	{#each data.notes as note (note.id)}
		{@const Icon = getLucideIcon(note.icon)}

		<button
			class:active={note.id === activeNote.id}
			onclick={handleNoteClick}
			aria-label={note.title}
			title={note.title}
			value={note.id}
		>
			<Icon size={16} />
			<span>{note.title}</span>
		</button>
	{/each}
</Sidebar>

<div class="flex-col w-full h-full pl-40">
	<Editor text={activeNote.content} bind:note={activeNote} />
</div>

<style lang="postcss">
	@reference "../app.css";

	button {
		@apply bg-transparent text-fg-primary border-none 
           m-1.5 p-2 rounded-md cursor-pointer transition-all
           ease-in-out text-xs font-normal font-display 
           text-left flex items-center gap-2;

		@apply hover:bg-surface-secondary hover:text-fg-primary;
	}

	button.active {
		@apply bg-surface-secondary text-fg-primary;
	}

	span {
		@apply text-ellipsis overflow-hidden whitespace-nowrap flex-1 min-w-0;
	}

	.muted {
		@apply [&>*]:text-fg-secondary [&>*]:font-light;
	}

	.muted:hover {
		@apply [&>*]:text-fg-primary [&>*]:font-normal;
	}
</style>
