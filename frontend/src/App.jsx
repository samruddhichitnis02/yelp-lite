import ClaimRestaurantPage from './pages/ClaimRestaurantPage';
import OwnerProfilePage from './pages/OwnerProfilePage';
import FavouritesPage from './pages/FavouritesPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import HistoryPage from './pages/HistoryPage';

import ExplorePage from './pages/ExplorePage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import EditRestaurantPage from './pages/EditRestaurantPage';

import AuthPage from './pages/AuthPage';
import UserProfilePage from './pages/UserProfilePage';
import AIAssistantChat from './components/AIAssistantChat';
import AddRestaurantPage from './pages/AddRestaurantPage';
import OwnerDashboard from './pages/OwnerDashboard';
import { Button } from 'react-bootstrap';
import { FaRobot } from 'react-icons/fa';

const NotFound = () => <div className="container mt-5 text-center"><h2>404 - Page Not Found</h2></div>;

import { useSelector, useDispatch } from 'react-redux';
import { selectAuthRole, syncAuth } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const role = useSelector(selectAuthRole);
  const isOwner = role === 'owner';

  // Keep Redux in sync whenever localStorage changes (multi-tab)
  React.useEffect(() => {
    const handleStorage = () => dispatch(syncAuth());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [dispatch]);


  // The main App component sets up the routing for the application and conditionally renders the AI Assistant chat button based on the user's role. It also includes a listener to keep the Redux store in sync with localStorage changes, which is important for handling authentication state across multiple tabs.

  // The Routes component defines the different routes for the application, including public routes (ExplorePage, AuthPage, RestaurantDetailsPage) and protected routes for regular users (UserProfilePage, FavouritesPage, HistoryPage) and restaurant owners (OwnerDashboard, AddRestaurantPage, OwnerProfilePage, ClaimRestaurantPage, EditRestaurantPage). The NotFound component is rendered for any undefined routes.

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 position-relative">
        <AppNavbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />

            {/* User Routes */}
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/favourites" element={<FavouritesPage />} />
            <Route path="/history" element={<HistoryPage />} />

            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/add-restaurant" element={<AddRestaurantPage />} />
            <Route path="/owner/profile" element={<OwnerProfilePage />} />
            <Route path="/owner/claim" element={<ClaimRestaurantPage />} />

            <Route path="/owner/edit-restaurant/:id" element={<EditRestaurantPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* AI Assistant — only visible for regular users, hidden for owners */}
        {!isOwner && (
          <>
            <Button
              variant="primary"
              className="position-fixed shadow-lg rounded-circle d-flex align-items-center justify-content-center"
              style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1040 }}
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <FaRobot size={28} />
            </Button>
            <AIAssistantChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          </>
        )}

        <footer className="bg-light text-center text-muted py-3 mt-auto">
          <div className="container">
            <small>&copy; {new Date().getFullYear()} Yelp Prototype - DS Lab 1</small>
          </div>
        </footer>
      </div>
    </Router>
  );
}


// The App component is the root component of the React application. It uses React Router to define the different routes and pages of the application, including public pages (ExplorePage, AuthPage, RestaurantDetailsPage) and protected pages for regular users (UserProfilePage, FavouritesPage, HistoryPage) and restaurant owners (OwnerDashboard, AddRestaurantPage, OwnerProfilePage, ClaimRestaurantPage, EditRestaurantPage). It also conditionally renders an AI Assistant chat button for regular users and includes a footer with copyright information.


export default App;