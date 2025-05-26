<script lang="ts">
	import { Pencil, Book, Undo, Redo } from '@lucide/svelte';
	import Tooltip from '../Tooltip.svelte';
	import { COMMANDS, type Command } from '$lib';

	interface Props {
		mode: 'preview' | 'write';
		canUndo: boolean;
		canRedo: boolean;
		hasTextarea: boolean;
		onModeChange: (mode: 'preview' | 'write') => void;
		onMarkdownInsert: (prefix: string, suffix: string) => void;
		onUndo: () => void;
		onRedo: () => void;
	}

	let {
		mode,
		canUndo,
		canRedo,
		hasTextarea,
		onModeChange,
		onMarkdownInsert,
		onUndo,
		onRedo
	}: Props = $props();

	function handleModeClick(event: MouseEvent) {
		const target = event.currentTarget as HTMLButtonElement;
		const newMode = target.getAttribute('aria-label')?.toLowerCase() as 'preview' | 'write';
		if (newMode) onModeChange(newMode);
	}

	function handleMarkdownClick(command: Command) {
		onMarkdownInsert(command.prefix, command.suffix);
	}
</script>

<div
	class="flex justify-between items-center p-2 bg-surface-primary border-border border-b border-solid transition-colors ease-modern"
>
	<div class="flex items-center gap-2">
		<Tooltip text="Preview">
			<button
				class:active={mode === 'preview'}
				class="toolbar-button"
				onclick={handleModeClick}
				type="button"
				aria-label="preview"
				title="Preview"
			>
				<Book size={16} />
			</button>
		</Tooltip>
		<Tooltip text="Write">
			<button
				class:active={mode === 'write'}
				class="toolbar-button"
				onclick={handleModeClick}
				type="button"
				aria-label="write"
				title="Write"
			>
				<Pencil size={16} />
			</button>
		</Tooltip>

		<div class="w-px h-6 bg-border mx-2 transition-colors ease-modern"></div>

		<Tooltip text="Undo">
			<button
				class="toolbar-button"
				class:disabled={!canUndo}
				onclick={onUndo}
				type="button"
				aria-label="Undo"
				title="Undo"
				disabled={!canUndo}
			>
				<Undo size={16} />
			</button>
		</Tooltip>
		<Tooltip text="Redo">
			<button
				class="toolbar-button"
				class:disabled={!canRedo}
				onclick={onRedo}
				type="button"
				aria-label="Redo"
				title="Redo"
				disabled={!canRedo}
			>
				<Redo size={16} />
			</button>
		</Tooltip>
	</div>

	<div class="flex items-center gap-2">
		{#each COMMANDS as command (command.name)}
			{@const CommandIcon = command.icon}
			<Tooltip text={command.name}>
				<button
					onclick={() => handleMarkdownClick(command)}
					aria-label={command.name}
					title={command.name}
					class="toolbar-button"
					class:disabled={!hasTextarea}
					disabled={!hasTextarea}
				>
					<CommandIcon size={16} class="icon" aria-hidden="true" />
				</button>
			</Tooltip>
		{/each}
	</div>
</div>

<style lang="postcss">
	@reference "../../../app.css";

	.toolbar-button {
		@apply border-none text-fg-primary cursor-pointer p-2 rounded-md 
	 		transition-colors ease-modern flex items-center 
			justify-center text-base font-normal font-display;
	}

	.toolbar-button:hover:not(:disabled) {
		@apply bg-surface-secondary;
	}

	.toolbar-button.active {
		@apply bg-surface-secondary text-fg-primary font-semibold opacity-100;
	}

	.toolbar-button.disabled,
	.toolbar-button:disabled {
		@apply cursor-not-allowed text-fg-secondary opacity-50;
	}
</style>
