import { createSlice } from '@reduxjs/toolkit';

const fromSession = sessionStorage.getItem('atlas_access');
const fromLocal = localStorage.getItem('atlas_access');

const initialState = {
  user: null,
  accessToken: fromSession || fromLocal || null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken, remember } = action.payload;
      if (user) state.user = user;
      if (accessToken !== undefined) {
        state.accessToken = accessToken;
        if (remember === true) {
          localStorage.setItem('atlas_access', accessToken);
          sessionStorage.removeItem('atlas_access');
        } else if (remember === false) {
          sessionStorage.setItem('atlas_access', accessToken);
          localStorage.removeItem('atlas_access');
        } else {
          if (localStorage.getItem('atlas_access')) localStorage.setItem('atlas_access', accessToken);
          else sessionStorage.setItem('atlas_access', accessToken);
        }
      }
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      sessionStorage.removeItem('atlas_access');
      localStorage.removeItem('atlas_access');
    },
    hydrateUser(state, action) {
      state.user = action.payload;
    },
  },
});

export const { setCredentials, clearAuth, hydrateUser } = authSlice.actions;
export default authSlice.reducer;
