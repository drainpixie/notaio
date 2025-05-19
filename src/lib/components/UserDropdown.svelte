<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import type { User as TUser } from '$lib/server/db/schema';
	import { ChevronDown, LogOut, Settings, User } from 'lucide-svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		user: TUser;
	}

	const { user }: Props = $props();
	let isOpen = $state(false);

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function closeDropdown() {
		isOpen = false;
	}
</script>

<div class="relative inline-block" use:clickOutside={{ handler: closeDropdown }}>
	<Tooltip text="User menu">
		<button
			class="flex items-center p-2 gap-1 bg-transparent border-none text-fg-primary cursor-pointer rounded-md transition-colors ease-in-out hover:bg-surface-secondary"
			onclick={toggleDropdown}
			aria-expanded={isOpen}
			aria-haspopup="true"
		>
			<User size={16} />
			<ChevronDown size={16} class={`transition-transform ease-in-out ${isOpen && 'rotate-180'}`} />
		</button>
	</Tooltip>

	{#if isOpen}
		<div
			class="absolute top-full right-0 w-52 bg-surface-primary border border-border rounded-md shadow-lg z-50 overflow-hidden mt-6 dropdown-animation"
		>
			<div class="px-4 py-3 border-b border-border flex flex-col">
				<span class="font-semibold font-display text-fg-primary">{user?.username || 'User'}</span>
				<span class="text-fg-secondary text-xs">{user?.id || ''}</span>
			</div>

			<a href="/settings" class="dropdown-item">
				<Settings size={18} />
				<span>Settings</span>
			</a>

			<form method="post" action="/?/logout" class="dropdown-item-form">
				<button type="submit" class="dropdown-item">
					<LogOut size={18} />
					<span>Logout</span>
				</button>
			</form>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "../../app.css";

	@keyframes dropdown-appear {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown-animation {
		animation: dropdown-appear 0.2s ease;
	}

	.dropdown-item {
		@apply flex items-center  gap-3 px-4 py-3 w-full text-left
           text-fg-primary no-underline transition-colors hover:bg-surface-secondary
           ease-in-out rounded-md  text-sm font-normal font-display cursor-pointer;
	}
</style>
