import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, CircularProgress, TextField } from '@material-ui/core';
import {
	StyledButtonContainer,
	StyledCardContent,
	StyledSpinnerContainer
} from '../styled-components';

const EmailForm = (props) => {
	const initialValues = { email: '' };
	const initialErrors = { email: true };

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
		initialErrors: initialErrors,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	return (
		<StyledCardContent>
			{props.loading ? (
				<StyledSpinnerContainer>
					<CircularProgress />
				</StyledSpinnerContainer>
			) : (
				<TextField
					margin='dense'
					label='Email address'
					type='email'
					value={formik.values.email}
					onKeyDown={keyDownHandler}
					onChange={formik.handleChange('email')}
					onBlur={formik.handleBlur('email')}
					error={!!formik.touched.email && !!formik.errors.email}
					autoFocus={true}
				/>
			)}
			<StyledButtonContainer>
				<Button
					variant='contained'
					color='primary'
					onClick={formik.handleSubmit}
					disabled={!formik.isValid || props.loading}
				>
					Next
				</Button>
			</StyledButtonContainer>
		</StyledCardContent>
	);
};

export default EmailForm;
