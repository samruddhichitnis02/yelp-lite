import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    loginUser as apiLoginUser, 
    loginOwner as apiLoginOwner,
    saveAuthData, 
    clearAuthData, 
    getAuthToken, 
    getAuthRole, 
    getStoredUser, 
    getStoredOwner 
} from '../../services/auth';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await apiLoginUser(credentials);
            saveAuthData(data);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'User login failed');
        }
    }
);

export const loginOwner = createAsyncThunk(
    'auth/loginOwner',
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await apiLoginOwner(credentials);
            saveAuthData(data);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Owner login failed');
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
    token: getAuthToken(),
    role: getAuthRole(),
    user: getStoredUser(),
    owner: getStoredOwner(),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            clearAuthData();
            state.token = null;
            state.role = null;
            state.user = null;
            state.owner = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Sync state with localStorage (useful for multi-tab or manual logout)
        syncAuth: (state) => {
            state.token = getAuthToken();
            state.role = getAuthRole();
            state.user = getStoredUser();
            state.owner = getStoredOwner();
        }
    },
    extraReducers: (builder) => {
        builder
            // User Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.role = action.payload.role;
                state.user = action.payload.user;
                state.owner = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Owner Login
            .addCase(loginOwner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginOwner.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.role = action.payload.role;
                state.owner = action.payload.owner;
                state.user = null;
            })
            .addCase(loginOwner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError, syncAuth } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectAuthUser = (state) => state.auth.user || state.auth.owner;
export const selectAuthRole = (state) => state.auth.role;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
