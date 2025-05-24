import { browser } from '$app/environment';

type Theme = 'light' | 'dark';
type Highlighting = 'duotone' | 'colour';

let theme = $state<Theme>(getInitialTheme());
let highlight = $state<Highlighting>('colour');

function getInitialTheme(): Theme {
	if (browser) {
		const savedTheme = localStorage.getItem('theme') as Theme;

		if (savedTheme) return savedTheme;
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
	}

	return 'light';
}

export function toggleTheme() {
	const newTheme = theme === 'light' ? 'dark' : 'light';

	if (browser) {
		localStorage.setItem('theme', newTheme);
		document.documentElement.setAttribute('data-theme', newTheme);
	}

	theme = newTheme;
}

export function initTheme() {
	if (browser) {
		document.documentElement.setAttribute('data-theme', theme);

		$effect(() => document.documentElement.setAttribute('data-theme', theme));
	}
}

export function setHighlighting(newHighlight: Highlighting) {
	highlight = newHighlight;

	if (browser) {
		localStorage.setItem('highlight', newHighlight);
		document.documentElement.setAttribute('data-highlight', newHighlight);
	}
}

export function initHighlighting() {
	if (browser) {
		const savedHighlight = localStorage.getItem('highlight') as Highlighting;

		if (savedHighlight) {
			highlight = savedHighlight;
			document.documentElement.setAttribute('data-highlight', highlight);
		} else document.documentElement.setAttribute('data-highlight', 'duotone');

		$effect(() => document.documentElement.setAttribute('data-highlight', highlight));
	}
}

export const getHighlighting = () => highlight;
export const getTheme = () => theme;
