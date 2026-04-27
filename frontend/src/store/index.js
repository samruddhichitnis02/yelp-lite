import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import restaurantReducer from './slices/restaurantSlice';
import reviewReducer from './slices/reviewSlice';
import favouriteReducer from './slices/favouriteSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        restaurant: restaurantReducer,
        review: reviewReducer,
        favourite: favouriteReducer,
    },
});

export default store;
