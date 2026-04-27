import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const RESTAURANT_API = '/api/restaurants';

export const fetchRestaurants = createAsyncThunk(
    'restaurants/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const qs = new URLSearchParams();
            if (params.name) qs.append('name', params.name);
            if (params.location) qs.append('location', params.location);
            if (params.keyword) qs.append('keyword', params.keyword);
            if (params.selectedCuisines && params.selectedCuisines.length > 0) {
                params.selectedCuisines.forEach(c => qs.append('cuisine', c));
            }

            const url = `${RESTAURANT_API}/restaurants/search?${qs.toString()}`;
            const res = await axios.get(url);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch restaurants');
        }
    }
);

export const fetchRestaurantById = createAsyncThunk(
    'restaurants/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const [restaurantRes, photosRes] = await Promise.all([
                axios.get(`${RESTAURANT_API}/restaurants/${id}`),
                axios.get(`${RESTAURANT_API}/restaurants/${id}/photos`),
            ]);
            return {
                ...restaurantRes.data,
                photos: photosRes.data || [],
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch restaurant details');
        }
    }
);

const initialState = {
    list: [],
    current: null,
    loading: false,
    error: null,
};

const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState,
    reducers: {
        clearCurrentRestaurant: (state) => {
            state.current = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch By Id
            .addCase(fetchRestaurantById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRestaurantById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload;
                state.error = null;
            })
            .addCase(fetchRestaurantById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentRestaurant } = restaurantSlice.actions;

export const selectRestaurants = (state) => state.restaurant.list;
export const selectCurrentRestaurant = (state) => state.restaurant.current;
export const selectRestaurantLoading = (state) => state.restaurant.loading;

export default restaurantSlice.reducer;
