import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
	FormControl,
	InputLabel,
	Button,
	Input,
	CircularProgress
} from '@material-ui/core';
import {
	StyledButtonContainer,
	StyledCardContent,
	StyledSpinnerContainer
} from '../styled-components';

const EmailForm = (props) => {
	const initialValues = { verificationCode: '' };
	const initialErrors = { verificationCode: true };

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
				<FormControl margin='dense'>
					<InputLabel>
						{props.passwordMode ? 'Password' : 'SMS confirmation code'}
					</InputLabel>
					<Input
						type={props.passwordMode ? 'password' : 'text'}
						value={formik.values.verificationCode}
						onKeyDown={keyDownHandler}
						onChange={formik.handleChange('verificationCode')}
						onBlur={formik.handleBlur('verificationCode')}
						error={
							!!formik.touched.verificationCode &&
							!!formik.errors.verificationCode
						}
						autoFocus={true}
					/>
				</FormControl>
			)}
			<StyledButtonContainer>
				<Button
					variant='outlined'
					color='primary'
					type='button'
					onClick={props.setActiveStep.bind(this, 0)}
					disabled={props.loading}
				>
					Back
				</Button>
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
