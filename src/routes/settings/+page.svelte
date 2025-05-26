<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { schema } from './schema';
	import { Control, Description, Field, FieldErrors, Label } from 'formsnap';
	import Button from '$lib/components/Button.svelte';
	import { Save } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const form = superForm(data.form, {
		validators: zodClient(schema),
		resetForm: false
	});

	const { form: formData, enhance } = form;
</script>

<form method="post" class="w-96" use:enhance>
	<Field {form} name="apiKey">
		<Control>
			{#snippet children({ props })}
				<Label>API Key</Label>
				<input {...props} type="text" bind:value={$formData.apiKey} />
			{/snippet}
		</Control>
		<Description>An OpenAI API key (e.g: sk-xxxxxxxxxxxxxxxxxxx)</Description>
		<FieldErrors />
	</Field>

	<Field {form} name="baseURL">
		<Control>
			{#snippet children({ props })}
				<Label>Base URL</Label>
				<input {...props} type="text" bind:value={$formData.baseURL} autocomplete="url" />
			{/snippet}
		</Control>
		<Description>The base URL of your endpoint</Description>
		<FieldErrors />
	</Field>

	<Field {form} name="authorizationHeader">
		<Control>
			{#snippet children({ props })}
				<Label>Authorization Header</Label>
				<input {...props} type="text" bind:value={$formData.authorizationHeader} />
			{/snippet}
		</Control>
		<Description>X-API-Key Antrophic, Authorization OpenAI</Description>
		<FieldErrors />
	</Field>

	<div class="flex w-full gap-4 mt-2">
		<Button type="submit" class="grow">
			{#snippet iconL()}
				<Save size={18} />
			{/snippet}

			Save
		</Button>
	</div>
</form>
