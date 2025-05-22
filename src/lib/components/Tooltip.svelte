<script lang="ts">
	import type { Snippet } from 'svelte';

	interface TooltipProps {
		text: string;
		children: Snippet;
		offset?: number;
	}

	const { text, offset = 10, children }: TooltipProps = $props();

	let isVisible = $state(false);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let tooltipElement: HTMLElement | null = $state(null);
	let tooltipWidth = $state(0);
	let tooltipHeight = $state(0);
	let direction = $state({ horizontal: 'right', vertical: 'bottom' });

	function showTooltip() {
		isVisible = true;
	}

	function hideTooltip() {
		isVisible = false;
	}

	function updateTooltipPosition(event: MouseEvent) {
		if (isVisible) {
			mouseX = event.clientX;
			mouseY = event.clientY;

			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			if (tooltipElement) {
				tooltipWidth = tooltipElement.offsetWidth;
				tooltipHeight = tooltipElement.offsetHeight;
			}

			direction.horizontal = mouseX + tooltipWidth + offset > viewportWidth ? 'left' : 'right';
			direction.vertical = mouseY + tooltipHeight + offset > viewportHeight ? 'top' : 'bottom';
		}
	}

	$effect(() => {
		if (isVisible && tooltipElement) {
			tooltipWidth = tooltipElement.offsetWidth;
			tooltipHeight = tooltipElement.offsetHeight;
			updateTooltipPosition({ clientX: mouseX, clientY: mouseY } as MouseEvent);
		}
	});
</script>

<svelte:window onmousemove={updateTooltipPosition} />

<div
	class="inline-flex"
	onmouseenter={showTooltip}
	onmouseleave={hideTooltip}
	onfocusout={hideTooltip}
	onmousemove={updateTooltipPosition}
	onfocusin={showTooltip}
	aria-label={text}
	role="tooltip"
	aria-describedby="tooltip"
>
	{@render children?.()}

	{#if isVisible}
		<div
			bind:this={tooltipElement}
			class="fixed bg-surface-secondary text-fg-primary px-2 py-3 rounded-md text-sm whitespace-nowrap z-[1000] border border-border border-solid pointer-events-none font-medium tooltip-animation transition-colors ease-modern duration-200"
			style="
          left: {direction.horizontal === 'right'
				? mouseX + offset
				: mouseX - offset - tooltipWidth}px; 
          top: {direction.vertical === 'bottom'
				? mouseY + offset
				: mouseY - offset - tooltipHeight}px;
        "
			id="tooltip"
		>
			{text}
		</div>
	{/if}
</div>

<style>
	.tooltip-animation {
		animation: tooltip-appear 0.15s ease forwards;
	}

	@keyframes tooltip-appear {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
