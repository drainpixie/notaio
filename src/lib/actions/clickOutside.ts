import type { Action } from 'svelte/action';

interface ClickOutsideParams {
	handler: () => void;
	enabled?: boolean;
}

export const clickOutside: Action<HTMLElement, ClickOutsideParams> = (node, params) => {
	const { handler, enabled = true } = params;

	const handleClick = (event: MouseEvent) => {
		if (!enabled) return;

		const target = event.target as Node;
		if (node && !node.contains(target) && node !== target) {
			handler();
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		update(newParams: ClickOutsideParams) {
			const { enabled = true } = newParams;
			params.enabled = enabled;
			params.handler = newParams.handler;
		},
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
};
