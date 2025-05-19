<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import SettingsForm from '$lib/components/forms/SettingsForm.svelte';
	import type { ActionData } from '../$types';

	const { form }: { form: ActionData } = $props();
</script>

<div class="settings-container">
	<Card title="Settings">
		<SettingsForm {form} />
	</Card>
</div>

<style>
	.settings-container {
		padding: 2rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
