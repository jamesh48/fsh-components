import { Autocomplete, type AutocompleteProps, TextField } from '@mui/material';

interface AutocompleteSearchProps
	extends Omit<AutocompleteProps<unknown, false, false, false>, 'renderInput'> {
	options: { label: string }[];
	fullWidth?: boolean;
}

const AutocompleteSearch = ({ ...props }: AutocompleteSearchProps) => {
	return (
		<Autocomplete
			{...props}
			sx={{ width: 300 }}
			renderInput={(params) => <TextField {...params} />}
		/>
	);
};

export default AutocompleteSearch;
