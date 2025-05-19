<script lang="ts">
	import { enhance } from '$app/forms';
	import { Save } from 'lucide-svelte';
	import type { ActionData } from '../../../routes/login/$types';
	import Button from '../Button.svelte';
	import Tooltip from '../Tooltip.svelte';

	interface Props {
		_form: ActionData;
	}

	const { _form }: Props = $props();
</script>

<form method="post" action="?/settings" use:enhance>
	<div class="form-group">
		<div class="label-container">
			<Tooltip text="OpenAI or Antrophic">
				<label for="key" class="form-label">API Key</label>
			</Tooltip>
		</div>

		<input
			id="key"
			name="key"
			type="password"
			class="form-input"
			required
			placeholder="sk-fakekey1234567890"
		/>

		<div class="form-group" id="grouped">
			<div>
				<div class="label-container">
					<Tooltip text="Base API URL">
						<label for="baseUrl" class="form-label">Base URL</label>
					</Tooltip>
				</div>

				<input
					id="baseUrl"
					name="baseUrl"
					type="text"
					class="form-input"
					placeholder="https://api.openai.com/v1"
					required
				/>
			</div>

			<div>
				<div class="label-container">
					<Tooltip text="Authorization Header (X-API-Key Antrophic, Authorization OpenAI)">
						<label for="authHeader" class="form-label">Auth Header</label>
					</Tooltip>
				</div>

				<input
					id="authHeader"
					name="authHeader"
					type="text"
					placeholder="X-API-Key"
					class="form-input"
					required
				/>
			</div>
		</div>
	</div>

	<div class="button-container">
		<Button>
			{#snippet iconL()}
				<Save size={18} />
			{/snippet}
			Save
		</Button>
	</div>
</form>

<style>
	:global(.button-container) {
		width: 100%;
	}

	.label-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	#grouped {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}
</style>
