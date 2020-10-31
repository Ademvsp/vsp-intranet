import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	TextField
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';

const ApproveDialog = (props) => {
	const { open, cancel, title, confirm, loading } = props;
	const [validatedOnMount, setValidatedOnMount] = useState(false);

	const dialogCloseHandler = () => {
		if (!loading) {
			cancel();
		}
	};

	const initialValues = { finalSku: '' };

	const validationSchema = yup.object().shape({
		finalSku: yup.string().label('Vendor SKU').trim().required()
	});

	const formik = useFormik({
		onSubmit: confirm,
		initialValues: initialValues,
		validationSchema: validationSchema
	});

	const { validateForm } = formik;

	const keyDownHandler = (event) => {
		if (event.keyCode === 13) {
			formik.handleSubmit();
		}
	};

	useEffect(() => {
		validateForm();
		setValidatedOnMount(true);
	}, [validateForm]);

	return (
		<Dialog open={open} onClose={dialogCloseHandler} maxWidth='xs' fullWidth>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<TextField
					label='Fishbowl Part Number'
					fullWidth={true}
					value={formik.values.finalSku}
					onBlur={formik.handleBlur('finalSku')}
					onChange={formik.handleChange('finalSku')}
					onKeyDown={keyDownHandler}
					autoFocus={true}
				/>
			</DialogContent>
			<DialogActions>
				<Grid container justify='flex-end' wrap='nowrap' spacing={1}>
					<Grid item>
						<Button
							onClick={cancel}
							color='primary'
							variant='outlined'
							disabled={loading}
						>
							Cancel
						</Button>
					</Grid>
					<Grid
						item
						container
						justify='center'
						alignItems='center'
						style={{ width: 'auto' }}
					>
						<Button
							onClick={formik.handleSubmit}
							color='primary'
							variant='contained'
							autoFocus={true}
							disabled={!formik.isValid || !validatedOnMount || loading}
						>
							Confirm
						</Button>
						{loading && (
							<CircularProgress size={25} style={{ position: 'absolute' }} />
						)}
					</Grid>
				</Grid>
			</DialogActions>
		</Dialog>
	);
};

export default ApproveDialog;
