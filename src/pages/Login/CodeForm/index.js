import React, { Fragment, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
	Button,
	CardActions,
	CardContent,
	CircularProgress,
	Grid,
	TextField
} from '@material-ui/core';

const EmailForm = (props) => {
	const [validatedOnMount, setValidatedOnMount] = useState(false);
	const initialValues = { verificationCode: '' };

	let verificationCodeSchema = yup
		.string()
		.label('Verification code')
		.required()
		.length(6)
		.matches(/^[\d]{6}$/);
	if (props.passwordMode) {
		verificationCodeSchema = yup.string().label('Password').required();
	}

	const validationSchema = yup.object().shape({
		verificationCode: verificationCodeSchema
	});

	const keyDownHandler = (event) => {
		if (event.keyCode === 13) {
			formik.handleSubmit();
		}
	};

	const submitHandler = (values) => {
		if (props.passwordMode) {
			props.setPassword(values.verificationCode.trim());
		} else {
			props.setVerificationCode(values.verificationCode.trim());
		}
	};

	const formik = useFormik({
		initialValues: initialValues,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	const { validateForm } = formik;

	useEffect(() => {
		setValidatedOnMount(true);
		validateForm();
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
							label={props.passwordMode ? 'Password' : 'SMS confirmation code'}
							type={props.passwordMode ? 'password' : 'text'}
							value={formik.values.verificationCode}
							onKeyDown={keyDownHandler}
							onChange={formik.handleChange('verificationCode')}
							onBlur={formik.handleBlur('verificationCode')}
							autoFocus={true}
						/>
					)}
				</Grid>
			</CardContent>
			<CardActions>
				<Grid container justify='flex-end' spacing={1}>
					<Grid item>
						<Button
							variant='outlined'
							color='primary'
							type='button'
							onClick={props.setActiveStep.bind(this, 0)}
							disabled={props.loading}
						>
							Back
						</Button>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							color='primary'
							onClick={formik.handleSubmit}
							disabled={!formik.isValid || props.loading || !validatedOnMount}
						>
							Next
						</Button>
					</Grid>
				</Grid>
			</CardActions>
		</Fragment>
	);
};

export default EmailForm;
