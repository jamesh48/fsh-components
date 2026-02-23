import type { Meta, StoryObj } from '@storybook/react-vite';
import AutocompleteSearch from './AutocompleteSearch';

const meta = {
	title: 'Example/AutocompleteSearch',
	component: AutocompleteSearch,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		options: [],
	},
	args: { options: [] },
} satisfies Meta<typeof AutocompleteSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		fullWidth: true,
		options: [
			{ label: 'Option A' },
			{ label: 'Option B' },
			{ label: 'Option C' },
		],
	},
};

export const Secondary: Story = {
	args: {
		options: [],
	},
};

export const Outlined: Story = {
	args: {
		options: [],
	},
};
