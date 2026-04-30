import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import store from './store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.jsx'



// The main entry point of the React application. It imports necessary dependencies, including React, ReactDOM, Redux Provider, and the main App component. It also imports global styles and Bootstrap CSS for styling. The createRoot function is used to render the App component wrapped in the Redux Provider to the DOM element with the id 'root'. The StrictMode component is used to enable additional checks and warnings for its descendants in development mode.

// The App component is the root component of the React application. It uses React Router to define the different routes and pages of the application, including public pages (ExplorePage, AuthPage, RestaurantDetailsPage) and protected pages for regular users (UserProfilePage, FavouritesPage, HistoryPage) and restaurant owners (OwnerDashboard, AddRestaurantPage, OwnerProfilePage, ClaimRestaurantPage, EditRestaurantPage). It also conditionally renders an AI Assistant chat button for regular users and includes a footer with copyright information.

// The main App component sets up the routing for the application and conditionally renders the AI Assistant chat button based on the user's role. It also includes a listener to keep the Redux store in sync with localStorage changes, which is important for handling authentication state across multiple tabs.

// The Routes component defines the different routes for the application, including public routes (ExplorePage, AuthPage, RestaurantDetailsPage) and protected routes for regular users (UserProfilePage, FavouritesPage, HistoryPage) and restaurant owners (OwnerDashboard, AddRestaurantPage, OwnerProfilePage, ClaimRestaurantPage, EditRestaurantPage). The NotFound component is rendered for any undefined routes.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
