<script lang="ts">
	import { MARKDOWN_DEFAULT_VALUE, PROCESSOR } from '$lib';
	import type { Note } from '$lib/server/db/schema';
	import { createStack, execute, redo, undo, can } from '@pixie/rekishi';
	import { onMount, tick } from 'svelte';
	import EditorToolbar from './EditorToolbar.svelte';
	import EditorTextarea from './EditorTextarea.svelte';
	import EditorPreview from './EditorPreview.svelte';

	interface EditorState {
		stack: ReturnType<typeof createStack<string>>;
		last: string;
		mode: 'preview' | 'write';
		prevNoteId: string;
		parsed: string;
	}

	interface Props {
		text: string;
		note: Note;
	}

	let { text = $bindable(MARKDOWN_DEFAULT_VALUE), note = $bindable() }: Props = $props();

	let textarea: HTMLTextAreaElement | undefined = $state();

	let editor: EditorState = $state({
		stack: createStack<string>(text, { maxStackSize: 100 }),
		last: text,
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
			text = editor.stack.current;
			editor.last = editor.stack.current;
		}
	}

	function handleRedo() {
		if (can.redo(editor.stack)) {
			editor.stack = redo(editor.stack);
			text = editor.stack.current;
			editor.last = editor.stack.current;
		}
	}

	function handleTextChange(newText: string) {
		if (newText !== editor.last) {
			editor.stack = changeText(editor.last, newText);
			editor.last = newText;
		}
		text = newText;
	}

	function handleModeChange(newMode: 'preview' | 'write') {
		editor.mode = newMode;
	}

	function handleMarkdownInsert(prefix: string, suffix: string) {
		if (!textarea) return;

		const old = text;
		const { selectionStart: start, selectionEnd: end } = textarea;
		const selectedText = text.substring(start, end);
		const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);

		text = newText;
		editor.stack = changeText(old, newText);
		editor.last = newText;

		textarea.focus();
		textarea.selectionStart = start + prefix.length;
		textarea.selectionEnd = start + prefix.length + selectedText.length;
	}

	$effect(() => {
		if (editor.mode === 'preview' && text !== '') {
			PROCESSOR.process(text).then((html) => (editor.parsed = html.toString()));
		}
	});

	$effect(() => {
		if (note.id !== editor.prevNoteId) {
			editor.stack = createStack<string>(text, { maxStackSize: 100 });
			editor.last = text;
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
				bind:value={text}
				bind:textarea
				onTextChange={handleTextChange}
				onUndo={handleUndo}
				onRedo={handleRedo}
			/>
		{:else if editor.mode === 'preview'}
			<EditorPreview {text} html={editor.parsed} condition={text !== ''} />
		{/if}
	</div>
</div>
