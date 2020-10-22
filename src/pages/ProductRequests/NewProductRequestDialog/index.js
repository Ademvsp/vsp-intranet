import {
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	InputAdornment,
	TextField,
	withTheme
} from '@material-ui/core';
import Autocomplete, {
	createFilterOptions
} from '@material-ui/lab/Autocomplete';
import { useFormik } from 'formik';
import * as yup from 'yup';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { productTypes as dbProductTypes } from '../../../data/product-types';
import * as vendorController from '../../../controllers/vendor';
import * as productRequestController from '../../../controllers/product-request';
import Vendor from '../../../models/vendor';
import ActionsBar from '../../../components/ActionsBar';
const filter = createFilterOptions();

const NewProductRequestDialog = withTheme((props) => {
	const dispatch = useDispatch();
	const { vendors: dbVendors } = useSelector((state) => state.dataState);

	const [productTypes, setProductTypes] = useState(
		[...dbProductTypes].sort((a, b) =>
			a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
		)
	);

	const { open, close } = props;
	const [attachments, setAttachments] = useState([]);
	const [loading, setLoading] = useState();
	const [validatedOnMount, setValidatedOnMount] = useState(false);

	//Vendor field
	const [vendors, setVendors] = useState();
	const [vendorsOpen, setVendorsOpen] = useState(false);
	const vendorsLoading = vendorsOpen && !vendors;
	useEffect(() => {
		if (vendorsLoading) {
			dispatch(vendorController.subscribeVendorListener());
		}
	}, [vendorsLoading, dispatch]);

	//Update local vendors state when redux vendors are retrieved
	useEffect(() => {
		if (dbVendors) {
			setVendors(dbVendors);
		}
	}, [dbVendors]);

	const validationSchema = yup.object().shape({
		vendor: yup
			.object()
			.typeError('Vendor a required field')
			.label('Vendor')
			.required()
			.test(
				'isValidType',
				'Vendor is not valid',
				(value) => value instanceof Vendor
			),
		vendorSku: yup.string().label('Vendor SKU').required().max(100),
		productType: yup
			.object()
			.typeError('Product Type a required field')
			.label('Product Type')
			.required(),
		cost: yup.number().label('Value').required().min(0).max(1000000),
		description: yup.string().label('Description').required()
	});

	const initialValues = {
		vendor: null,
		vendorSku: '',
		productType: productTypes[0],
		cost: 0,
		description: ''
	};

	const dialogCloseHandler = () => {
		if (!loading) {
			close();
		}
	};

	const submitHandler = async (values) => {
		setLoading(true);
		const result = await dispatch(
			productRequestController.addProductRequest(values, attachments)
		);
		setLoading(false);
		if (result) {
			formik.setValues(initialValues);
			close();
		}
	};

	const formik = useFormik({
		initialValues: initialValues,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	const { validateForm } = formik;

	useEffect(() => {
		validateForm();
		setValidatedOnMount(true);
	}, [validateForm]);

	const vendorRenderInput = (params) => (
		<TextField
			{...params}
			label='Vendor'
			fullWidth
			helperText={
				formik.errors.vendor && formik.touched.vendor
					? formik.errors.vendor
					: null
			}
			FormHelperTextProps={{
				style: {
					color: props.theme.palette.error.main
				}
			}}
			InputProps={{
				...params.InputProps,
				endAdornment: (
					<Fragment>
						{vendorsLoading ? (
							<CircularProgress color='inherit' size={20} />
						) : null}
						{params.InputProps.endAdornment}
					</Fragment>
				)
			}}
		/>
	);

	const vendorFilterOptions = (options, params) => {
		const filtered = filter(options, params);
		if (vendors) {
			const vendorExists = vendors.find(
				(vendor) =>
					vendor.name.trim().toLowerCase() ===
					params.inputValue.trim().toLowerCase()
			);
			if (params.inputValue !== '' && !vendorExists) {
				filtered.push({
					inputValue: params.inputValue,
					name: `Add "${params.inputValue}"`
				});
			}
		}
		return filtered;
	};

	const vendorChangeHandler = async (_event, value) => {
		let newValue;
		if (!value) {
			newValue = null;
		} else if (value?.inputValue) {
			newValue = new Vendor({ vendorId: '', name: value.inputValue });
			const newVendors = [...vendors, newValue];
			newVendors.sort((a, b) =>
				a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
			);
			setVendors(newVendors);
		} else {
			newValue = new Vendor({ ...value });
		}

		formik.setFieldValue('vendor', newValue, true);
	};

	const productTypeRenderInput = (params) => (
		<TextField
			{...params}
			label='Product Type'
			fullWidth
			helperText={
				formik.errors.customer && formik.touched.productType
					? formik.errors.productType
					: null
			}
			FormHelperTextProps={{
				style: {
					color: props.theme.palette.error.main
				}
			}}
			InputProps={{
				...params.InputProps
				// endAdornment: (
				// 	<Fragment>
				// 		{customersLoading ? (
				// 			<CircularProgress color='inherit' size={20} />
				// 		) : null}
				// 		{params.InputProps.endAdornment}
				// 	</Fragment>
				// )
			}}
		/>
	);

	const productTypeFilterOptions = (options, params) => {
		const filtered = filter(options, params);
		const productTypeExists = productTypes.find(
			(productType) =>
				productType.name.trim().toLowerCase() ===
				params.inputValue.trim().toLowerCase()
		);
		if (params.inputValue !== '' && !productTypeExists) {
			filtered.push({
				inputValue: params.inputValue,
				name: `Add "${params.inputValue}"`
			});
		}
		return filtered;
	};

	const productTypeChangeHandler = async (_event, value) => {
		let newValue;
		if (!value) {
			newValue = null;
		} else if (value?.inputValue) {
			newValue = { productTypeId: '', name: value.inputValue };
			const newProductTypes = [...productTypes, newValue];
			newProductTypes.sort((a, b) =>
				a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
			);
			setProductTypes(newProductTypes);
		} else {
			newValue = { ...value };
		}
		formik.setFieldValue('productType', newValue, true);
	};

	return (
		<Dialog open={open} onClose={dialogCloseHandler} fullWidth maxWidth='sm'>
			<DialogTitle>New Product Request</DialogTitle>
			<DialogContent>
				<Grid container direction='column' spacing={1}>
					<Grid item container spacing={2}>
						<Grid item xs={6}>
							<Autocomplete
								filterSelectedOptions
								openOnFocus
								loading={vendorsLoading}
								onOpen={() => setVendorsOpen(true)}
								onClose={() => setVendorsOpen(false)}
								options={vendors || []}
								getOptionLabel={(option) => option.name}
								getOptionSelected={(option, value) =>
									option.vendorId === value.vendorId
								}
								value={formik.values.vendor}
								onChange={vendorChangeHandler}
								onBlur={formik.handleBlur('vendor')}
								filterOptions={vendorFilterOptions}
								renderInput={vendorRenderInput}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								label='Vendor Sku'
								fullWidth
								value={formik.values.vendorSku}
								onChange={formik.handleChange('vendorSku')}
								onBlur={formik.handleBlur('vendorSku')}
								helperText={
									formik.errors.vendorSku && formik.touched.vendorSku
										? formik.errors.vendorSku
										: null
								}
								FormHelperTextProps={{
									style: {
										color: props.theme.palette.error.main
									}
								}}
							/>
						</Grid>
					</Grid>
					<Grid item container spacing={2}>
						<Grid item xs={6}>
							<Autocomplete
								filterSelectedOptions
								openOnFocus
								options={productTypes}
								getOptionLabel={(option) => {
									return option.name;
								}}
								getOptionSelected={(option, value) =>
									option.productTypeId === value.productTypeId
								}
								value={formik.values.productType}
								onChange={productTypeChangeHandler}
								onBlur={formik.handleBlur('productType')}
								filterOptions={productTypeFilterOptions}
								renderInput={productTypeRenderInput}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								type='number'
								label='Cost Price'
								fullWidth
								value={formik.values.cost}
								onChange={formik.handleChange('cost')}
								onBlur={formik.handleBlur('cost')}
								helperText={
									formik.errors.cost && formik.touched.cost
										? formik.errors.cost
										: null
								}
								FormHelperTextProps={{
									style: {
										color: props.theme.palette.error.main
									}
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
							multiline
							rows={3}
							rowsMax={3}
							value={formik.values.description}
							onChange={formik.handleChange('description')}
							onBlur={formik.handleBlur('description')}
							helperText={
								formik.errors.description && formik.touched.description
									? formik.errors.description
									: null
							}
							FormHelperTextProps={{
								style: {
									color: props.theme.palette.error.main
								}
							}}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<ActionsBar
					attachments={{
						enabled: true,
						attachments: attachments,
						setAttachments: setAttachments
					}}
					buttonLoading={loading}
					loading={loading || !validatedOnMount}
					isValid={formik.isValid}
					onClick={formik.handleSubmit}
					tooltipPlacement='top'
					actionButtonText='Submit'
				/>
			</DialogActions>
		</Dialog>
	);
});

export default NewProductRequestDialog;
