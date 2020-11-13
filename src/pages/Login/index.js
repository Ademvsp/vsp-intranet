import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  Card,
  Container,
  Grid,
  Step,
  StepLabel,
  Stepper
} from '@material-ui/core';
import firebase from '../../utils/firebase';
import EmailForm from './EmailForm';
import CodeForm from './CodeForm';
import { useDispatch } from 'react-redux';
import {
  confirmVerificationCode,
  getPhoneNumber,
  signInWithPhoneNumber
} from '../../store/actions/auth-user';

const Login = (props) => {
  const captchaRef = useRef();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState();
  const [activeStep, setActiveStep] = useState(0);
  const stepLabels = ['Enter email', 'Enter SMS code', 'Sign in'];
  //Initialize the recaptcha div
  useEffect(() => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      captchaRef.current,
      {
        size: 'invisible',
        callback: (_repsonse) => null
      }
    );
  }, []);
  //Reset values upon mounting component
  useEffect(() => {
    if (activeStep === 0) {
      setEmail('');
    } else if (activeStep === 1) {
      setVerificationCode('');
    }
  }, [activeStep]);
  //Side effect of email value confirmed
  useEffect(() => {
    const asyncFunction = async () => {
      setLoading(true);
      const phoneNumber = await dispatch(getPhoneNumber(email));
      if (phoneNumber) {
        const appVerifier = window.recaptchaVerifier;
        const newConfirmationResult = await dispatch(
          signInWithPhoneNumber(phoneNumber, appVerifier)
        );
        if (newConfirmationResult) {
          setConfirmationResult(newConfirmationResult);
          setActiveStep(1);
        }
      }
      setLoading(false);
    };
    if (email) {
      asyncFunction();
    }
  }, [email, dispatch]);
  //Side effect of verification code confirmed
  useEffect(() => {
    const asyncFunction = async () => {
      setLoading(true);
      setActiveStep(2);
      const result = await dispatch(
        confirmVerificationCode(confirmationResult, verificationCode)
      );
      if (!result) {
        setActiveStep(1);
        setLoading(false);
      }
    };
    if (confirmationResult && verificationCode) {
      asyncFunction();
    }
  }, [confirmationResult, verificationCode, dispatch]);
  //Side effect of password entered
  // useEffect(() => {
  //   const asyncFunction = async () => {
  //     setLoading(true);
  //     setActiveStep(2);
  //     const newEmail = email.split('*').pop();
  //     const result = await dispatch(loginWithPassword(newEmail, password));
  //     if (!result) {
  //       setActiveStep(1);
  //       setLoading(false);
  //     }
  //   };
  //   if (email && password) {
  //     asyncFunction();
  //   }
  // }, [password, email, dispatch]);

  return (
    <Fragment>
      <div ref={captchaRef} />
      <Container maxWidth='sm'>
        <Grid container direction='column' spacing={2}>
          <Grid item>
            <Card>
              {activeStep === 0 ? (
                <EmailForm loading={loading} setEmail={setEmail} />
              ) : (
                <CodeForm
                  loading={loading}
                  setActiveStep={setActiveStep}
                  setVerificationCode={setVerificationCode}
                />
              )}
            </Card>
          </Grid>
          <Grid item>
            <Stepper
              style={{ backgroundColor: 'inherit' }}
              activeStep={activeStep}
              alternativeLabel={true}
            >
              {stepLabels.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Grid>
        </Grid>
      </Container>
    </Fragment>
  );
};
export default Login;
