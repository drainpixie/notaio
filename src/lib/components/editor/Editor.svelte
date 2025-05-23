<script lang="ts">
	import { PROCESSOR } from '$lib';
	import type { Note } from '$lib/server/db/schema';
	import { createStack, execute, redo, undo, can } from '@pixie/rekishi';
	import { onMount, tick } from 'svelte';
	import EditorToolbar from './EditorToolbar.svelte';
	import EditorTextarea from './EditorTextarea.svelte';
	import EditorPreview from './EditorPreview.svelte';

	interface EditorState {
		stack: ReturnType<typeof createStack<string>>;
		mode: 'preview' | 'write';
		prevNoteId: string;
		parsed: string;
		last: string;
	}

	interface Props {
		note: Note;
	}

	let { note = $bindable() }: Props = $props();

	let textarea: HTMLTextAreaElement | undefined = $state();

	let editor: EditorState = $state({
		stack: createStack<string>(note.content, { maxStackSize: 100 }),
		last: note.content,
		mode: 'preview',
		prevNoteId: note.id,
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
			note.content = editor.stack.current;
			editor.last = editor.stack.current;
		}
	}

	function handleRedo() {
		if (can.redo(editor.stack)) {
			editor.stack = redo(editor.stack);
			note.content = editor.stack.current;
			editor.last = editor.stack.current;
		}
	}

	function handleTextChange(newText: string) {
		if (newText !== editor.last) {
			editor.stack = changeText(editor.last, newText);
			editor.last = newText;
		}

		note.content = newText;
	}

	function handleModeChange(newMode: 'preview' | 'write') {
		editor.mode = newMode;
	}

	function handleMarkdownInsert(prefix: string, suffix: string) {
		if (!textarea) return;

		const old = note.content;
		const { selectionStart: start, selectionEnd: end } = textarea;
		const selectedText = note.content.substring(start, end);
		const newText =
			note.content.substring(0, start) +
			prefix +
			selectedText +
			suffix +
			note.content.substring(end);

		note.content = newText;
		editor.stack = changeText(old, newText);
		editor.last = newText;

		textarea.focus();
		textarea.selectionStart = start + prefix.length;
		textarea.selectionEnd = start + prefix.length + selectedText.length;
	}

	$effect(() => {
		if (editor.mode === 'preview' && note.content !== '') {
			PROCESSOR.process(note.content).then((html) => (editor.parsed = html.toString()));
		}
	});

	$effect(() => {
		if (note.id !== editor.prevNoteId) {
			editor.stack = createStack<string>(note.content, { maxStackSize: 100 });
			editor.last = note.content;
			editor.prevNoteId = note.id;
		}
	});

	onMount(() => {
		tick();
	});
</script>

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
				bind:value={note.content}
				bind:textarea
				onTextChange={handleTextChange}
				onUndo={handleUndo}
				onRedo={handleRedo}
			/>
		{:else if editor.mode === 'preview'}
			<EditorPreview
				bind:text={note.content}
				html={editor.parsed}
				condition={note.content !== ''}
			/>
		{/if}
	</div>
</div>
