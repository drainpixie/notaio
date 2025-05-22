<!-- TODO: DOMPurify -->
<!-- TODO: Split in multiple components -->
<!-- Auto-updating WYSIWYG for title, content, and settings -->

<script lang="ts">
	import { KATEX_REGEX, MARKDOWN_DEFAULT_VALUE, PROCESSOR } from '$lib';
	import type { Note } from '$lib/server/db/schema';
	import { can, createStack, execute, redo, undo } from '@pixie/rekishi';
	import hljs from 'highlight.js';
	import {
		Bold,
		Book,
		Code,
		Heading,
		type Icon,
		Italic,
		Link,
		List,
		ListChecks,
		ListOrdered,
		Pencil,
		Quote,
		Settings,
		Strikethrough
	} from 'lucide-svelte';
	import { onMount, tick } from 'svelte';
	import Tooltip from '../Tooltip.svelte';
	import EditorHighlighter from './EditorHighlighter.svelte';
	import Markdown from './Markdown.svelte';

	interface ToolbarButton {
		icon: typeof Icon;
		name: string;

		prefix: string;
		suffix: string;
	}

	interface State {
		stack: ReturnType<typeof createStack<string>>;
		last: string;
		mode: string;
		prevNoteId: string;
		parsed: string;
		highlighted: string;
	}

	interface Props {
		text: string;
		note: Note;
		settingsOpen: boolean;
		textarea?: HTMLTextAreaElement;
	}

	const ACTIONS: ToolbarButton[] = [
		{ name: 'Code', icon: Code, prefix: '```lang ', suffix: '```' },
		{ name: 'Link', icon: Link, prefix: '[', suffix: '](url)' },
		{ name: 'Bold', icon: Bold, prefix: '**', suffix: '**' },
		{ name: 'List', icon: List, prefix: '- ', suffix: '' },
		{ name: 'Quote', icon: Quote, prefix: '> ', suffix: '' },
		{ name: 'Italic', icon: Italic, prefix: '*', suffix: '*' },
		{ name: 'Heading', icon: Heading, prefix: '# ', suffix: '' },
		{ name: 'Checklist', icon: ListChecks, prefix: '- [ ] ', suffix: '' },
		{ name: 'OrderedList', icon: ListOrdered, prefix: '1. ', suffix: '' },
		{ name: 'Strikethrough', icon: Strikethrough, prefix: '~~', suffix: '~~' }
	];

	let {
		text = $bindable(MARKDOWN_DEFAULT_VALUE),
		note = $bindable(),
		textarea = $bindable<HTMLTextAreaElement>(),
		settingsOpen = $bindable(false)
	}: Props = $props();

	let { stack, last, mode, prevNoteId, parsed, highlighted }: State = $state({
		stack: createStack<string>(text, { maxStackSize: 100 }),
		last: text,
		mode: 'preview',
		prevNoteId: note.id,
		highlighted: '',
		parsed: ''
	});

	const changeText = (old: string, _new: string): typeof stack =>
		execute(stack, {
			execute: () => _new,
			undo: () => old
		});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.repeat) return;

		const isUndo = event.key === 'z' && (event.ctrlKey || event.metaKey);
		const isRedo = event.key === 'y' && (event.ctrlKey || event.metaKey);

		if (isUndo || isRedo) {
			event.preventDefault();

			if (isUndo && can.undo(stack)) {
				stack = undo(stack);
				text = stack.current;
				last = stack.current;
				updateHighlight();
			} else if (isRedo && can.redo(stack)) {
				stack = redo(stack);
				text = stack.current;
				last = stack.current;
				updateHighlight();
			}
		}
	}

	function handleTextChange(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		const newText = target.value;
		const position = target.selectionStart;
		const beforeCursor = newText.substring(0, position);
		const cursor = beforeCursor.split('\n').pop()?.split(' ').pop() ?? '';

		if (cursor.startsWith('/')) {
			const name = cursor.substring(1).toLowerCase();
			const match = ACTIONS.find((action) => action.name.toLowerCase() === name);

			if (match) {
				event.preventDefault();

				const start = beforeCursor.lastIndexOf(cursor);
				const end = start + cursor.length;

				const beforeCommand = newText.substring(0, start);
				const afterCommand = newText.substring(end);

				applyMarkdown(beforeCommand, match.prefix, match.suffix, afterCommand, newText, start);

				return;
			}
		}

		if (newText !== last) {
			stack = changeText(last, newText);
			last = newText;
		}

		updateHighlight();
	}

	function applyMarkdown(
		before: string,
		prefix: string,
		suffix: string,
		after: string,
		oldText: string,
		cursorPos: number
	) {
		const newValue = before + prefix + suffix + after;

		text = newValue;
		stack = changeText(oldText, newValue);
		last = newValue;

		if (textarea) {
			textarea.value = newValue;
			const newCursorPos = cursorPos + prefix.length;
			textarea.selectionStart = newCursorPos;
			textarea.selectionEnd = newCursorPos;
			textarea.focus();
		}

		updateHighlight();
	}

	function insertMarkdown(prefix: string, suffix: string) {
		if (!textarea) return;

		const old = text;
		const { selectionStart: start, selectionEnd: end } = textarea;
		const selectedText = text.substring(start, end);
		const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);

		text = newText;
		stack = changeText(old, newText);
		last = newText;

		textarea.focus();
		textarea.selectionStart = start + prefix.length;
		textarea.selectionEnd = start + prefix.length + selectedText.length;

		updateHighlight();
	}

	function syncScroll(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		const scrollTop = target.scrollTop;
		const scrollHeight = target.scrollHeight;
		const clientHeight = target.clientHeight;

		if (scrollTop + clientHeight >= scrollHeight) {
			target.scrollTop = scrollHeight - clientHeight;
		}
	}

	function updateHighlight() {
		const segments = [];
		let currentPos = 0;
		let match: RegExpExecArray | null = null;

		KATEX_REGEX.lastIndex = 0;

		while ((match = KATEX_REGEX.exec(text)) !== null) {
			if (match.index > currentPos) {
				segments.push({
					type: 'markdown',
					content: text.substring(currentPos, match.index)
				});
			}

			segments.push({
				type: 'math',
				content: match[0]
			});

			currentPos = match.index + match[0].length;
		}

		if (currentPos < text.length) {
			segments.push({
				type: 'markdown',
				content: text.substring(currentPos)
			});
		}

		let highlightedHTML = '';

		for (const { type, content } of segments) {
			if (type === 'markdown')
				highlightedHTML += hljs.highlight(content, {
					language: 'markdown'
				}).value;
			else
				highlightedHTML += `<span class="hljs language-katex">${hljs.highlight(content, { language: 'latex' }).value}</span>`;
		}

		const doc = Document.parseHTMLUnsafe(highlightedHTML);
		processCodeBlocks(doc);

		highlighted = doc.body.innerHTML.replace(/\n/g, '<br>');
	}

	function processCodeBlocks(doc: Document) {
		for (const span of doc.querySelectorAll('span.hljs-code')) {
			const spanText = span.textContent ?? '';
			const match = spanText.match(/^```(\w*)\n([\s\S]*?)```$/);

			if (match) {
				const [, lang, code] = match;
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				const innerHtml = hljs.highlight(code, { language }).value;

				const fragment = document.createDocumentFragment();

				const openFence = document.createElement('span');
				openFence.className = 'fence backticks';
				openFence.textContent = `\`\`\`${lang}\n`;
				fragment.appendChild(openFence);

				const pre = document.createElement('pre');
				pre.className = `hljs language-${language}`;
				const codeEl = document.createElement('code');
				codeEl.innerHTML = innerHtml;
				pre.appendChild(codeEl);
				fragment.appendChild(pre);

				const closeFence = document.createElement('span');
				closeFence.className = 'fence backticks';
				closeFence.textContent = '```';
				fragment.appendChild(closeFence);

				span.replaceWith(fragment);
			}
		}
	}

	const onclickMode = (event: MouseEvent) => {
		const target = event.currentTarget as HTMLButtonElement;
		mode = target.getAttribute('aria-label')?.toLowerCase() ?? 'write';
	};

	$effect(() => {
		if (mode === 'preview' && text !== '') {
			PROCESSOR.process(text).then((html) => (parsed = html.toString()));
		}
	});

	$effect(() => {
		if (note.id !== prevNoteId) {
			stack = createStack<string>(text, { maxStackSize: 100 });
			last = text;
			prevNoteId = note.id;
			updateHighlight();
		} else if (text !== last) {
			updateHighlight();
		}
	});

	onMount(() => {
		tick().then(() => {
			updateHighlight();
		});
	});
