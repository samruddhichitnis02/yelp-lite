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

export default App;