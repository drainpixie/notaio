<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import FieldInput from '$lib/components/forms/FieldInput.svelte';
	import Form from '$lib/components/forms/Form.svelte';
	import { LogIn, UserPlus } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let isRegistering = $state(false);

	let username = $state(form?.values?.username || '');
	let password = $state('');

	function toggleMode() {
		isRegistering = !isRegistering;
	}
</script>

<Form {form} class="w-96">
	<h1 class="mt-0 mb-6 text-2xl">{isRegistering ? 'Register' : 'Login'}</h1>
	<form action={isRegistering ? '?/register' : '?/login'} method="post" use:enhance>
		<FieldInput bind:value={username} name="username" type="text" autocomplete="username" />
		<FieldInput
			bind:value={password}
			name="password"
			type="password"
			autocomplete="current-password"
		/>

		<div class="flex gap-4">
			<Button type="submit">
				{#snippet iconL()}
					{#if isRegistering}
						<UserPlus size={18} />
					{:else}
						<LogIn size={18} />
					{/if}
				{/snippet}

				{#if isRegistering}
					Register
				{:else}
					Login
				{/if}
			</Button>

			<Button class="flex-1" type="button" onclick={toggleMode}>
				{#snippet iconL()}
					{#if isRegistering}
						<LogIn size={18} />
					{:else}
						<UserPlus size={18} />
					{/if}
				{/snippet}

				{#if isRegistering}
					Already have an account
				{:else}
					Don't have an account
				{/if}
			</Button>
		</div>
	</form>
</Form>
