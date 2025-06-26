import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { useSelector } from 'react-redux';

const Layout = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  return (
    <>
      <Header />
      <Box
        sx={{
          marginTop: '52px',
          minHeight: `calc(100vh - 52px)`,
          width: '100%',
          background: '#f7f7f7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="main"
          sx={{
            width: '100%',
            maxWidth: '100%',
            pt: 0,
            px: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default Layout; 