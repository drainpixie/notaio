<script lang="ts">
	import Editor from '$lib/components/editor/Editor.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { PageData } from './$types';
	import { store } from '$lib/stores/notes.svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	onMount(() => {
		store.initialize(data.notes);
	});

	$effect(() => {
		document.title = store.activeNote.title;
		return () => (document.title = 'Notaio');
	});
</script>

<Sidebar />

<div class="flex-col w-full h-full pl-40">
	{#if store.activeNote}
		<Editor />
	{/if}
</div>
