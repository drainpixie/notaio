<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { LogIn, UserPlus } from '@lucide/svelte';
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { schema } from './schema';
	import { Control, Field, FieldErrors, Label } from 'formsnap';

	let { data }: { data: PageData } = $props();

	const form = superForm(data.form, {
		validators: zodClient(schema),
		resetForm: false
	});

	const { form: formData, enhance, message } = form;

	let isRegistering = $state(false);

	function toggleMode() {
		isRegistering = !isRegistering;
		$message = undefined;
	}
</script>

<form action={isRegistering ? '?/register' : '?/login'} method="post" class="w-96" use:enhance>
	<Field {form} name="username">
		<Control>
			{#snippet children({ props })}
				<Label>Username</Label>
				<input {...props} type="text" bind:value={$formData.username} autocomplete="username" />
			{/snippet}
		</Control>
		<FieldErrors />
	</Field>

	<Field {form} name="password">
		<Control>
			{#snippet children({ props })}
				<Label>Password</Label>
				<input
					{...props}
					type="password"
					bind:value={$formData.password}
					autocomplete="current-password"
				/>
			{/snippet}
		</Control>
		<FieldErrors />
	</Field>

	<div class="flex gap-4 mt-2">
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
