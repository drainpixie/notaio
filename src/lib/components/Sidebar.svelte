<script lang="ts">
	import type { Note } from '$lib/server/db/schema';
	import { Search, SortAsc } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import IconPicker from './IconPicker.svelte';

	interface Props {
		notes: Note[];
		activeNote: Note;
	}

	let { notes, activeNote = $bindable() }: Props = $props();

	function handleNoteClick(event: MouseEvent) {
		const id = (event.currentTarget as HTMLButtonElement).value;
		const note = notes.find((note) => note.id === id);

		if (note) activeNote = note;
	}
</script>

<div
	class="fixed top-0 left-0 w-40 h-full bg-surface-primary text-fg-primary border-r border-border
            z-50 flex flex-col transition-colors ease-modern"
>
	<div class="flex flex-col mt-14">
		<button class="muted" onclick={() => alert('TODO:')}>
			<Search size={16} />
			<span>Search</span>
		</button>
		<button class="muted" onclick={() => alert('TODO:')}>
			<SortAsc size={16} />
			<span>Sort</span>
		</button>

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
	</div>
</div>

<style lang="postcss">
	@reference "../../app.css";

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
