
// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fullName: '',
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.fullName = action.payload.fullName;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.fullName = '';
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
