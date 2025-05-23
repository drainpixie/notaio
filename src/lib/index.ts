import * as lucide from 'lucide-svelte';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkBreaks from 'remark-breaks';
import remarkGemoji from 'remark-gemoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export interface Command {
	icon: typeof lucide.Icon;
	name: string;
	prefix: string;
	suffix: string;
}

export const COMMANDS: Command[] = [
	{ name: 'Code', icon: lucide.Code, prefix: '```lang ', suffix: '```' },
	{ name: 'Link', icon: lucide.Link, prefix: '[', suffix: '](url)' },
	{ name: 'Bold', icon: lucide.Bold, prefix: '**', suffix: '**' },
	{ name: 'List', icon: lucide.List, prefix: '- ', suffix: '' },
	{ name: 'Quote', icon: lucide.Quote, prefix: '> ', suffix: '' },
	{ name: 'Italic', icon: lucide.Italic, prefix: '*', suffix: '*' },
	{ name: 'Heading', icon: lucide.Heading, prefix: '# ', suffix: '' },
	{ name: 'Checklist', icon: lucide.ListChecks, prefix: '- [ ] ', suffix: '' },
	{ name: 'OrderedList', icon: lucide.ListOrdered, prefix: '1. ', suffix: '' },
	{ name: 'Strikethrough', icon: lucide.Strikethrough, prefix: '~~', suffix: '~~' }
];

export const PROCESSOR = unified()
	.use(remarkBreaks)
	.use(remarkGfm)
	.use(remarkMath)
	.use(remarkParse)
	.use(remarkRehype)
	.use(remarkGemoji)
	.use(rehypeKatex)
	.use(rehypeHighlight)
	.use(rehypeStringify);

// eslint-disable-next-line no-useless-escape
export const KATEX_REGEX = /\$+([^\$]*?)\$+/g;
export const CODE_BLOCK_REGEX = /^```(\w*)\n([\s\S]*?)```$/;

export const MARKDOWN_DEFAULT_VALUE = [
	'# Notaio',
	'',
	'This is an example inspired by [GitHub](https://github.com)',
	'',
	'```js',
	'const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];',
	'const evens = xs.filter(x => x % 2 === 0);',
	'',
	'console.log(evens);',
	'```',
	'',
	'```python',
	'xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]',
	'evens = list(filter(lambda x: x % 2 == 0, xs))',
	'',
	'print(evens)',
	'```',
	'',
	'Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation $L = \\frac{1}{2} \\rho v^2 S C_L$',
	'Take $\\tfrac{1}{2}$ cup of sugar, …; $3 \\times \\tfrac{1}{2} = 1 \\tfrac{1}{2}$',
	'',
	'$$',
	'\\begin{align*}',
	'\\textbf{Inverse Fourier Transform = } ',
	'f(x) &= \\int_{-\\infty}^\\infty ',
	'\\\\',
	'&\\quad \\hat{f}(\\xi), e^{2 \\pi i \\xi x} \\, d\\xi',
	'\\end{align*}',
	'$$'
].join('\n');

export const getLucideIcon = (name: string): typeof lucide.Component =>
	lucide[name as keyof typeof lucide] as typeof lucide.Component;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => unknown>(
	func: F,
	wait: number,
): (...args: Parameters<F>) => void {
	let timeout: NodeJS.Timeout;

	return function debounced(this: ThisParameterType<F>, ...args: Parameters<F>): void {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}
