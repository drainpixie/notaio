<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		isOpen?: boolean;
		placement?: 'top' | 'right' | 'bottom' | 'left';
		offset?: number;
		width?: string | number;
		padding?: number;
		zIndex?: number;
		closeOnClickOutside?: boolean;
		animation?: boolean;
		animationDuration?: number;
		open?: () => void;
		close?: () => void;
		trigger: Snippet;
		content: Snippet;
	}

	let {
		isOpen = $bindable(false),
		placement = $bindable('bottom'),
		offset = $bindable(8),
		padding = $bindable(16),
		width = $bindable('auto'),
		zIndex = $bindable(50),
		closeOnClickOutside = $bindable(true),
		animation = $bindable(true),
		animationDuration = $bindable(200),
		open = () => (isOpen = true),
		close = () => (isOpen = false),
		trigger,
		content
	}: Props = $props();

	let containerRef = $state<HTMLElement | null>(null);
	let popupRef = $state<HTMLElement | null>(null);

	function toggle() {
		isOpen = !isOpen;
		if (isOpen) open();
		else close();
	}

	function closePopup() {
		if (isOpen) {
			isOpen = false;
			close();
		}
	}

	$effect(() => {
		if (!isOpen || !popupRef || !containerRef) return;
		updatePosition();
	});

	function updatePosition() {
		if (!popupRef || !containerRef) return;

		const triggerRect = containerRef.getBoundingClientRect();

		Object.assign(popupRef.style, {
			top: 'auto',
			right: 'auto',
			bottom: 'auto',
			left: 'auto',
			width: typeof width === 'number' ? `${width}px` : width
		});

		switch (placement) {
			case 'top':
				popupRef.style.bottom = `${window.innerHeight - triggerRect.top + offset}px`;
				popupRef.style.left = `${triggerRect.left + triggerRect.width / 2 - popupRef.offsetWidth / 2}px`;
				break;
			case 'right':
				popupRef.style.left = `${triggerRect.right + offset}px`;
				popupRef.style.top = `${triggerRect.top + triggerRect.height / 2 - popupRef.offsetHeight / 2}px`;
				break;
			case 'bottom':
				popupRef.style.top = `${triggerRect.bottom + offset}px`;
				popupRef.style.left = `${triggerRect.left + triggerRect.width / 2 - popupRef.offsetWidth / 2}px`;
				break;
			case 'left':
				popupRef.style.right = `${window.innerWidth - triggerRect.left + offset}px`;
				popupRef.style.top = `${triggerRect.top + triggerRect.height / 2 - popupRef.offsetHeight / 2}px`;
				break;
		}

		const popupRect = popupRef.getBoundingClientRect();

		if (popupRect.left < padding) {
			popupRef.style.left = `${padding}px`;
		} else if (popupRect.right > window.innerWidth - padding) {
			popupRef.style.left = `${window.innerWidth - popupRect.width - padding}px`;
		}

		if (popupRect.top < padding) {
			popupRef.style.top = `${padding}px`;
		} else if (popupRect.bottom > window.innerHeight - padding) {
			popupRef.style.top = `${window.innerHeight - popupRect.height - padding}px`;
		}
	}

	let resizeObserver: ResizeObserver;

	$effect(() => {
		if (!containerRef || !popupRef) return;
		if (resizeObserver) resizeObserver.disconnect();

		resizeObserver = new ResizeObserver(() => {
			if (isOpen) updatePosition();
		});

		resizeObserver.observe(containerRef);
		resizeObserver.observe(popupRef);

		return () => resizeObserver.disconnect();
	});
</script>

<div
	class="relative inline-block"
	bind:this={containerRef}
	use:clickOutside={{ handler: closeOnClickOutside ? closePopup : () => {} }}
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div role="button" tabindex="-1" onclick={toggle}>
		{@render trigger()}
	</div>

	{#if isOpen}
		<div
			bind:this={popupRef}
			style:position="fixed"
			style:z-index={zIndex}
			in:fade={{ duration: animation ? animationDuration : 0 }}
			out:fade={{ duration: animation ? animationDuration : 0 }}
		>
			{@render content()}
		</div>
	{/if}
</div>
