import { Grid, InputAdornment, TextField } from '@material-ui/core';
import React from 'react';
import { toDecimal } from '../../../../utils/data-transformer';

const ProductRequestForm = (props) => {
	const { productRequest } = props;
	const { vendor, vendorSku, productType, cost, description } = productRequest;
	return (
		<Grid container direction='column' spacing={1}>
			<Grid item container direction='row' spacing={2}>
				<Grid item xs={6}>
					<TextField
						label='Vendor'
						fullWidth
						value={vendor.name}
						inputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label='Vendor SKU'
						fullWidth
						value={vendorSku}
						inputProps={{
							readOnly: true
						}}
					/>
				</Grid>
			</Grid>
			<Grid item container direction='row' spacing={2}>
				<Grid item xs={6}>
					<TextField
						label='Product Type'
						fullWidth
						value={productType}
						inputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label='Cost Price'
						fullWidth
						value={toDecimal(cost)}
						inputProps={{
							readOnly: true
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>$</InputAdornment>
							)
						}}
					/>
				</Grid>
			</Grid>
			<Grid item>
				<TextField
					label='Description'
					fullWidth
					value={description}
					inputProps={{
						readOnly: true
					}}
					multiline
					rows={3}
				/>
			</Grid>
		</Grid>
	);
};

export default ProductRequestForm;
