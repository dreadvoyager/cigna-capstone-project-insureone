import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { authService } from "../services/authService";

const persistedUser = authService.getCurrentUser();

const preloadedState = persistedUser
  ? {
      auth: {

        isAuthenticated: true,
        fullName: persistedUser.fullName || persistedUser.username || "",
      },
    }
  : undefined;

export const store = configureStore({
  reducer: {
    auth: authReducer,
    
  },
  preloadedState,
});

export default store;
