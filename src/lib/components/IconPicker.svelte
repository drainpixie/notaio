<script lang="ts">
	import { getLucideIcon } from '$lib';
	import * as lucide from '@lucide/svelte';
	import Tooltip from './Tooltip.svelte';
	import Popup from './Popup.svelte';

	let {
		selectedIcon = $bindable('FileQuestion'),
		size = $bindable(16),
		gridCols = $bindable(5),
		showSearch = $bindable(true),
		itemHeight = $bindable(16),
		visibleRows = $bindable(5),
		onIconChange = () => null,
		class: className = ''
	} = $props();

	let searchQuery = $state('');
	let containerRef = $state<HTMLElement | null>(null);
	let scrollTop = $state(0);
	let isOpen = $state(false);

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

		onIconChange(iconName);
	}

	$effect(() => {
		if (containerRef && filteredIcons) {
			containerRef.scrollTop = 0;
			scrollTop = 0;
		}
	});
</script>

<Popup bind:isOpen>
	{#snippet trigger()}
		{@const Icon = getLucideIcon(selectedIcon)}
		<Icon {size} class={className} />
	{/snippet}

	{#snippet content()}
		<div
			class="max-h-52 overflow-hidden bg-surface-primary border border-border border-solid rounded-md p-2 w-full"
			bind:this={containerRef}
			onscroll={handleScroll}
		>
			{#if showSearch}
				<div class="flex items-center gap-2 mb-2 sticky top-0 bg-surface-primary z-20">
					<input
						type="text"
						placeholder="Search..."
						bind:value={searchQuery}
						autocomplete="off"
						class="w-full bg-transparent text-fg-primary outline-none caret-accent"
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
								class="flex items-center justify-center p-2 bg-transparent border-transparent border-solid border text-fg-primary rounded-sm cursor-pointer transition-colors ease-modern hover:bg-surface-secondary"
								class:selected={iconName === selectedIcon}
								onclick={() => selectIcon(iconName)}
								aria-label={iconName}
							>
								<Icon {size} />
							</button>
						</Tooltip>
					{/each}
				</div>
			</div>
		</div>
	{/snippet}
</Popup>

<style lang="postcss">
	@reference "../../app.css";

	.selected {
		@apply bg-surface-secondary border-border border-solid border text-fg-primary;
	}
</style>
