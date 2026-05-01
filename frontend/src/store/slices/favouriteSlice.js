import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const USER_API = '/api/users';

export const fetchFavourites = createAsyncThunk(
    'favourites/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${USER_API}/favourites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch favourites');
        }
    }
);

export const addFavourite = createAsyncThunk(
    'favourites/add',
    async (restaurantId, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.post(
                `${USER_API}/favourites/${restaurantId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Re-fetch the full list so the added restaurant appears immediately
            dispatch(fetchFavourites());
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to add favourite');
        }
    }
);

export const removeFavourite = createAsyncThunk(
    'favourites/remove',
    async (restaurantId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${USER_API}/favourites/${restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return restaurantId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to remove favourite');
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const favouriteSlice = createSlice({
    name: 'favourite',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFavourites.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFavourites.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchFavourites.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Filter by item.id — the API returns restaurant objects with `id`,
            // not `restaurant_id`, so the original filter never matched anything.
            .addCase(removeFavourite.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            .addCase(addFavourite.fulfilled, () => {
                // fetchFavourites() is dispatched inside the thunk above,
                // state will sync when that resolves.
            });
    },
});

export const selectFavourites = (state) => state.favourite.items;
export const selectFavouriteLoading = (state) => state.favourite.loading;

export default favouriteSlice.reducer;