</script>

<div class="bg-surface-primary">
	<div
		class="flex justify-between items-center p-2 bg-surface-primary border-border border-b border-solid transition-colors ease-in-out"
	>
		<div class="flex items-center gap-2">
			<Tooltip text="Preview">
				<button
					class:active={mode === 'preview'}
					class="toolbar-button"
					onclick={onclickMode}
					type="button"
					aria-label="Preview"
					title="Preview"
				>
					<Book size={16} />
				</button>
			</Tooltip>
			<Tooltip text="Write">
				<button
					class:active={mode === 'write'}
					class="toolbar-button"
					onclick={onclickMode}
					type="button"
					aria-label="Write"
					title="Write"
				>
					<Pencil size={16} />
				</button>
			</Tooltip>
			<Tooltip text="Settings">
				<button
					onclick={() => (settingsOpen = !settingsOpen)}
					type="button"
					aria-label="Settings"
					title="Settings"
					class="toolbar-button"
				>
					<Settings size={16} />
				</button>
			</Tooltip>
		</div>

		<div class="flex items-center gap-2">
			{#each ACTIONS as { icon, name, suffix, prefix } (name)}
				{@const Icon = icon}
				<Tooltip text={name}>
					<button
						onclick={() => insertMarkdown(suffix, prefix)}
						aria-label={name}
						title={name}
						class="toolbar-button"
						class:disabled={!textarea}
					>
						<Icon size={16} class="icon" aria-hidden="true" />
					</button>
				</Tooltip>
			{/each}
		</div>
	</div>

	<div
		class="flex p-4 bg-surface-primary text-fg-primary text-base w-full relative transition-colors ease-in-out"
	>
		{#if mode === 'write'}
			{@const focus = () => window.getSelection()?.toString() && textarea.focus()}
			<div class="relative w-full" role="textbox" tabindex="-1" onclick={focus} onkeydown={focus}>
				<EditorHighlighter {highlighted} />

				<textarea
					id="markdown"
					class="whitespace-pre-wrap break-words font-mono leading-normal relative w-full resize-none transition-colors ease-in-out field-sizing-content caret-accent bg-transparent text-transparent z-10 focus:outline-none"
					bind:value={text}
					bind:this={textarea}
					onscroll={(e) => syncScroll(e)}
					oninput={handleTextChange}
					onkeydown={handleKeyDown}
					placeholder="Type your markdown here..."
					autocapitalize="off"
					autocomplete="off"
					translate="no"
					spellcheck="false"
				></textarea>
			</div>
		{:else if mode === 'preview'}
			<Markdown {text} html={parsed} condition={text !== ''} />
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "../../../app.css";

	.toolbar-button {
		@apply border-none text-fg-primary cursor-pointer p-2 rounded-md 
	 		transition-colors ease-in-out flex items-center 
			justify-center text-base font-normal font-display;
	}

	.toolbar-button:hover {
		@apply bg-surface-secondary;
	}

	.toolbar-button.active {
		@apply bg-surface-secondary text-fg-primary font-semibold opacity-100;
	}

	.toolbar-button.disabled {
		@apply cursor-not-allowed text-fg-secondary;
	}
</style>
