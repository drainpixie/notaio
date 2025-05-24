<script lang="ts">
	import IconPicker from './IconPicker.svelte';
	import { Search, Plus, Trash, Star } from 'lucide-svelte';
	import { store } from '$lib/stores/notes.svelte';
	import type { Note } from '$lib/server/db/schema';

	async function createNewNote() {
		await store.add().catch((error) => console.error('Failed to create note:', error));
	}

	async function deleteNote(id: string, event: MouseEvent) {
		event.stopPropagation();

		if (confirm('Are you sure you want to delete this note?')) {
			await store
				.delete(id)
				.then(() => store.clearError())
				.catch((error) => console.error('Failed to delete note:', error));
		}
	}

	function handleNoteClick(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		const note = store.notes.find((n) => n.id === button.value);

		if (note) store.active(note);
	}

	function handleTitleEdit(note: Note, event: Event) {
		const span = event.currentTarget as HTMLSpanElement;
		const newTitle = span.textContent ?? 'Untitled';

		if (newTitle !== note.title) {
			store.update(note.id, { title: newTitle });
		}
	}

	function handleIconChange(note: Note, icon: string) {
		store.update(note.id, { icon });
	}

	function handleTitleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			(event.currentTarget as HTMLElement).blur();
		}
	}
</script>

<div
	class="fixed top-0 left-0 w-40 h-full bg-surface-primary text-fg-primary border-r border-border
            z-50 flex flex-col transition-colors ease-modern"
>
	<div class="flex flex-col mt-13">
		<div class="flex items-center justify-center">
			<button
				class="muted group ease-modern duration-200 transition-colors"
				onclick={createNewNote}
			>
				<Plus class="group-hover:[&>*]:text-green-400" size={16} />
			</button>
			<button
				class="muted group ease-modern duration-200 transition-colors"
				onclick={(event) => deleteNote(store.activeNote.id, event)}
			>
				<Trash class="group-hover:[&>*]:text-red-400" size={16} />
			</button>
			<button
				class="muted group ease-modern duration-200 transition-colors"
				onclick={() => store.pin(store.activeNote.id)}
			>
				<Star class="group-hover:[&>*]:text-yellow-400" size={16} />
			</button>
		</div>

		<button class="muted" onclick={() => alert('TODO:')}>
			<Search size={16} />
			<span>Search</span>
		</button>

		{#each store.sorted as note (note.id)}
			<button
				class:active={note.id === store.activeNote.id}
				onclick={handleNoteClick}
				aria-label={note.title}
				title={note.title}
				value={note.id}
				class={note.pinned ? 'pinned' : ''}
			>
				<IconPicker
					onIconChange={(icon: string) => handleIconChange(note, icon)}
					selectedIcon={note.icon}
				/>

				<span
					spellcheck="false"
					role="textbox"
					tabindex="-1"
					class="outline-none caret-accent"
					contenteditable
					onblur={(event) => handleTitleEdit(note, event)}
					onkeydown={handleTitleKeydown}>{note.title}</span
				>
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

	button.pinned {
		@apply font-bold;
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
