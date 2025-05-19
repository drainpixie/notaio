<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Note } from '$lib/server/db/schema';
	import { Save, X } from 'lucide-svelte';
	import type { ActionData } from '../../../routes/login/$types';
	import Button from '../Button.svelte';
	import IconPicker from '../IconPicker.svelte';
	import Tooltip from '../Tooltip.svelte';

	interface Props {
		// TODO: Not used yet
		_form?: ActionData;
		open: boolean;
		note: Note;
	}

	let { _form, open = $bindable(), note = $bindable() }: Props = $props();
</script>

<form method="post" action="?/note-settings" use:enhance>
	<div class="form-group">
		<div class="form-group">
			<div class="label-container">
				<Tooltip text="Minimum 3 characters, alphanumeric only">
					<label for="title" class="form-label">Title</label>
				</Tooltip>
			</div>

			<input
				id="title"
				name="title"
				class="form-input"
				required
				placeholder="Title"
				value={note.title}
			/>
		</div>

		<div class="form-group" id="grouped">
			<div>
				<div class="label-container">
					<Tooltip text="Minimum 3 characters, alphanumeric only">
						<label for="tags" class="form-label">Tags</label>
					</Tooltip>
				</div>

				<input
					id="tags"
					name="tags"
					class="form-input"
					required
					placeholder="Tag1, Tag2, Tag3"
					value={note.tags}
				/>
			</div>

			<div>
				<div class="label-container">
					<Tooltip text="Minimum 3 characters, alphanumeric only">
						<label for="icon" class="form-label">Icon</label>
					</Tooltip>
				</div>

				<IconPicker bind:selectedIcon={note.icon} />
				<!-- <input
                        id="icon"
                        name="icon"
                        class="form-input"
                        required
                        placeholder="lucide.iconName"
                        value={note.icon}
                    /> -->
			</div>
		</div>
	</div>
</form>

<div class="button-container">
	<Button onclick={() => (open = false)}>
		{#snippet iconL()}
			<X size={16} />
		{/snippet}
		Close
	</Button>

	<Button onclick={() => (open = false)}>
		{#snippet iconL()}
			<Save size={16} />
		{/snippet}
		Save
	</Button>
</div>

<style>
	:global(.button-container) {
		display: flex;
		gap: 1rem;
	}

	:global(.button-container button:last-child) {
		flex: 1;
	}

	.label-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	#grouped {
		display: flex;
		gap: 1rem;
	}

	#grouped > div:last-child {
		flex: 1;
	}
</style>
