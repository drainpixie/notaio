<script lang="ts">
	import type { User as TUser } from '$lib/server/db/schema';
	import { ChevronDown, LogOut, Settings, User } from 'lucide-svelte';
	import Tooltip from './Tooltip.svelte';
	import Popup from './Popup.svelte';

	interface Props {
		user: TUser;
	}

	const { user }: Props = $props();
	let isOpen = $state(false);
</script>

<Popup bind:isOpen offset={24}>
	{#snippet trigger()}
		<Tooltip text="User menu">
			<button
				class="flex items-center p-2 gap-1 bg-transparent border-none text-fg-primary cursor-pointer transition-colors ease-modern hover:bg-surface-secondary"
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				<User size={16} />
				<ChevronDown
					size={16}
					class={`transition-transform ease-modern ${isOpen && 'rotate-180'}`}
				/>
			</button>
		</Tooltip>
	{/snippet}

	{#snippet content()}
		<div
			class="bg-surface-primary border border-border rounded-md overflow-hidden dropdown-animation"
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
	{/snippet}
</Popup>

<style lang="postcss">
	@reference "../../app.css";

	.dropdown-item {
		@apply flex items-center gap-3 px-4 py-3 w-full text-left
			 text-fg-primary no-underline transition-colors hover:bg-surface-secondary
			 ease-modern text-sm font-normal font-display cursor-pointer;
	}
</style>
