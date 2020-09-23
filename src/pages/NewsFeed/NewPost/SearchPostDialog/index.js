import React, { useState } from 'react';
import {
	DialogActions,
	TextField,
	Button,
	DialogContent
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';
import * as postController from '../../../../controllers/post';
import { useDispatch, useSelector } from 'react-redux';
import { Autocomplete } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import Dialog from '../../../../components/Dialog';

const SearchPostDialog = (props) => {
	const history = useHistory();
	const dispatch = useDispatch();
	const { users } = useSelector((state) => state.dataState);
	const [loading, setLoading] = useState(false);
	const {
		searchPostDialogOpen,
		setSearchPostDialogOpen,
		setSearchResults
	} = props;

	const initialValues = { value: '', user: null };
	const initialErrors = { value: true };
	const validationSchema = yup.object().shape({
		value: yup.string().label('Search').trim().required(),
		user: yup.object().label('User').nullable()
	});

	const keyDownHandler = (event) => {
		if (event.keyCode === 13) {
			formik.handleSubmit();
		}
	};

	const dialogCloseHandler = () => {
		if (!loading) {
			setSearchPostDialogOpen(false);
		}
	};

	const submitHandler = async (values) => {
		setLoading(true);
		const results = await dispatch(postController.searchPosts(values));
		if (results) {
			formik.setValues(initialValues, true);
			setSearchPostDialogOpen(false);
			setSearchResults(results);
			history.replace('/newsfeed/page/1');
		}
		setLoading(false);
	};

	const formik = useFormik({
		initialValues: initialValues,
		initialErrors: initialErrors,
		onSubmit: submitHandler,
		validationSchema: validationSchema
	});

	return (
		<Dialog
			open={searchPostDialogOpen}
			onClose={dialogCloseHandler}
			width={400}
		>
			<DialogContent>
				<TextField
					label='Search'
					margin='dense'
					fullWidth={true}
					value={formik.values.value}
					onKeyDown={keyDownHandler}
					onChange={formik.handleChange('value')}
					onBlur={formik.handleBlur('value')}
					disabled={loading}
					autoFocus={true}
				/>
				<Autocomplete
					options={users}
					getOptionLabel={(user) => `${user.firstName} ${user.lastName}`}
					value={formik.values.user}
					onChange={(event, newInputValue) =>
						formik.setFieldValue('user', newInputValue, true)
					}
					onBlur={formik.handleBlur('user')}
					renderInput={(params) => (
						<TextField
							{...params}
							fullWidth={true}
							label='Posted by'
							variant='standard'
						/>
					)}
				/>
			</DialogContent>
			<DialogActions>
				<Button
					variant='outlined'
					color='primary'
					onClick={formik.handleSubmit}
					disabled={!formik.isValid || loading}
				>
					Search
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SearchPostDialog;
