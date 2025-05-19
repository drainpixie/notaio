<script lang="ts">
	let { highlighted = $bindable('') } = $props();
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
<pre
	class="highlight-layer absolute inset-0 pointer-events-none whitespace-pre-wrap break-words font-mono leading-normal w-full"
	aria-hidden="true">{@html highlighted}</pre>

<style lang="postcss">
	@reference "../../../app.css";

	:global(.highlight-layer pre, .highlight-layer code, .highlight-layer.hljs.language-katex) {
		@apply border-none m-0 p-0 bg-transparent transition-colors ease-in-out block;
	}
</style>
