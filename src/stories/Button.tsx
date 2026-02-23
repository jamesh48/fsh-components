import type { ButtonProps as MuiBaseButtonProps } from '@mui/material';
import { Button as MuiButton } from '@mui/material';

export interface MuiButtonProps extends Omit<MuiBaseButtonProps, 'children'> {
	/** Button contents */
	label: string;
}

/**
 * MUI Button component wrapper for FSH Components
 * Uses Material-UI v7 Button component
 */
export const Button = ({
	label,
	color = 'primary',
	variant = 'contained',
	...props
}: MuiButtonProps) => {
	return (
		<MuiButton color={color} variant={variant} {...props}>
			{label}
		</MuiButton>
	);
};
