import React from 'react';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import StorageIcon from '@material-ui/icons/Storage';
import { useRouter } from 'next/dist/client/router';
import Web3 from 'web3';
import { AlertTitle, CircularProgress, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/core';

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string>();

  const search = React.useCallback(async () => {
    try {
      if (value.length === 0) {
        setErrorMessage(
          'You need to enter a valid address or a transaction ID'
        );
        return;
      }

      let isAddress = Web3.utils.isAddress(value);
      if (isAddress) {
        router.push('/transactions/user/' + value);
      } else {
        router.push('/transactions/tx/' + value);
      }
    } catch (err) {
      window.alert(err);
    }
  }, [value]);

  return (
    <Paper
      component="form"
      style={{
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: `80vw`,
      }}
    >
      <IconButton>
        <StorageIcon />
      </IconButton>
      <InputBase
        style={{
          flex: 1,
        }}
        placeholder="Search by transaction or address"
        inputProps={{ 'aria-label': 'Search' }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            await search();
            e.preventDefault();
          }
        }}
      />

      <IconButton aria-label="search" onClick={search}>
        <SearchIcon />
      </IconButton>
      <Snackbar
        open={errorMessage !== undefined}
        onClose={() => setErrorMessage(undefined)}
        autoHideDuration={6000}
      >
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
