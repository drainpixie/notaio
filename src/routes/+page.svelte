<script lang="ts">
	import Editor from '$lib/components/editor/Editor.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { PageData } from './$types';
	import { notesStore, activeNote } from '$lib/stores/notes.svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	onMount(() => {
		notesStore.initialize(data.notes);
	});

	$effect(() => {
		document.title = $activeNote.title;
		return () => (document.title = 'Notaio');
	});
</script>

<Sidebar /> 

<div class="flex-col w-full h-full pl-40">
	{#if $activeNote}
		<Editor />
	{/if}
</div>
