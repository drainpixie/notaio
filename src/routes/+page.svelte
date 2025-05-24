<script lang="ts">
	import Editor from '$lib/components/editor/Editor.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { PageData } from './$types';
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

<Sidebar {notes} bind:activeNote={activeNote} />

<div class="flex-col w-full h-full pl-40">
	<Editor bind:note={activeNote} />
</div>
