import type { AppProps } from 'next/app';
import Layout, { Menu } from '../components/layout';
import { GetStaticProps, GetServerSideProps } from 'next';
import HomeIcon from '@material-ui/icons/Home';
import ETDProvider from './model/ETDProvider';
import { createTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import ReceiptIcon from '@material-ui/icons/Receipt';
import '../styles/globals.css';
import UIProviderProvider from './model/UIProvider';
import React from 'react';

const darkTheme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: '#222b36',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#222b36',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        root: {
          backgroundColor: '#222b36',
          overflow: 'hidden',
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#171c24',
    },
    primary: {
      main: '#b3e5fc',
    },
  },
});

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  const menus = [
    {
      title: 'Home',
      icon: <HomeIcon />,
      link: '/',
    },
    {
      title: 'Transactions',
      icon: <ReceiptIcon />,
      link: '/transactions',
    },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <UIProviderProvider>
        <ETDProvider>
          <Layout menus={menus}>
            <CssBaseline />
            <Component {...pageProps} />
          </Layout>
        </ETDProvider>
      </UIProviderProvider>
    </ThemeProvider>
  );
}
export default MyApp;
