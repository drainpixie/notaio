<script lang="ts">
	import { getLucideIcon } from '$lib';
	import { clickOutside } from '$lib/actions/clickOutside';
	import * as lucide from 'lucide-svelte';
	import Tooltip from './Tooltip.svelte';

	let {
		selectedIcon = $bindable('FileQuestion'),
		size = $bindable(20),
		gridCols = $bindable(5),
		showSearch = $bindable(true),
		itemHeight = $bindable(40),
		visibleRows = $bindable(5)
	} = $props();

	let searchQuery = $state('');
	let isOpen = $state(false);
	let containerElement = $state<HTMLElement | null>(null);
	let scrollTop = $state(0);

	const iconNames = Object.keys(lucide).filter(
		(name) =>
			typeof (lucide as unknown as Record<string, typeof lucide.Component>)[name] === 'function' &&
			name.match(/^[A-Z]/)
	);

	let filteredIcons = $derived(
		searchQuery
			? iconNames.filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
			: iconNames
	);

	let startRow = $derived(Math.floor(scrollTop / itemHeight));
	let endRow = $derived(
		Math.min(startRow + visibleRows + 2, Math.ceil(filteredIcons.length / gridCols))
	);
	let startIndex = $derived(startRow * gridCols);
	let endIndex = $derived(Math.min(endRow * gridCols, filteredIcons.length));
	let visibleIcons = $derived(filteredIcons.slice(startIndex, endIndex));
	let paddingTop = $derived(startRow * itemHeight);

	function handleScroll(event: Event) {
		const target = event.target as HTMLElement;
		scrollTop = target.scrollTop;
	}

	function selectIcon(iconName: string) {
		selectedIcon = iconName;
		isOpen = false;
	}

	function handler() {
		isOpen = !isOpen;
	}

	$effect(() => {
		if (containerElement && filteredIcons) {
			containerElement.scrollTop = 0;
			scrollTop = 0;
		}
	});
</script>

<div class="relative" use:clickOutside={{ handler: () => (isOpen = false) }}>
	<button
		type="button"
		class="flex items-center gap-2 p-3 w-full rounded-lg border border-solid border-border bg-surface-primary cursor-pointer transition-all duration-200 hover:bg-surface-secondary"
		onclick={handler}
		aria-label="Select icon"
	>
		<!-- svelte-ignore svelte_component_deprecated -->
		<svelte:component this={getLucideIcon(selectedIcon)} {size} id="selected-icon" />
		<span class="text-base font-medium text-fg-primary">{selectedIcon}</span>
	</button>

	{#if isOpen}
		<div
			class="absolute top-[calc(100%+0.5rem)] left-0 max-h-52 overflow-hidden bg-surface-primary border border-border border-solid rounded-md z-[100] p-2"
			bind:this={containerElement}
			onscroll={handleScroll}
		>
			{#if showSearch}
				<div
					class="flex items-center gap-2 p-2 border-b border-border border-solid mb-2 sticky top-0 bg-surface-primary z-20"
				>
					<lucide.Search size={16} />
					<input
						type="text"
						placeholder="Search icons..."
						bind:value={searchQuery}
						autocomplete="off"
						class="w-full bg-transparent text-fg-primary outline-none"
					/>
				</div>
			{/if}

			<div class="block w-full pb-4">
				<div
					class="grid gap-2 w-full relative"
					style="transform: translateY({paddingTop}px); grid-template-columns: repeat({gridCols}, 1fr);"
				>
					{#each visibleIcons as iconName (iconName)}
						{@const Icon = getLucideIcon(iconName)}
						<Tooltip text={iconName}>
							<button
								type="button"
								class="flex items-center justify-center p-2 bg-transparent border-transparent border-solid border text-fg-primary rounded-sm cursor-pointer transition-colors ease-in-out hover:bg-surface-secondary"
								class:selected={iconName === selectedIcon}
								onclick={() => selectIcon(iconName)}
								aria-label={iconName}
								style="height: {itemHeight}px;"
							>
								<Icon {size} />
							</button>
						</Tooltip>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "../../app.css";

	.selected {
		@apply bg-surface-secondary border-border border-solid border text-fg-primary;
	}
</style>
