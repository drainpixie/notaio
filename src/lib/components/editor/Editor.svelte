<script lang="ts">
	import { PROCESSOR } from '$lib';
	import { createStack, execute, redo, undo, can } from '@pixie/rekishi';
	import { onMount, tick } from 'svelte';
	import { notesStore, activeNote, notes } from '$lib/stores/notes.svelte';
	import EditorToolbar from './EditorToolbar.svelte';
	import EditorTextarea from './EditorTextarea.svelte';
	import EditorPreview from './EditorPreview.svelte';

	interface EditorState {
		stack: ReturnType<typeof createStack<string>>;
		mode: 'preview' | 'write';
		prevNoteId: string | null;
		parsed: string;
		last: string;
	}

	let textarea: HTMLTextAreaElement | undefined = $state();

	let editor: EditorState = $state({
		stack: createStack<string>($activeNote.content, { maxStackSize: 100 }),
		last: $activeNote.content,
		mode: 'preview',
		prevNoteId: $activeNote.id,
		parsed: ''
	});

	function changeText(old: string, newText: string): typeof editor.stack {
		return execute(editor.stack, {
			execute: () => newText,
			undo: () => old
		});
	}

	function handleUndo() {
		if (can.undo(editor.stack)) {
			editor.stack = undo(editor.stack);
			const newContent = editor.stack.current;
			editor.last = newContent;

			notesStore.update($activeNote.id, { content: newContent });
		}
	}

	function handleRedo() {
		if (can.redo(editor.stack)) {
			editor.stack = redo(editor.stack);
			const newContent = editor.stack.current;
			editor.last = newContent;

			notesStore.update($activeNote.id, { content: newContent });
		}
	}

	function handleTextChange(newText: string) {
		if (newText !== editor.last) {
			editor.stack = changeText(editor.last, newText);
			editor.last = newText;
		}

		notesStore.update($activeNote.id, { content: newText });
	}

	function handleModeChange(newMode: 'preview' | 'write') {
		editor.mode = newMode;
	}

	function handleMarkdownInsert(prefix: string, suffix: string) {
		if (!textarea) return;

		const old = $activeNote.content;
		const { selectionStart: start, selectionEnd: end } = textarea;
		const selectedText = $activeNote.content.substring(start, end);
		const newText =
			$activeNote.content.substring(0, start) +
			prefix +
			selectedText +
			suffix +
			$activeNote.content.substring(end);

		editor.stack = changeText(old, newText);
		editor.last = newText;

		notesStore.update($activeNote.id, { content: newText });

		textarea.focus();
		textarea.selectionStart = start + prefix.length;
		textarea.selectionEnd = start + prefix.length + selectedText.length;
	}

	$effect(() => {
		if (editor.mode === 'preview' && $activeNote?.content && $activeNote.content !== '') {
			PROCESSOR.process($activeNote.content).then((html) => (editor.parsed = html.toString()));
		}
	});

	$effect(() => {
		if ($activeNote && $activeNote.id !== editor.prevNoteId) {
			editor.stack = createStack<string>($activeNote.content || '', { maxStackSize: 100 });
			editor.last = $activeNote.content || '';
			editor.prevNoteId = $activeNote.id;
		}
	});

	onMount(() => {
		tick();
	});
</script>

{#if $activeNote}
	<div class="bg-surface-primary">
		<EditorToolbar
			mode={editor.mode}
			canUndo={can.undo(editor.stack)}
			canRedo={can.redo(editor.stack)}
			hasTextarea={!!textarea}
			onModeChange={handleModeChange}
			onMarkdownInsert={handleMarkdownInsert}
			onUndo={handleUndo}
			onRedo={handleRedo}
		/>

		<div
			class="flex p-4 bg-surface-primary text-fg-primary text-base w-full relative transition-colors ease-modern"
		>
			{#if editor.mode === 'write'}
				<EditorTextarea
					value={$activeNote.content}
					bind:textarea
					onTextChange={handleTextChange}
					onUndo={handleUndo}
					onRedo={handleRedo}
				/>
			{:else if editor.mode === 'preview'}
				<EditorPreview
					text={$activeNote.content}
					html={editor.parsed}
					condition={$activeNote.content !== ''}
				/>
			{/if}
		</div>
	</div>
{:else}
	<div class="bg-surface-primary p-4 text-fg-secondary text-center">No note selected</div>
{/if}
