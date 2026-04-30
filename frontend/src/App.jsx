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



export default App;