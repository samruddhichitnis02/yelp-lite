import axios from 'axios';

const USER_AUTH_API = '/api/users';
const OWNER_AUTH_API = '/api/owners';

/**
 * User signup
 */
export const signupUser = async ({ name, email, password, location }) => {
  const response = await axios.post(`${USER_AUTH_API}/auth/user/signup`, {
    name: name.trim(),
    email: email.trim(),
    password,
    location: location ? location.trim() : '',
  });

  return response.data;
};

/**
 * Owner signup
 */
export const signupOwner = async ({ name, email, password, business_name, location }) => {
  const response = await axios.post(`${OWNER_AUTH_API}/auth/owner/signup`, {
    name: name.trim(),
    email: email.trim(),
    password,
    location: location ? location.trim() : '',
    business_name: business_name ? business_name.trim() : '',
  });

  return response.data;
};

/**
 * Owner login
 */
export const loginOwner = async ({ email, password }) => {
  const response = await axios.post(`${OWNER_AUTH_API}/auth/owner/login`, {
    email: email.trim(),
    password,
  });

  return response.data;
};

/**
 * User login
 */
export const loginUser = async ({ email, password }) => {
  const formData = new URLSearchParams();
  formData.append('username', email.trim());
  formData.append('password', password);

  const response = await axios.post(`${USER_AUTH_API}/auth/user/login`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};

/**
 * Save auth response from backend into localStorage
 */
export const saveAuthData = (data) => {
  if (!data?.access_token) return;

  localStorage.setItem('auth_token', data.access_token);
  localStorage.setItem('auth_role', data.role || '');

  if (data.user) {
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }

  if (data.owner) {
    localStorage.setItem('auth_owner', JSON.stringify(data.owner));
  }
};

/**
 * Clear auth session
 */
export const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_role');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_owner');
};

/**
 * Read helpers
 */
export const getAuthToken = () => localStorage.getItem('auth_token');

export const getAuthRole = () => localStorage.getItem('auth_role');

export const getStoredUser = () => {
  const raw = localStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
};

export const getStoredOwner = () => {
  const raw = localStorage.getItem('auth_owner');
  return raw ? JSON.parse(raw) : null;
};

export default {
  signupUser,
  signupOwner,
  loginOwner,
  loginUser,
  saveAuthData,
  clearAuthData,
  getAuthToken,
  getAuthRole,
  getStoredUser,
  getStoredOwner,
};