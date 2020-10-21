import React, { Fragment, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
	Button,
	CardActions,
	CardContent,
	CircularProgress,
	Grid,
	TextField,
	withTheme
} from '@material-ui/core';

const EmailForm = withTheme((props) => {
	const [validatedOnMount, setValidatedOnMount] = useState(false);
	const initialValues = { email: '' };

	const validationSchema = yup.object().shape({
		email: yup.string().label('Email').required().email().max(100)
	});

	const keyDownHandler = (event) => {
		if (event.keyCode === 13) {
			formik.handleSubmit();
		}
	};

	const submitHandler = (values) => {
		props.setEmail(values.email.trim());
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

	return (
		<Fragment>
			<CardContent>
				<Grid container justify='center'>
					{props.loading ? (
						<CircularProgress />
					) : (
						<TextField
							fullWidth
							label='Email Address'
							type='email'
							value={formik.values.email}
							onKeyDown={keyDownHandler}
							onChange={formik.handleChange('email')}
							onBlur={formik.handleBlur('email')}
							autoFocus={true}
						/>
					)}
				</Grid>
			</CardContent>
			<CardActions>
				<Grid container justify='flex-end'>
					<Button
						variant='contained'
						color='primary'
						onClick={formik.handleSubmit}
						disabled={!formik.isValid || props.loading || !validatedOnMount}
					>
						Next
					</Button>
				</Grid>
			</CardActions>
		</Fragment>
	);
});

export default EmailForm;
