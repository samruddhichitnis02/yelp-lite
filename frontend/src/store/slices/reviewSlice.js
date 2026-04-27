import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


const REVIEW_API = '/api/reviews';

export const fetchReviewPhotos = createAsyncThunk(
    'reviews/fetchPhotos',
    async (reviewId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${REVIEW_API}/reviews/${reviewId}/photos`, { headers });
            return { reviewId, photos: res.data || [] };
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch review photos');
        }
    }
);

export const submitReview = createAsyncThunk(
    'reviews/submit',
    async ({ restaurantId, rating, comment }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.post(
                `${REVIEW_API}/reviews`,
                { restaurant_id: restaurantId, rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to submit review');
        }
    }
);

export const updateReview = createAsyncThunk(
    'reviews/update',
    async ({ reviewId, rating, comment }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.put(
                `${REVIEW_API}/reviews/${reviewId}`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to update review');
        }
    }
);

export const deleteReview = createAsyncThunk(
    'reviews/delete',
    async (reviewId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${REVIEW_API}/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return reviewId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to delete review');
        }
    }
);

export const uploadReviewPhoto = createAsyncThunk(
    'reviews/uploadPhoto',
    async ({ reviewId, file }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('auth_token');
            const fd = new FormData();
            fd.append('file', file);
            const res = await axios.post(
                `${REVIEW_API}/reviews/${reviewId}/photos`,
                fd,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return { reviewId, photo: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to upload photo');
        }
    }
);

const initialState = {
    photos: {}, // { reviewId: [photo, ...] }
    loading: false,
    submitting: false,
    error: null,
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearReviewError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Photos
            .addCase(fetchReviewPhotos.fulfilled, (state, action) => {
                state.photos[action.payload.reviewId] = action.payload.photos;
            })
            // Submit Review
            .addCase(submitReview.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(submitReview.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(submitReview.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateReview.pending, (state) => {
                state.submitting = true;
            })
            .addCase(updateReview.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(updateReview.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteReview.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteReview.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload Photo
            .addCase(uploadReviewPhoto.fulfilled, (state, action) => {
                if (!state.photos[action.payload.reviewId]) {
                    state.photos[action.payload.reviewId] = [];
                }
                state.photos[action.payload.reviewId].push(action.payload.photo);
            });
    },
});

export const { clearReviewError } = reviewSlice.actions;

export const selectReviewPhotos = (state) => state.review.photos;
export const selectReviewSubmitting = (state) => state.review.submitting;
export const selectReviewError = (state) => state.review.error;

export default reviewSlice.reducer;
