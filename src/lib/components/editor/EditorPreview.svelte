<script lang="ts">
	import { PROCESSOR } from '$lib';

	import 'highlight.js/styles/default.css';
	import '../../../styles/highlight.css';
	import '../../../styles/prose.css';

	interface Props {
		text: string;
		html?: string;
		condition: boolean;
	}

	let { text, html, condition }: Props = $props();

	$effect(() => {
		if (condition) PROCESSOR.process(text).then((res) => (html = res.toString()));
	});
</script>

<div
	class="break-normal font-body preview transition-colors ease-modern prose h-full w-full overflow-auto"
>
	<!-- eslint-disable svelte/no-at-html-tags -->
	{@html html}
</div>

<style lang="postcss">
	@reference "../../../app.css";

	:global(.preview code) {
		@apply font-mono transition-colors ease-modern;
	}

	:global(.preview pre) {
		@apply p-4 my-2 overflow-x-auto rounded-md bg-surface-primary border border-border transition-colors ease-modern;
	}

	:global(.preview pre code) {
		@apply p-0 m-0 border-none font-mono text-sm block;
	}
</style>
