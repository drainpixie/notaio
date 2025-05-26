<script lang="ts">
	import { Notebook } from '@lucide/svelte';
	import MobileMenu from './MobileMenu.svelte';

	const { user } = $props();
	let isMenuOpen = $state(false);

	function closeMenu() {
		isMenuOpen = false;
	}
</script>

<header class="sticky top-0 z-100 h-[var(--navbar-height)] w-full">
	<nav
		class="bg-surface-primary text-fg-primary py-2 border-b border-border transition-colors ease-modern"
	>
		<div class="flex justify-between items-center px-4">
			<div class="flex items-center gap-2">
				<Notebook size={16} />
				<a
					href="/"
					aria-label="Home"
					class="!text-fg-primary font-display text-xl font-semibold no-underline tracking-tight"
					>Notaio</a
				>
			</div>

			<MobileMenu {user} {isMenuOpen} {closeMenu} />
		</div>
	</nav>
</header>
