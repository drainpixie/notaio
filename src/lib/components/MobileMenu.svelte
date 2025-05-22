<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { User } from '$lib/server/db/schema';
	import { Home, LogIn } from 'lucide-svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import Tooltip from './Tooltip.svelte';
	import UserDropdown from './UserDropdown.svelte';

	interface Props {
		user: User;
		isMenuOpen: boolean;
		closeMenu: () => void;
	}

	const { user, isMenuOpen, closeMenu }: Props = $props();

	async function handleNavigation(event: MouseEvent, href: string) {
		event.preventDefault();

		if (!user && href !== '/login') await goto(`/login?redirectTo=${encodeURIComponent(href)}`);
		else await goto(href);

		closeMenu();
	}

	function navProps(href: string, label: string) {
		const current = page.url.pathname;

		return {
			href,
			'aria-label': label,
			class: current === href ? 'active' : '',
			onclick: (e: MouseEvent) => {
				e.preventDefault();
				handleNavigation(e, href);
			}
		};
	}
</script>

<ul class="flex list-none m-0 p-0" class:open={isMenuOpen}>
	<li>
		<Tooltip text="Home">
			<a {...navProps('/', 'Home')}>
				<Home size={16} />
			</a>
		</Tooltip>
	</li>

	<li>
		<Tooltip text="Toggle theme">
			<ThemeToggle id="theme-toggle" />
		</Tooltip>
	</li>

	{#if user}
		<li class="flex items-center">
			<UserDropdown {user} />
		</li>
	{:else}
		<li>
			<Tooltip text="Login">
				<a
					href="/login"
					class:active={page.url.pathname === '/login'}
					onclick={(e) => handleNavigation(e, '/login')}
					aria-label="Login"
				>
					<LogIn size={16} />
				</a>
			</Tooltip>
		</li>
	{/if}
</ul>

<style lang="postcss">
	@reference "../../app.css";

	ul li {
		@apply mr-5;
	}

	ul li:last-child {
		@apply mr-0;
	}

	ul a,
	:global(#theme-toggle) {
		@apply text-fg-primary no-underline transition-colors ease-modern p-2 rounded-md cursor-pointer
           flex items-center justify-center relative hover:bg-surface-secondary [.active]:bg-surface-secondary;
	}
</style>
