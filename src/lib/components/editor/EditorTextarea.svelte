<script lang="ts">
	import { KATEX_REGEX } from '$lib';
	import hljs from 'highlight.js';
	import { onMount, tick } from 'svelte';
	import EditorHighlighter from './EditorHighlighter.svelte';

	interface Props {
		value: string;
		textarea: HTMLTextAreaElement | undefined;
		onTextChange: (text: string) => void;
		onUndo: () => void;
		onRedo: () => void;
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

		if (scrollTop + clientHeight >= scrollHeight) {
			target.scrollTop = scrollHeight - clientHeight;
		}
	}

	function updateHighlight() {
		const segments = [];
		let currentPos = 0;
		let match: RegExpExecArray | null = null;

		KATEX_REGEX.lastIndex = 0;

		while ((match = KATEX_REGEX.exec(value)) !== null) {
			if (match.index > currentPos) {
				segments.push({
					type: 'markdown',
					content: value.substring(currentPos, match.index)
				});
			}

			segments.push({
				type: 'math',
				content: match[0]
			});

			currentPos = match.index + match[0].length;
		}

		if (currentPos < value.length) {
			segments.push({
				type: 'markdown',
				content: value.substring(currentPos)
			});
		}

		let highlightedHTML = '';

		for (const { type, content } of segments) {
			if (type === 'markdown') {
				highlightedHTML += hljs.highlight(content, {
					language: 'markdown'
				}).value;
			} else {
				highlightedHTML += `<span class="hljs language-katex">${hljs.highlight(content, { language: 'latex' }).value}</span>`;
			}
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

	function handleFocus() {
		if (window.getSelection()?.toString() && textarea) {
			textarea.focus();
		}
	}

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
		class="whitespace-pre-wrap break-words font-mono leading-normal relative w-full resize-none transition-colors ease-in-out field-sizing-content caret-accent bg-transparent text-transparent z-10 focus:outline-none"
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
