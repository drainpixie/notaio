<script lang="ts">
	import { CODE_BLOCK_REGEX, KATEX_REGEX } from '$lib';
	import EditorHighlighter from './EditorHighlighter.svelte';

	import hljs from 'highlight.js';
	import { onMount, tick } from 'svelte';

	interface Props {
		value: string;
		textarea: HTMLTextAreaElement | undefined;
		onTextChange: (text: string) => void;
		onUndo: () => void;
		onRedo: () => void;
	}

	interface Segment {
		type: 'markdown' | 'math';
		content: string;
	}

	let {
		value = $bindable(),
		textarea = $bindable(),
		onTextChange,
		onUndo,
		onRedo
	}: Props = $props();

	let highlighted = $state('');

	function handleKeyDown(event: KeyboardEvent) {
		if (event.repeat) return;

		const isUndo = event.key === 'z' && (event.ctrlKey || event.metaKey);
		const isRedo = event.key === 'y' && (event.ctrlKey || event.metaKey);

		if (isUndo || isRedo) {
			event.preventDefault();
			if (isUndo) onUndo();
			else if (isRedo) onRedo();

			updateHighlight();
		}
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		onTextChange(target.value);
		updateHighlight();
	}

	function syncScroll(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		const scrollTop = target.scrollTop;
		const scrollHeight = target.scrollHeight;
		const clientHeight = target.clientHeight;

		if (scrollTop + clientHeight >= scrollHeight) target.scrollTop = scrollHeight - clientHeight;
	}

	function updateHighlight(): void {
		const html = parseContent(value);

		const doc = Document.parseHTMLUnsafe(html);
		processCodeBlocks(doc);

		highlighted = doc.body.innerHTML.replace(/\n/g, '<br>');
	}

	function parseContent(text: string) {
		KATEX_REGEX.lastIndex = 0;

		let currentPos = 0;
		let match: RegExpExecArray | null;

		const segments: Segment[] = [];
		while ((match = KATEX_REGEX.exec(text)) !== null) {
			if (match.index > currentPos)
				segments.push({ type: 'markdown', content: text.substring(currentPos, match.index) });

			segments.push({ type: 'math', content: match[0] });
			currentPos = match.index + match[0].length;
		}

		if (currentPos < text.length)
			segments.push({ type: 'markdown', content: text.substring(currentPos) });

		return segments
			.map(({ type, content }) =>
				type === 'markdown'
					? hljs.highlight(content, { language: 'markdown' }).value
					: `<span class="hljs language-katex">${hljs.highlight(content, { language: 'latex' }).value}</span>`
			)
			.join('');
	}

	function processCodeBlocks(doc: Document): void {
		const codeSpans = doc.querySelectorAll('span.hljs-code');

		for (const span of codeSpans) {
			const spanText = span.textContent || '';
			const match = spanText.match(CODE_BLOCK_REGEX);

			if (!match) return;

			const [, lang, code] = match;
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';

			const fragment = document.createDocumentFragment();

			appendElement(fragment, 'span', {
				className: 'fence backticks',
				textContent: `\`\`\`${lang}\n`
			});

			const pre = appendElement(fragment, 'pre', { className: `hljs language-${language}` });

			appendElement(pre, 'code', { innerHTML: hljs.highlight(code, { language }).value });
			appendElement(fragment, 'span', { className: 'fence backticks', textContent: '```' });

			span.replaceWith(fragment);
		}
	}

	function appendElement<K extends keyof HTMLElementTagNameMap>(
		parent: Node,
		tagName: K,
		properties: Partial<HTMLElementTagNameMap[K]> = {}
	): HTMLElementTagNameMap[K] {
		const element = document.createElement(tagName);
		Object.assign(element, properties);
		parent.appendChild(element);
		return element;
	}

	const handleFocus = () => window.getSelection()?.toString() && textarea && textarea.focus();

	$effect(() => {
		updateHighlight();
	});

	onMount(() => {
		tick().then(() => {
			updateHighlight();
		});
	});
</script>

<div
	class="relative w-full"
	role="textbox"
	tabindex="-1"
	onclick={handleFocus}
	onkeydown={handleFocus}
>
	<EditorHighlighter {highlighted} />

	<textarea
		id="markdown"
		class="whitespace-pre-wrap break-words font-mono leading-normal relative w-full resize-none transition-colors ease-modern field-sizing-content caret-accent bg-transparent text-transparent z-10 focus:outline-none"
		bind:value
		bind:this={textarea}
		onscroll={syncScroll}
		oninput={handleInput}
		onkeydown={handleKeyDown}
		placeholder="The start of a beautiful story..."
		autocapitalize="off"
		autocomplete="off"
		translate="no"
		spellcheck="false"
	></textarea>
</div>
