<script lang="ts">
	import Editor from '$lib/components/editor/Editor.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Search, SortAsc } from 'lucide-svelte';
	import type { PageData } from './$types';
	import IconPicker from '$lib/components/IconPicker.svelte';
	import { debounce } from '$lib';
	import equal from 'fast-deep-equal';
	import type { Note } from '$lib/server/db/schema';

	interface Props {
		data: PageData;

		title: string;
		icon: string;
	}

	let { data }: Props = $props();

	let notes = $state(data.notes);
	let activeNote = $state(notes[0]);

	function handleNoteClick(event: MouseEvent) {
		const id = (event.currentTarget as HTMLButtonElement).value;
		const note = notes.find((note) => note.id === id);

		if (note) activeNote = note;
	}

	const save = debounce(async () => {
		const changed: Note[] = notes.filter((note, i) => !equal(note, data.notes[i]));
		if (changed.length === 0) return;

		const body = new FormData();
		body.append('notes', JSON.stringify(changed));

		await fetch('?/save', {
			method: 'POST',
			body
		});
	}, 1000);

	$effect(() => {
		document.title = activeNote.title ?? 'Notaio';

		// TODO: Find more idiomatic way to trigger reactivity
		Object.entries(activeNote);
		save();

		return () => (document.title = 'Notaio');
	});
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

	{#each notes as note (note.id)}
		<button
			class:active={note.id === activeNote.id}
			onclick={handleNoteClick}
			aria-label={note.title}
			title={note.title}
			value={note.id}
		>
			<IconPicker bind:selectedIcon={note.icon} />
			<span
				bind:textContent={note.title}
				spellcheck="false"
				class="outline-none caret-accent"
				contenteditable
			></span>
		</button>
	{/each}
</Sidebar>

<div class="flex-col w-full h-full pl-40">
	<Editor bind:note={activeNote} />
</div>

<style lang="postcss">
	@reference "../app.css";

	button {
		@apply bg-transparent text-fg-primary border-none 
           m-1.5 p-2 rounded-md cursor-pointer transition-all
           ease-modern text-xs font-normal font-display 
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
