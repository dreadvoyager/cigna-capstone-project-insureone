import api from '../config/api';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';

export const authService = {
  register: async (userData) => {
    try{
          const response = await api.post('/auth/register', userData);
    return response.data;
         } catch(error){
          console.error('Register error: ',error.message);
          console.error('Error response : ',error.response);
          throw error;
         }

  },

  login: async (credentials) => {
  const response = await api.post('/auth/login', credentials);

  if (response.data.token) {
    const decoded = jwtDecode(response.data.token);

    // Extract role from claim key
    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Save custom user object
    const userObject = {
      email: decoded.email,
      role: role,  
      name:decoded.full_name,             // ★ very important
      token: response.data.token
    };

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(userObject));
    // const dispatch= useDispatch();
    // dispatch(setUser({ fullName: decoded.full_name }));
    //console.log(fullName);

    console.log("Saved User:", userObject);
  }

  return response.data;
},

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    // const userStr = localStorage.getItem('user');
    // return userStr ? JSON.parse(userStr) : null;
    
  const userData = localStorage.getItem("user");
  if (!userData || userData === "undefined") {
    return null;
  }
  try {
    return JSON.parse(userData);
    console.log();
  } catch (error) {
    console.error("Invalid JSON in localStorage:", error);
    return null;
  }

  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
