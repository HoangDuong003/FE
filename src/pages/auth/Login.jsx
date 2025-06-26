import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Paper,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { loginUser, setUser, fetchUserProfile } from '../../features/auth/authSlice'; 
import logo from '../../assets/images/urban-logo.png';

const validationSchema = Yup.object({
  username: Yup.string().required('Username or Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const resultAction = await dispatch(loginUser({ email: values.username, password: values.password }));
      if (loginUser.fulfilled.match(resultAction)) {
        // Sau khi đăng nhập, lấy email và gọi fetchUserProfile
        const email = values.username;
        localStorage.setItem('userEmail', email); // Lưu email vào localStorage
        dispatch(fetchUserProfile(email));
        navigate('/home');
      }
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <img src={logo} alt="Urban Logo" style={{ height: 60, marginBottom: 12 }} />
          <Typography variant="h4" align="center" gutterBottom>
          ログイン
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Username or Email"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            margin="normal"
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="パスワード"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            margin="normal"
          />

          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Link to="/forgotpass" style={{ float: 'right', marginTop: 8, fontSize: 15 }}>
          パスワードをお忘れですか？
          </Link>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;